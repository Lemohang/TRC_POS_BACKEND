const Inventory = require("../models/Inventory.model");

/**
 * Create a new inventory item
 */
const createInventory = async (data) => {
  const existingItem = await Inventory.findOne({
    name: data.name,
  });

  if (existingItem) {
    throw new Error("Product already exists.");
  }

  const inventory = await Inventory.create(data);

  return inventory;
};

/**
 * Get all inventory items
 */
const getAllInventory = async () => {
  return await Inventory.find().sort({
    createdAt: -1,
  });
};

/**
 * Get inventory by ID
 */
const getInventoryById = async (id) => {
  const inventory = await Inventory.findById(id);

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  return inventory;
};

/**
 * Update inventory
 */
const updateInventory = async (id, data) => {
  const inventory = await Inventory.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  return inventory;
};

/**
 * Delete inventory
 */
const deleteInventory = async (id) => {
  const inventory = await Inventory.findByIdAndDelete(id);

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  return inventory;
};

/**
 * Increase stock
 */
const increaseStock = async (id, quantity) => {
  const inventory = await Inventory.findById(id);

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  inventory.stock += quantity;

  await inventory.save();

  return inventory;
};

/**
 * Decrease stock
 */
const decreaseStock = async (id, quantity) => {
  const inventory = await Inventory.findById(id);

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  if (inventory.stock < quantity) {
    throw new Error("Insufficient stock.");
  }

  inventory.stock -= quantity;

  await inventory.save();

  return inventory;
};

/**
 * Get low stock items
 */
const getLowStockItems = async () => {
  return await Inventory.find({
    $expr: {
      $lte: ["$stock", "$lowStockThreshold"],
    },
  });
};

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  increaseStock,
  decreaseStock,
  getLowStockItems,
};