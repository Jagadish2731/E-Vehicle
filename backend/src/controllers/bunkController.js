const Bunk = require("../models/Bunk");
const Slot = require("../models/Slot");
const logAction = require("../utils/logger");

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const createBunk = async (req, res) => {
  try {
    const bunk = await Bunk.create(req.body);
    await logAction(req.user._id, "create_bunk", { bunkId: bunk._id });
    res.status(201).json(bunk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllBunks = async (req, res) => {
  const bunks = await Bunk.find().sort({ createdAt: -1 });
  const bunkIds = bunks.map((b) => b._id);
  const slots = await Slot.find({ bunk: { $in: bunkIds } });

  const slotSummary = slots.reduce((acc, slot) => {
    const key = String(slot.bunk);
    if (!acc[key]) acc[key] = { total: 0, available: 0 };
    acc[key].total += 1;
    if (slot.status === "available") acc[key].available += 1;
    return acc;
  }, {});

  const data = bunks.map((bunk) => ({
    ...bunk.toObject(),
    slotStats: slotSummary[String(bunk._id)] || { total: 0, available: 0 }
  }));

  res.json(data);
};

const getNearbyBunks = async (req, res) => {
  const { lat, lng, radiusKm = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "lat and lng query params are required" });
  }

  const baseLat = Number(lat);
  const baseLng = Number(lng);
  const radius = Number(radiusKm);

  const bunks = await Bunk.find();
  const nearby = bunks
    .map((bunk) => ({
      ...bunk.toObject(),
      distanceKm: distanceKm(baseLat, baseLng, bunk.location.lat, bunk.location.lng)
    }))
    .filter((bunk) => bunk.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(nearby);
};

const updateBunk = async (req, res) => {
  try {
    const bunk = await Bunk.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bunk) return res.status(404).json({ message: "Bunk not found" });
    await logAction(req.user._id, "update_bunk", { bunkId: bunk._id });
    res.json(bunk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBunk = async (req, res) => {
  const bunk = await Bunk.findByIdAndDelete(req.params.id);
  if (!bunk) return res.status(404).json({ message: "Bunk not found" });
  await Slot.deleteMany({ bunk: bunk._id });
  await logAction(req.user._id, "delete_bunk", { bunkId: bunk._id });
  res.json({ message: "Bunk removed" });
};

module.exports = { createBunk, getAllBunks, getNearbyBunks, updateBunk, deleteBunk };
