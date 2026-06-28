const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    patientName: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    slotDate: {
      type: String,
      required: true
    },

    slotTime: {
      type: String,
      required: true
    },

    bloodGroup: {
      type: String,
      default: ""
    },

    medicalConditions: {
      type: String,
      default: ""
    },

    currentMedications: {
      type: String,
      default: ""
    },

    diagnosisNotes: {
      type: String,
      default: ""
    },

    prescription: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Booked", "Completed", "Cancelled"],
      default: "Booked"
    }
  },
  { timestamps: true }
);

/*
Double-booking prevention:
Same doctor + same date + same time par sirf one booking allowed.
Ye backend/database level protection hai.
*/
bookingSchema.index(
  { doctor: 1, slotDate: 1, slotTime: 1 },
  { unique: true }
);

module.exports = mongoose.model("Booking", bookingSchema);