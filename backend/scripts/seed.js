require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");
const Bunk = require("../src/models/Bunk");
const Slot = require("../src/models/Slot");
const Booking = require("../src/models/Booking");
const ActionLog = require("../src/models/ActionLog");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Promise.all([
      User.deleteMany({}),
      Bunk.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      ActionLog.deleteMany({})
    ]);

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@ev.com",
      mobile: "9999999999",
      password: adminPassword,
      role: "admin"
    });

    const user = await User.create({
      name: "Demo User",
      email: "user@ev.com",
      mobile: "8888888888",
      password: userPassword,
      role: "user"
    });

    const bunk = await Bunk.create({
      name: "City EV Bunk",
      address: "Central Road, Smart City",
      mobile: "7777777777",
      googleMapLink: "https://maps.google.com",
      location: { lat: 12.9716, lng: 77.5946 },
      totalSlots: 5
    });

    await Slot.insertMany([
      { bunk: bunk._id, slotNumber: "A1", status: "available" },
      { bunk: bunk._id, slotNumber: "A2", status: "available" },
      { bunk: bunk._id, slotNumber: "A3", status: "occupied" }
    ]);

    console.log("Seed completed");
    console.log("Admin login: admin@ev.com / admin123");
    console.log("User login: user@ev.com / user123");
    console.log("Admin ID:", admin._id.toString());
    console.log("User ID:", user._id.toString());
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
