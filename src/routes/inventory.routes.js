const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");

router.post("/", inventoryController.addInventory);
router.get("/", inventoryController.getInventory);
router.put("/:id", inventoryController.updateInventory);
router.delete("/:id", inventoryController.deleteInventory);

module.exports = router;