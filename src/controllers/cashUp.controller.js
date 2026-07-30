const cashUpService = require("../services/cashUp.service");

const generateCashUp = async (req, res) => {
  try {
    const report = await cashUpService.generateCashUp(req.params.shiftId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateCashUp,
};