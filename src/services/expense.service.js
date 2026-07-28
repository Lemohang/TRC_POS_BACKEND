const Expense = require("../models/expense.model");

const createExpense = async (data) => {
  return await Expense.create(data);
};

const getAllExpenses = async () => {
  return await Expense.find()
    .populate("createdBy")
    .sort({ expenseDate: -1 });
};

const getExpenseById = async (id) => {
  const expense = await Expense.findById(id).populate("createdBy");

  if (!expense) {
    throw new Error("Expense not found.");
  }

  return expense;
};

const updateExpense = async (id, data) => {
  const expense = await Expense.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  return expense;
};

const deleteExpense = async (id) => {
  const expense = await Expense.findByIdAndDelete(id);

  if (!expense) {
    throw new Error("Expense not found.");
  }

  return expense;
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};