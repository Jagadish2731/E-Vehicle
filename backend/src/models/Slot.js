const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    bunk: { type: mongoose.Schema.Types.ObjectId, ref: "Bunk", required: true },
    slotNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ["available", "occupied"], default: "available" }
  },
  { timestamps: true }
);

slotSchema.index({ bunk: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model("Slot", slotSchema);
