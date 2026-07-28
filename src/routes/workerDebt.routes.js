const express = require("express");
const router = express.Router();

const workerDebtController = require("../controllers/workerDebt.controller");

router.get("/", workerDebtController.getAllDebts);

router.get("/:id", workerDebtController.getDebtById);

router.post("/:id/payment", workerDebtController.makePayment);

module.exports = router;