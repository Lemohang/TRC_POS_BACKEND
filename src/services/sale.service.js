const mongoose = require("mongoose");

const Sale = require("../models/sale.model");
const SaleItem = require("../models/saleItem.model");
const Inventory = require("../models/inventory.model");
const Table = require("../models/table.model");
const WorkerDebt = require("../models/workerDebt.model");
<<<<<<< HEAD
=======
const counterService = require("./counter.service");
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a

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

<<<<<<< HEAD
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
=======
    // Prevent multiple open orders on the same table
    const existingSale = await Sale.findOne({
      table,
      status: "Open",
    }).session(session);

    if (existingSale) {
      throw new Error(
        `Table ${selectedTable.name} already has an open order.`
      );
    }

    // Worker debt validation
    if (paymentMethod === "Worker Debt" && !worker) {
      throw new Error(
        "Worker is required for Worker Debt purchases."
      );
    }

    // Generate order number
    const orderNumber = await counterService.getNextSequence(
      "sale",
      session
    );

    // Create sale
    const [sale] = await Sale.create(
      [
        {
          orderNumber,
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
          table,
          cashier,
          worker,
          paymentMethod,
<<<<<<< HEAD
          discount,
          subtotal: 0,
          total: 0,
          notes,
=======
          subtotal: 0,
          total: 0,
          discount,
          notes,
          status: "Open",
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
        },
      ],
      { session }
    );

    let subtotal = 0;

<<<<<<< HEAD
    // Process Sale Items
=======
    // Process sale items
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(
        session
      );

      if (!inventory) {
        throw new Error("Inventory item not found.");
      }

      if (inventory.stock < item.quantity) {
<<<<<<< HEAD
=======
        throw new Error(
          `${inventory.name} has insufficient stock.`
        );
      }

      const lineTotal =
        inventory.sellingPrice * item.quantity;

      await SaleItem.create(
        [
          {
            sale: sale._id,
            inventory: inventory._id,
            quantity: item.quantity,
            buyingPrice: inventory.buyingPrice,
            sellingPrice: inventory.sellingPrice,
            total: lineTotal,
          },
        ],
        { session }
      );

      inventory.stock -= item.quantity;

      await inventory.save({ session });

      subtotal += lineTotal;
    }

    sale.subtotal = subtotal;
    sale.total = subtotal - discount;

    await sale.save({ session });

    // Occupy table
    selectedTable.status = "Occupied";
    await selectedTable.save({ session });

    // Create worker debt if needed
    if (paymentMethod === "Worker Debt") {
      await WorkerDebt.create(
        [
          {
            worker,
            sale: sale._id,
            amount: sale.total,
            balance: sale.total,
            status: "Pending",
            createdBy: cashier,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return await Sale.findById(sale._id)
      .populate("cashier")
      .populate("worker")
      .populate("table");

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {

    session.endSession();

  }
};
const addItemsToSale = async (saleId, items) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(saleId).session(session);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    if (sale.status !== "Open") {
      throw new Error("Only open orders can be modified.");
    }

    let subtotal = sale.subtotal;

    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (!inventory) {
        throw new Error("Inventory item not found.");
      }

      if (inventory.stock < item.quantity) {
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
        throw new Error(`${inventory.name} has insufficient stock.`);
      }

      const lineTotal = inventory.sellingPrice * item.quantity;

      await SaleItem.create(
        [
          {
<<<<<<< HEAD
            sale: sale[0]._id,
=======
            sale: sale._id,
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
            inventory: inventory._id,
            quantity: item.quantity,
            buyingPrice: inventory.buyingPrice,
            sellingPrice: inventory.sellingPrice,
            total: lineTotal,
          },
        ],
        { session }
      );

<<<<<<< HEAD
      // Deduct stock
=======
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
      inventory.stock -= item.quantity;
      await inventory.save({ session });

      subtotal += lineTotal;
    }

<<<<<<< HEAD
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
=======
    sale.subtotal = subtotal;
    sale.total = subtotal - sale.discount;

    await sale.save({ session });

    await session.commitTransaction();

    return await Sale.findById(sale._id)
      .populate("cashier")
      .populate("worker")
      .populate("table");
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

<<<<<<< HEAD
const getAllSales = async () => {
  return await Sale.find()
    .populate("cashier")
    .populate("table")
    .populate("worker")
    .sort({ createdAt: -1 });
=======
const getOpenSaleByTable = async (tableId) => {
  const sale = await Sale.findOne({
    table: tableId,
    status: "Open",
  })
    .populate("cashier")
    .populate("worker")
    .populate("table");

  if (!sale) {
    throw new Error("No open order found for this table.");
  }

  const items = await SaleItem.find({
    sale: sale._id,
  }).populate("inventory");

  return {
    sale,
    items,
  };
};

const getAllSales = async () => {
  return await Sale.find()
    .populate("cashier")
    .populate("worker")
    .populate("table")
    .sort({
      orderNumber: -1,
    });
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
};

const getSaleById = async (id) => {
  const sale = await Sale.findById(id)
    .populate("cashier")
<<<<<<< HEAD
    .populate("table")
    .populate("worker");
=======
    .populate("worker")
    .populate("table");
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a

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

<<<<<<< HEAD
module.exports = {
  createSale,
  getAllSales,
  getSaleById,
=======
const completeSale = async (id) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(id).session(session);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    if (sale.status === "Paid") {
      throw new Error("Sale already completed.");
    }

    sale.status = "Paid";

    await sale.save({ session });

    await Table.findByIdAndUpdate(
      sale.table,
      {
        status: "Available",
      },
      { session }
    );

    await session.commitTransaction();

    return await Sale.findById(sale._id)
      .populate("cashier")
      .populate("worker")
      .populate("table");

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {

    session.endSession();

  }
};

const reopenSale = async (id) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(id).session(session);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    if (sale.status !== "Paid") {
      throw new Error("Only paid orders can be reopened.");
    }

    // Prevent reopening if another order is already open on the table
    const existingOpenOrder = await Sale.findOne({
      table: sale.table,
      status: "Open",
      _id: { $ne: sale._id },
    }).session(session);

    if (existingOpenOrder) {
      throw new Error("Another open order already exists for this table.");
    }

    sale.status = "Open";
    await sale.save({ session });

    await Table.findByIdAndUpdate(
      sale.table,
      {
        status: "Occupied",
      },
      { session }
    );

    await session.commitTransaction();

    return await Sale.findById(sale._id)
      .populate("cashier")
      .populate("worker")
      .populate("table");

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {

    session.endSession();

  }
};

const cancelSale = async (id) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sale = await Sale.findById(id).session(session);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    if (sale.status === "Cancelled") {
      throw new Error("Sale already cancelled.");
    }

    const items = await SaleItem.find({
      sale: sale._id,
    }).session(session);

    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (inventory) {
        inventory.stock += item.quantity;
        await inventory.save({ session });
      }
    }

    sale.status = "Cancelled";
    await sale.save({ session });

    await Table.findByIdAndUpdate(
      sale.table,
      {
        status: "Available",
      },
      { session }
    );

    await session.commitTransaction();

    return await Sale.findById(sale._id)
      .populate("cashier")
      .populate("worker")
      .populate("table");

  } catch (error) {

    await session.abortTransaction();
    throw error;

  } finally {

    session.endSession();

  }
};

module.exports = {
  createSale,
  addItemsToSale,
  getOpenSaleByTable,
  getAllSales,
  getSaleById,
  completeSale,
  reopenSale,
  cancelSale,
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
};