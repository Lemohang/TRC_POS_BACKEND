const Shift = require("../models/shift.model");
const Sale = require("../models/sale.model");
const Expense = require("../models/expense.model");
const DebtPayment = require("../models/debtPayment.model");

const generateCashUp = async (shiftId) => {
  const shift = await Shift.findById(shiftId).populate("user");

  if (!shift) {
    throw new Error("Shift not found.");
  }

  const cashSales = await Sale.aggregate([
    {
      $match: {
        shift: shift._id,
        paymentMethod: "Cash",
        status: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);

  const cardSales = await Sale.aggregate([
    {
      $match: {
        shift: shift._id,
        paymentMethod: "Card",
        status: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);

  const mobileMoneySales = await Sale.aggregate([
    {
      $match: {
        shift: shift._id,
        paymentMethod: "Mobile Money",
        status: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);

  const expenses = await Expense.aggregate([
    {
      $match: {
        shift: shift._id,
        paymentMethod: "Cash",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const debtPayments = await DebtPayment.aggregate([
    {
      $match: {
        shift: shift._id,
        paymentMethod: "Cash",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const openingCash = shift.openingCash;
  const totalCashSales = cashSales[0]?.total || 0;
  const totalCardSales = cardSales[0]?.total || 0;
  const totalMobileMoneySales = mobileMoneySales[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;
  const totalDebtPayments = debtPayments[0]?.total || 0;

  const expectedCash =
    openingCash +
    totalCashSales +
    totalDebtPayments -
    totalExpenses;

  return {
    shift,

    openingCash,

    cashSales: totalCashSales,

    cardSales: totalCardSales,

    mobileMoneySales: totalMobileMoneySales,

    debtPayments: totalDebtPayments,

    expenses: totalExpenses,

    expectedCash,
  };
};

module.exports = {
  generateCashUp,
};