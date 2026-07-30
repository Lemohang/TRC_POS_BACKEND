const express = require('express');
const router = express.Router();

const saleController = require('../controllers/sale.controller');

// ==========================
// Create a New Order
// ==========================
router.post('/', saleController.createSale);

// ==========================
// Get Open Order By Table
// Must come before "/:id"
// ==========================
router.get('/table/:tableId', saleController.getOpenSaleByTable);

// ==========================
// Add Items to Existing Order
// ==========================
router.post('/:saleId/items', saleController.addItemsToSale);

// ==========================
// Get All Orders
// ==========================
router.get('/', saleController.getAllSales);

// ==========================
// Get Single Order
// ==========================
router.get('/:id', saleController.getSaleById);

// ==========================
// Complete Order (Customer Pays)
// ==========================
router.put('/:id/complete', saleController.completeSale);

// ==========================
// Reopen Order
// ==========================
router.put('/:id/reopen', saleController.reopenSale);

// ==========================
// Cancel Order
// ==========================
router.put('/:id/cancel', saleController.cancelSale);

module.exports = router;
