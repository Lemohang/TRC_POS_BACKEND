const workerDebtPaymentService = require("../services/workerDebtPayment.service");

const createPayment = async (req, res) => {
  try {
    const payment = await workerDebtPaymentService.createPayment(req.body);

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully.",
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await workerDebtPaymentService.getAllPayments();

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await workerDebtPaymentService.getPaymentById(
      req.params.id
    );

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getPaymentsByDebt = async (req, res) => {
  try {
    const payments =
      await workerDebtPaymentService.getPaymentsByDebt(
        req.params.debtId
      );

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByDebt,
};