const Supplier = require("../models/supplier.model");

// Create Supplier
const createSupplier = async (data) => {
  return await Supplier.create(data);
};

// Get All Suppliers
const getAllSuppliers = async () => {
  return await Supplier.find().sort({ createdAt: -1 });
};

// Get Supplier By ID
const getSupplierById = async (id) => {
  const supplier = await Supplier.findById(id);

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  return supplier;
};

// Update Supplier
const updateSupplier = async (id, data) => {
  const supplier = await Supplier.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  return supplier;
};

// Delete Supplier
const deleteSupplier = async (id) => {
  const supplier = await Supplier.findByIdAndDelete(id);

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  return supplier;
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};