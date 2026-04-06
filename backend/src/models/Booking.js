const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bunk: { type: mongoose.Schema.Types.ObjectId, ref: "Bunk", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    bookingTime: { type: Date, default: Date.now },
    status: { type: String, enum: ["booked", "charging", "completed", "cancelled"], default: "booked" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
