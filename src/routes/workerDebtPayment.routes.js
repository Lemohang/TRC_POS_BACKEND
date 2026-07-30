const express = require("express");

const router = express.Router();

const workerDebtPaymentController = require("../controllers/workerDebtPayment.controller");

router.post("/", workerDebtPaymentController.createPayment);

router.get("/", workerDebtPaymentController.getAllPayments);

router.get(
  "/debt/:debtId",
  workerDebtPaymentController.getPaymentsByDebt
);

router.get("/:id", workerDebtPaymentController.getPaymentById);

module.exports = router;