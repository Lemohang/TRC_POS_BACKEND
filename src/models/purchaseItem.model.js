const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    buyingPrice: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    status: {
       type: String,
       enum: ["Pending", "Completed", "Cancelled"],
       default: "Completed",
   },
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PurchaseItem", purchaseItemSchema);