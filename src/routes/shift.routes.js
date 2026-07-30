const express = require("express");
const router = express.Router();

const shiftController = require("../controllers/shift.controller");

router.get("/", shiftController.getAllShifts);

router.get("/:id", shiftController.getShiftById);

router.post("/open", shiftController.openShift);

router.put("/:id/close", shiftController.closeShift);

module.exports = router;