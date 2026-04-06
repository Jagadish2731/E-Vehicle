const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const User = require("../models/User");
const Bunk = require("../models/Bunk");
const logAction = require("../utils/logger");

const createBooking = async (req, res) => {
  try {
    const { bunk, slot } = req.body;

    const selectedSlot = await Slot.findById(slot);
    if (!selectedSlot) return res.status(404).json({ message: "Slot not found" });
    if (selectedSlot.status !== "available") {
      return res.status(400).json({ message: "Slot is not available" });
    }

    selectedSlot.status = "occupied";
    await selectedSlot.save();

    const booking = await Booking.create({ user: req.user._id, bunk, slot, status: "booked" });
    await logAction(req.user._id, "create_booking", { bookingId: booking._id, slotId: slot });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("bunk", "name address")
    .populate("slot", "slotNumber status")
    .sort({ createdAt: -1 });
  res.json(bookings);
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    await booking.save();

    if (["completed", "cancelled"].includes(req.body.status)) {
      await Slot.findByIdAndUpdate(booking.slot, { status: "available" });
    }

    await logAction(req.user._id, "update_booking_status", { bookingId: booking._id, status: req.body.status });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({ message: "Booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();
    await Slot.findByIdAndUpdate(booking.slot, { status: "available" });

    await logAction(req.user._id, "cancel_my_booking", { bookingId: booking._id });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const q = (req.query.q || "").trim();

    const match = {};
    if (req.query.status) match.status = req.query.status;
    if (req.query.from || req.query.to) {
      match.createdAt = {};
      if (req.query.from) match.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) match.createdAt.$lte = new Date(req.query.to);
    }

    const pipeline = [{ $match: match }];

    pipeline.push(
      { $lookup: { from: User.collection.name, localField: "user", foreignField: "_id", as: "userDoc" } },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: Bunk.collection.name, localField: "bunk", foreignField: "_id", as: "bunkDoc" } },
      { $unwind: { path: "$bunkDoc", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: Slot.collection.name, localField: "slot", foreignField: "_id", as: "slotDoc" } },
      { $unwind: { path: "$slotDoc", preserveNullAndEmptyArrays: true } }
    );

    if (q) {
      const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escape(q), "i");
      pipeline.push({
        $match: {
          $or: [
            { "userDoc.name": rx },
            { "userDoc.email": rx },
            { "bunkDoc.name": rx },
            { "slotDoc.slotNumber": rx },
            { status: rx }
          ]
        }
      });
    }

    let sortField = {};
    if (sortBy === "status") sortField = { status: sortOrder };
    else if (sortBy === "user") sortField = { "userDoc.name": sortOrder };
    else if (sortBy === "email") sortField = { "userDoc.email": sortOrder };
    else if (sortBy === "bunk") sortField = { "bunkDoc.name": sortOrder };
    else if (sortBy === "slot") sortField = { "slotDoc.slotNumber": sortOrder };
    else sortField = { createdAt: sortOrder };

    pipeline.push({ $sort: sortField });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    });

    const result = await Booking.aggregate(pipeline);
    const row = result[0] || { metadata: [], data: [] };
    const total = row.metadata[0]?.total || 0;
    const items = (row.data || []).map((doc) => ({
      _id: doc._id,
      user: doc.userDoc ? { name: doc.userDoc.name, email: doc.userDoc.email } : null,
      bunk: doc.bunkDoc ? { name: doc.bunkDoc.name } : null,
      slot: doc.slotDoc ? { slotNumber: doc.slotDoc.slotNumber } : null,
      status: doc.status,
      createdAt: doc.createdAt
    }));

    res.json({ items, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingReport = async (req, res) => {
  const report = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const totals = report.reduce(
    (acc, item) => ({ ...acc, [item._id]: item.count }),
    { booked: 0, charging: 0, completed: 0, cancelled: 0 }
  );
  totals.total = Object.values(totals).reduce((sum, value) => sum + value, 0);

  res.json(totals);
};

module.exports = { createBooking, getMyBookings, updateBookingStatus, cancelMyBooking, getAllBookings, getBookingReport };
