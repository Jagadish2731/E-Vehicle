const mongoose = require("mongoose");

const bunkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    googleMapLink: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    totalSlots: { type: Number, required: true, min: 0, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bunk", bunkSchema);
