const express = require("express");
const { createBooking, getMyBookings, updateBookingStatus, cancelMyBooking, getAllBookings, getBookingReport } = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("user", "admin"), createBooking);
router.get("/mine", protect, authorize("user", "admin"), getMyBookings);
router.patch("/:id/cancel", protect, authorize("user", "admin"), cancelMyBooking);
router.get("/report/summary", protect, authorize("admin"), getBookingReport);
router.get("/", protect, authorize("admin"), getAllBookings);
router.patch("/:id/status", protect, authorize("admin"), updateBookingStatus);

module.exports = router;
