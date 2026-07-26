const inventoryService = require("../services/inventory.service");

const addInventory = async (req, res) => {
  try {
    const inventory = await inventoryService.createInventory(req.body);

    res.status(201).json({
      success: true,
      message: "Inventory created successfully.",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await inventoryService.getAllInventory();

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await inventoryService.getInventoryById(req.params.id);

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateInventory = async (req, res) => {
  try {
    const inventory = await inventoryService.updateInventory(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteInventory = async (req, res) => {
  try {
    await inventoryService.deleteInventory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully.",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
};