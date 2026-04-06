const express = require("express");
const { createSlot, getSlotsByBunk, updateSlotStatus, deleteSlot } = require("../controllers/slotController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("admin"), createSlot);
router.get("/bunk/:bunkId", protect, getSlotsByBunk);
router.patch("/:id/status", protect, authorize("admin"), updateSlotStatus);
router.delete("/:id", protect, authorize("admin"), deleteSlot);

module.exports = router;
