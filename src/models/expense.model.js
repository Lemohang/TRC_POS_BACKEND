const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

<<<<<<< HEAD
=======
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },

>>>>>>> c28990666a8e3193eba32ce642609aaa0595f84a
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "Mobile Money",
        "Bank Transfer",
      ],
      required: true,
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);