const express = require("express");
const router = express.Router();

const {
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require("../controllers/inventoryItem.controller");

router.post("/", createInventoryItem);
router.get("/", getInventoryItems);
router.get("/:id", getInventoryItem);
router.put("/:id", updateInventoryItem);
router.delete("/:id", deleteInventoryItem);

module.exports = router;