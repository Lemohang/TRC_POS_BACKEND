const saleService = require('../services/sale.service');

const createSale = async (req, res) => {
  console.log('SALE DATA:', req.body);
  try {
    const sale = await saleService.createSale(req.body);
    res.status(201).json({ success: true, message: 'Order created successfully.', data: sale });
  } catch (error) {
    console.error('CREATE SALE ERROR:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================
// Add Items to Existing Order
// ==========================
const addItemsToSale = async (req, res) => {
  try {
    const sale = await saleService.addItemsToSale(req.params.saleId, req.body.items);

    res.json({
      success: true,
      message: 'Items added successfully.',
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Open Order By Table
// ==========================
const getOpenSaleByTable = async (req, res) => {
  try {
    const sale = await saleService.getOpenSaleByTable(req.params.tableId);

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Orders
// ==========================
const getAllSales = async (req, res) => {
  try {
    const sales = await saleService.getAllSales();

    res.json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Order By ID
// ==========================
const getSaleById = async (req, res) => {
  try {
    const sale = await saleService.getSaleById(req.params.id);

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Complete Order (Customer Pays)
// ==========================
const completeSale = async (req, res) => {
  try {
    const sale = await saleService.completeSale(req.params.id);

    res.json({
      success: true,
      message: 'Order completed successfully.',
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Reopen Order
// ==========================
const reopenSale = async (req, res) => {
  try {
    const sale = await saleService.reopenSale(req.params.id);

    res.json({
      success: true,
      message: 'Order reopened successfully.',
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Cancel Order
// ==========================
const cancelSale = async (req, res) => {
  try {
    const sale = await saleService.cancelSale(req.params.id);

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
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
};
