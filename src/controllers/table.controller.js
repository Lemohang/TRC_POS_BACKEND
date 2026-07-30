const tableService = require("../services/table.service");

const createTable = async (req, res) => {
  try {
    const table = await tableService.createTable(req.body);

    res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTables = async (req, res) => {
  try {
    const tables = await tableService.getAllTables();

    res.json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body);

    res.json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTable = async (req, res) => {
  try {
    await tableService.deleteTable(req.params.id);

    res.json({
      success: true,
      message: "Table deleted successfully.",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
};