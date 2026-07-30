const Shift = require("../models/shift.model");

const openShift = async (data) => {
  const existingShift = await Shift.findOne({
    user: data.user,
    status: "Open",
  });

  if (existingShift) {
    throw new Error("User already has an open shift.");
  }

  return await Shift.create(data);
};

const getAllShifts = async () => {
  return await Shift.find()
    .populate("user")
    .sort({ openedAt: -1 });
};

const getShiftById = async (id) => {
  const shift = await Shift.findById(id).populate("user");

  if (!shift) {
    throw new Error("Shift not found.");
  }

  return shift;
};

const closeShift = async (id, data) => {
  const shift = await Shift.findById(id);

  if (!shift) {
    throw new Error("Shift not found.");
  }

  if (shift.status === "Closed") {
    throw new Error("Shift is already closed.");
  }

  shift.closingCash = data.closingCash;
  shift.expectedCash = data.expectedCash;
  shift.cashDifference = data.closingCash - data.expectedCash;
  shift.status = "Closed";
  shift.closedAt = new Date();

  await shift.save();

  return shift.populate("user");
};

module.exports = {
  openShift,
  getAllShifts,
  getShiftById,
  closeShift,
};