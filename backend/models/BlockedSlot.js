const mongoose = require("mongoose");

const blockedSlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    slotDate: {
      type: String,
      required: true
    },

    slotTime: {
      type: String,
      default: "FULL_DAY"
    },

    reason: {
      type: String,
      default: "Leave/Holiday"
    }
  },
  { timestamps: true }
);

blockedSlotSchema.index(
  { doctor: 1, slotDate: 1, slotTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("BlockedSlot", blockedSlotSchema);