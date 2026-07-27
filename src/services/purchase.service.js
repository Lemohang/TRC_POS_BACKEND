const mongoose = require("mongoose");

const Purchase = require("../models/purchase.model");
const PurchaseItem = require("../models/purchaseItem.model");
const Inventory = require("../models/inventory.model");
const Supplier = require("../models/supplier.model");

const createPurchase = async (purchaseData) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      supplier,
      invoiceNumber,
      paymentMethod,
      notes,
      createdBy,
      items,
    } = purchaseData;

    // Check supplier exists
    const supplierExists = await Supplier.findById(supplier).session(session);

    if (!supplierExists) {
      throw new Error("Supplier not found.");
    }

    // Create purchase
    const purchase = await Purchase.create(
      [
        {
          supplier,
          invoiceNumber,
          paymentMethod,
          notes,
          createdBy,
          totalCost: 0,
        },
      ],
      { session }
    );

    let totalCost = 0;

    // Process every item
    for (const item of items) {
      const inventory = await Inventory.findById(item.inventory).session(session);

      if (!inventory) {
        throw new Error("Inventory item not found.");
      }

      const itemTotal = item.quantity * item.buyingPrice;

      await PurchaseItem.create(
        [
          {
            purchase: purchase[0]._id,
            inventory: inventory._id,
            quantity: item.quantity,
            buyingPrice: item.buyingPrice,
            total: itemTotal,
          },
        ],
        { session }
      );

      // Increase stock
      inventory.stock += item.quantity;
      await inventory.save({ session });

      totalCost += itemTotal;
    }

    purchase[0].totalCost = totalCost;
    await purchase[0].save({ session });

    await session.commitTransaction();

    return await Purchase.findById(purchase[0]._id)
      .populate("supplier")
      .session(session);

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllPurchases = async () => {
  return await Purchase.find()
    .populate("supplier")
    .sort({ createdAt: -1 });
};

const getPurchaseById = async (id) => {
  const purchase = await Purchase.findById(id).populate("supplier");

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  const items = await PurchaseItem.find({
    purchase: purchase._id,
  }).populate("inventory");

  return {
    purchase,
    items,
  };
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
};