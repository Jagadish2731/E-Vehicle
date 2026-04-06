const express = require("express");
const {
  createBunk,
  getAllBunks,
  getNearbyBunks,
  getLocationMeta,
  searchBunksByLocation,
  updateBunk,
  deleteBunk
} = require("../controllers/bunkController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/location-meta", protect, getLocationMeta);
router.get("/search", protect, searchBunksByLocation);
router.get("/nearby", protect, getNearbyBunks);
router.get("/", protect, getAllBunks);
router.post("/", protect, authorize("admin"), createBunk);
router.put("/:id", protect, authorize("admin"), updateBunk);
router.delete("/:id", protect, authorize("admin"), deleteBunk);

module.exports = router;
