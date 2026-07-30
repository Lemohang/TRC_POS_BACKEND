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
<<<<<<< HEAD
=======
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },
>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DebtPayment", debtPaymentSchema);