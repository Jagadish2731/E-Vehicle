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

    const demoUser = await User.create({
      name: "Demo User",
      email: "user@ev.com",
      mobile: "8888888888",
      password: userPassword,
      role: "user"
    });

    const priya = await User.create({
      name: "Priya Sharma",
      email: "priya@ev.com",
      mobile: "9876501111",
      password: userPassword,
      role: "user"
    });

    const rahul = await User.create({
      name: "Rahul Kumar",
      email: "rahul@ev.com",
      mobile: "9876502222",
      password: userPassword,
      role: "user"
    });

    const amit = await User.create({
      name: "Amit Patel",
      email: "amit@ev.com",
      mobile: "9876503333",
      password: userPassword,
      role: "user"
    });

    const bunkBengaluru = await Bunk.create({
      name: "City EV Bunk — MG Road",
      address: "Central Road, MG Road",
      mobile: "7777777777",
      googleMapLink: "https://maps.google.com/?q=12.9716,77.5946",
      state: "Karnataka",
      district: "Bengaluru Urban",
      city: "Bengaluru",
      area: "MG Road",
      location: { lat: 12.9716, lng: 77.5946 },
      totalSlots: 6
    });

    const bunkWhitefield = await Bunk.create({
      name: "Whitefield EV Point",
      address: "ITPL Main Road, Whitefield",
      mobile: "7766554433",
      googleMapLink: "https://maps.google.com/?q=12.9698,77.7499",
      state: "Karnataka",
      district: "Bengaluru Urban",
      city: "Bengaluru",
      area: "Whitefield",
      location: { lat: 12.9698, lng: 77.7499 },
      totalSlots: 4
    });

    const bunkPune = await Bunk.create({
      name: "Pune Highway Charge",
      address: "Mumbai-Pune Expressway service area",
      mobile: "7755443322",
      googleMapLink: "https://maps.google.com/?q=18.5204,73.8567",
      state: "Maharashtra",
      district: "Pune",
      city: "Pune",
      area: "Hinjewadi",
      location: { lat: 18.5204, lng: 73.8567 },
      totalSlots: 5
    });

    const slots = await Slot.insertMany([
      { bunk: bunkBengaluru._id, slotNumber: "A1", status: "occupied" },
      { bunk: bunkBengaluru._id, slotNumber: "A2", status: "occupied" },
      { bunk: bunkBengaluru._id, slotNumber: "A3", status: "occupied" },
      { bunk: bunkBengaluru._id, slotNumber: "A4", status: "available" },
      { bunk: bunkBengaluru._id, slotNumber: "A5", status: "available" },
      { bunk: bunkBengaluru._id, slotNumber: "A6", status: "available" },
      { bunk: bunkWhitefield._id, slotNumber: "W1", status: "occupied" },
      { bunk: bunkWhitefield._id, slotNumber: "W2", status: "available" },
      { bunk: bunkWhitefield._id, slotNumber: "W3", status: "available" },
      { bunk: bunkWhitefield._id, slotNumber: "W4", status: "available" },
      { bunk: bunkPune._id, slotNumber: "P1", status: "available" },
      { bunk: bunkPune._id, slotNumber: "P2", status: "available" },
      { bunk: bunkPune._id, slotNumber: "P3", status: "occupied" },
      { bunk: bunkPune._id, slotNumber: "P4", status: "occupied" },
      { bunk: bunkPune._id, slotNumber: "P5", status: "available" }
    ]);

    const byBunkNum = (bunkId, num) =>
      slots.find((s) => String(s.bunk) === String(bunkId) && s.slotNumber === num);

    const s = {
      b1: (n) => byBunkNum(bunkBengaluru._id, n),
      wf: (n) => byBunkNum(bunkWhitefield._id, n),
      p: (n) => byBunkNum(bunkPune._id, n)
    };

    await Booking.insertMany([
      {
        user: demoUser._id,
        bunk: bunkBengaluru._id,
        slot: s.b1("A1")._id,
        status: "booked",
        createdAt: new Date("2026-04-02T10:00:00.000Z")
      },
      {
        user: priya._id,
        bunk: bunkBengaluru._id,
        slot: s.b1("A2")._id,
        status: "charging",
        createdAt: new Date("2026-04-03T08:30:00.000Z")
      },
      {
        user: rahul._id,
        bunk: bunkBengaluru._id,
        slot: s.b1("A3")._id,
        status: "booked",
        createdAt: new Date("2026-04-05T14:15:00.000Z")
      },
      {
        user: amit._id,
        bunk: bunkPune._id,
        slot: s.p("P1")._id,
        status: "completed",
        createdAt: new Date("2026-03-28T09:00:00.000Z")
      },
      {
        user: priya._id,
        bunk: bunkPune._id,
        slot: s.p("P2")._id,
        status: "cancelled",
        createdAt: new Date("2026-03-30T11:45:00.000Z")
      },
      {
        user: demoUser._id,
        bunk: bunkWhitefield._id,
        slot: s.wf("W1")._id,
        status: "booked",
        createdAt: new Date("2026-04-06T07:00:00.000Z")
      },
      {
        user: rahul._id,
        bunk: bunkPune._id,
        slot: s.p("P3")._id,
        status: "booked",
        createdAt: new Date("2026-04-04T16:20:00.000Z")
      },
      {
        user: amit._id,
        bunk: bunkPune._id,
        slot: s.p("P4")._id,
        status: "charging",
        createdAt: new Date("2026-04-06T12:00:00.000Z")
      }
    ]);

    console.log("");
    console.log("Seed completed successfully.");
    console.log("");
    console.log("--- Admin ---");
    console.log("  Email: admin@ev.com   Password: admin123");
    console.log("");
    console.log("--- Demo users (password for all: user123) ---");
    console.log("  user@ev.com      — Demo User");
    console.log("  priya@ev.com     — Priya Sharma");
    console.log("  rahul@ev.com     — Rahul Kumar");
    console.log("  amit@ev.com      — Amit Patel");
    console.log("");
    console.log("--- Sample data ---");
    console.log("  3 bunks: Bengaluru (MG Road), Bengaluru (Whitefield), Pune (Hinjewadi)");
    console.log("  15 slots, 8 bookings (booked / charging / completed / cancelled)");
    console.log("");
    console.log("Try user search: State Karnataka, District Bengaluru Urban");
    console.log("Or: State Maharashtra, District Pune");
    console.log("");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
