const mongoose = require("mongoose");

const debtPaymentSchema = new mongoose.Schema(
  {
    debt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerDebt",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Mobile Money", "Bank Transfer"],
      required: true,
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

module.exports = mongoose.model("DebtPayment", debtPaymentSchema);