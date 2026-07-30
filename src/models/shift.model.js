const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    openingCash: {
      type: Number,
      required: true,
      min: 0,
    },

    closingCash: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedCash: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashDifference: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },

    openedAt: {
      type: Date,
      default: Date.now,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);