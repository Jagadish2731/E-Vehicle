const ActionLog = require("../models/ActionLog");

const logAction = async (userId, action, details = {}) => {
  try {
    await ActionLog.create({ user: userId || null, action, details });
  } catch (error) {
    console.error("Failed to write action log:", error.message);
  }
};

module.exports = logAction;
