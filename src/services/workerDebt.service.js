const WorkerDebt = require("../models/workerDebt.model");
const DebtPayment = require("../models/debtPayment.model");

const getAllDebts = async () => {
  return await WorkerDebt.find()
    .populate("worker")
    .populate("sale")
    .populate("createdBy")
    .sort({ createdAt: -1 });
};

const getDebtById = async (id) => {
  const debt = await WorkerDebt.findById(id)
    .populate("worker")
    .populate("sale")
    .populate("createdBy");

  if (!debt) {
    throw new Error("Worker debt not found.");
  }

  const payments = await DebtPayment.find({
    debt: debt._id,
  }).populate("receivedBy");

  return {
    debt,
    payments,
  };
};

const makePayment = async (debtId, paymentData) => {
  const { amount, paymentMethod, receivedBy } = paymentData;

  const debt = await WorkerDebt.findById(debtId);

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
    throw new Error("Payment exceeds remaining balance.");
  }

  await DebtPayment.create({
    debt: debt._id,
    amount,
    paymentMethod,
    receivedBy,
  });

  debt.balance -= amount;

  if (debt.balance === 0) {
    debt.status = "Paid";
  } else {
    debt.status = "Partially Paid";
  }

  await debt.save();

  return await WorkerDebt.findById(debt._id)
    .populate("worker")
    .populate("sale");
};

module.exports = {
  getAllDebts,
  getDebtById,
  makePayment,
};