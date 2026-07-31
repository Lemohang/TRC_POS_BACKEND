import express from "express";

import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryItem.controller.js";

const router = express.Router();

router.post("/", createInventoryItem);

router.get("/", getInventoryItems);

router.get("/:id", getInventoryItem);

router.put("/:id", updateInventoryItem);

router.delete("/:id", deleteInventoryItem);

export default router;