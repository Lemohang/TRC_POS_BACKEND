const shiftService = require("../services/shift.service");

const openShift = async (req, res) => {
  try {
    const shift = await shiftService.openShift(req.body);

    res.status(201).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftService.getAllShifts();

    res.json({
      success: true,
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getShiftById = async (req, res) => {
  try {
    const shift = await shiftService.getShiftById(req.params.id);

    res.json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const closeShift = async (req, res) => {
  try {
    const shift = await shiftService.closeShift(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Shift closed successfully.",
      data: shift,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  openShift,
  getAllShifts,
  getShiftById,
  closeShift,
};