const Table = require("../models/table.model");

// Create Table
const createTable = async (data) => {
  return await Table.create(data);
};

// Get All Tables
const getAllTables = async () => {
  return await Table.find().sort({ name: 1 });
};

// Get Table By ID
const getTableById = async (id) => {
  const table = await Table.findById(id);

  if (!table) {
    throw new Error("Table not found.");
  }

  return table;
};

// Update Table
const updateTable = async (id, data) => {
  const table = await Table.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!table) {
    throw new Error("Table not found.");
  }

  return table;
};

// Delete Table
const deleteTable = async (id) => {
  const table = await Table.findByIdAndDelete(id);

  if (!table) {
    throw new Error("Table not found.");
  }

  return table;
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
};