const purchaseService = require("../services/purchase.service");

const createPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.createPurchase(req.body);

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const purchases = await purchaseService.getAllPurchases();

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);

    res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
};