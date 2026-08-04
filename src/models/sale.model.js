const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
      index: true,
    },

    saleType: {
      type: String,
      enum: ['table', 'walk-in'],
      required: true,
      default: 'table',
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: function () {
        return this.saleType === 'table';
      },
      default: null,
    },

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },

    items: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

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
      enum: ['Cash', 'Card', 'Credit'],
      required: true,
    },

    status: {
      type: String,
      enum: ['Open', 'Paid', 'Cancelled'],
      default: 'Open',
    },

    notes: {
      type: String,
      trim: true,
    },
    customerType: {
      type: String,
      enum: ['Worker', 'Customer'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
