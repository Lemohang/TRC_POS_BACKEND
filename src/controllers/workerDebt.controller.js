const workerDebtService = require("../services/workerDebt.service");

const getAllDebts = async (req, res) => {
  try {
    const debts = await workerDebtService.getAllDebts();

    res.json({
      success: true,
      count: debts.length,
      data: debts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDebtById = async (req, res) => {
  try {
    const debt = await workerDebtService.getDebtById(req.params.id);

    res.json({
      success: true,
      data: debt,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const makePayment = async (req, res) => {
  try {
    const debt = await workerDebtService.makePayment(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Payment recorded successfully.",
      data: debt,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllDebts,
  getDebtById,
  makePayment,
};