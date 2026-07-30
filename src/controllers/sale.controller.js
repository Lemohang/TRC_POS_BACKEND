const saleService = require("../services/sale.service");

// Create Sale
const createSale = async (req, res) => {
  try {
    const sale = await saleService.createSale(req.body);

    res.status(201).json({
      success: true,
      message: "Sale completed successfully.",
      data: sale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Sales
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

// Get Sale By ID
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

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
};