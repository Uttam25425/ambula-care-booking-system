const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    specialization: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    consultationFee: {
      type: Number,
      required: true
    },

    experience: {
      type: String,
      default: "5+ years"
    },

    bio: {
      type: String,
      default: "Experienced doctor providing quality healthcare consultation."
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);