const mongoose = require("mongoose");

const workerDebtPaymentSchema = new mongoose.Schema(
  {
    workerDebt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerDebt",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    notes: {
      type: String,
      trim: true,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WorkerDebtPayment",
  workerDebtPaymentSchema
);