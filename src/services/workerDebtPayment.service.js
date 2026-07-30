const WorkerDebtPayment = require("../models/workerDebtPayment.model");
const WorkerDebt = require("../models/workerDebt.model");

const createPayment = async (paymentData) => {
  const { workerDebt, amount, notes, receivedBy } = paymentData;

  const debt = await WorkerDebt.findById(workerDebt);

  if (!debt) {
    throw new Error("Worker debt not found.");
  }

  if (debt.status === "Paid") {
    throw new Error("This debt has already been paid.");
  }

  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  if (amount > debt.balance) {
    throw new Error("Payment cannot exceed remaining balance.");
  }

  const payment = await WorkerDebtPayment.create({
    workerDebt,
    amount,
    notes,
    receivedBy,
  });

  debt.balance -= amount;

  if (debt.balance === 0) {
    debt.status = "Paid";
  }

  await debt.save();

  return await WorkerDebtPayment.findById(payment._id)
    .populate({
      path: "workerDebt",
      populate: {
        path: "worker",
      },
    })
    .populate("receivedBy");
};

const getAllPayments = async () => {
  return await WorkerDebtPayment.find()
    .populate({
      path: "workerDebt",
      populate: {
        path: "worker",
      },
    })
    .populate("receivedBy")
    .sort({ createdAt: -1 });
};

const getPaymentById = async (id) => {
  const payment = await WorkerDebtPayment.findById(id)
    .populate({
      path: "workerDebt",
      populate: {
        path: "worker",
      },
    })
    .populate("receivedBy");

  if (!payment) {
    throw new Error("Payment not found.");
  }

  return payment;
};

const getPaymentsByDebt = async (debtId) => {
  return await WorkerDebtPayment.find({
    workerDebt: debtId,
  })
    .populate("receivedBy")
    .sort({ createdAt: -1 });
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByDebt,
};