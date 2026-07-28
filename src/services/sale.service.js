const mongoose = require("mongoose");

const Sale = require("../models/sale.model");
const SaleItem = require("../models/saleItem.model");
const Inventory = require("../models/inventory.model");
const Table = require("../models/table.model");
const WorkerDebt = require("../models/workerDebt.model");

const createSale = async (saleData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      table,
      cashier,
      worker,
      paymentMethod,
      discount = 0,
      notes,
      items,
    } = saleData;

    if (!items || items.length === 0) {
      throw new Error("Sale must contain at least one item.");
    }

    // Validate table
    const selectedTable = await Table.findById(table).session(session);

    if (!selectedTable) {
      throw new Error("Table not found.");
    }

    // Worker is required for Worker Debt sales
    if (paymentMethod === "Worker Debt" && !worker) {
      throw new Error(
        "Worker is required when payment method is Worker Debt."
      );
    }

    // Create Sale
    const sale = await Sale.create(
      [
        {
          table,
          cashier,
          worker,
          paymentMethod,
          discount,
          subtotal: 0,
          total: 0,
          notes,
        },
      ],
      { session }
    );

    let subtotal = 0;

    // Process Sale Items
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(
        session
      );

      if (!inventory) {
        throw new Error("Inventory item not found.");
      }

      if (inventory.stock < item.quantity) {
        throw new Error(`${inventory.name} has insufficient stock.`);
      }

      const lineTotal = inventory.sellingPrice * item.quantity;

      await SaleItem.create(
        [
          {
            sale: sale[0]._id,
            inventory: inventory._id,
            quantity: item.quantity,
            buyingPrice: inventory.buyingPrice,
            sellingPrice: inventory.sellingPrice,
            total: lineTotal,
          },
        ],
        { session }
      );

      // Deduct stock
      inventory.stock -= item.quantity;
      await inventory.save({ session });

      subtotal += lineTotal;
    }

    // Calculate totals
    sale[0].subtotal = subtotal;
    sale[0].total = subtotal - discount;

    await sale[0].save({ session });

    // Automatically create Worker Debt
    if (paymentMethod === "Worker Debt") {
      await WorkerDebt.create(
        [
          {
            worker,
            sale: sale[0]._id,
            amount: sale[0].total,
            balance: sale[0].total,
            status: "Pending",
            createdBy: cashier,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return await Sale.findById(sale[0]._id)
      .populate("cashier")
      .populate("table")
      .populate("worker");

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllSales = async () => {
  return await Sale.find()
    .populate("cashier")
    .populate("table")
    .populate("worker")
    .sort({ createdAt: -1 });
};

const getSaleById = async (id) => {
  const sale = await Sale.findById(id)
    .populate("cashier")
    .populate("table")
    .populate("worker");

  if (!sale) {
    throw new Error("Sale not found.");
  }

  const items = await SaleItem.find({
    sale: sale._id,
  }).populate("inventory");

  return {
    sale,
    items,
  };
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
};