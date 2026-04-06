const Slot = require("../models/Slot");
const Bunk = require("../models/Bunk");
const logAction = require("../utils/logger");

const createSlot = async (req, res) => {
  try {
    const { bunk, slotNumber, status } = req.body;
    const bunkExists = await Bunk.findById(bunk);
    if (!bunkExists) return res.status(404).json({ message: "Bunk not found" });

    const slot = await Slot.create({ bunk, slotNumber, status });
    await logAction(req.user._id, "create_slot", { slotId: slot._id, bunkId: bunk });
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSlotsByBunk = async (req, res) => {
  const slots = await Slot.find({ bunk: req.params.bunkId }).sort({ createdAt: -1 });
  res.json(slots);
};

const updateSlotStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const slot = await Slot.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    await logAction(req.user._id, "update_slot_status", { slotId: slot._id, status });
    res.json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSlot = async (req, res) => {
  const slot = await Slot.findByIdAndDelete(req.params.id);
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  await logAction(req.user._id, "delete_slot", { slotId: slot._id });
  res.json({ message: "Slot removed" });
};

module.exports = { createSlot, getSlotsByBunk, updateSlotStatus, deleteSlot };
