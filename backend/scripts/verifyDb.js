require("dotenv").config();
const mongoose = require("mongoose");

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const users = await db.collection("users").countDocuments();
    const bunks = await db.collection("bunks").countDocuments();
    const slots = await db.collection("slots").countDocuments();
    const bookings = await db.collection("bookings").countDocuments();

    console.log("MongoDB (", mongoose.connection.name, ")");
    console.log("  users:   ", users, " (expected after seed: 5 = 1 admin + 4 users)");
    console.log("  bunks:   ", bunks, " (expected: 3)");
    console.log("  slots:   ", slots, " (expected: 15)");
    console.log("  bookings:", bookings, " (expected: 8)");
    process.exit(0);
  } catch (e) {
    console.error("Verify failed:", e.message);
    console.error("Is MongoDB running? Check MONGO_URI in backend/.env");
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
