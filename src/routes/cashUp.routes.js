const express = require("express");
const router = express.Router();

const cashUpController = require("../controllers/cashUp.controller");

router.get("/:shiftId", cashUpController.generateCashUp);

module.exports = router;