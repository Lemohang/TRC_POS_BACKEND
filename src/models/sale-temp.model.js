const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
      index: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Will become required after JWT authentication
    },

    // Worker making the purchase on credit (optional)
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },

    //shift
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Mobile Money', 'Bank Transfer', 'Worker Debt'],
      required: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Completed',
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

module.exports = mongoose.model('Sale', saleSchema);
