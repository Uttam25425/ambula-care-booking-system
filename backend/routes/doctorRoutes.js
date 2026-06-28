const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Doctor = require("../models/Doctor");
const Booking = require("../models/Booking");
const BlockedSlot = require("../models/BlockedSlot");
const { protectDoctor } = require("../middleware/authMiddleware");

const router = express.Router();

const defaultSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM"
];

const getNext7Dates = () => {
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

// Register doctor
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      location,
      consultationFee,
      experience,
      bio
    } = req.body;

    if (!name || !email || !password || !specialization || !location || !consultationFee) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      location,
      consultationFee,
      experience,
      bio
    });

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        location: doctor.location
      },
      token: generateToken(doctor._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Doctor registration failed",
      error: error.message
    });
  }
});

// Doctor login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        location: doctor.location
      },
      token: generateToken(doctor._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
});

// Search doctors
router.get("/", async (req, res) => {
  try {
    const { search, specialization, location } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const doctors = await Doctor.find(query).select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message
    });
  }
});

// Doctor profile with next 7 days available slots
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const next7Dates = getNext7Dates();

    const bookings = await Booking.find({
      doctor: doctor._id,
      slotDate: { $in: next7Dates },
      status: { $ne: "Cancelled" }
    });

    const blockedSlots = await BlockedSlot.find({
      doctor: doctor._id,
      slotDate: { $in: next7Dates }
    });

    const availableSlots = next7Dates.map((date) => {
      const bookedTimes = bookings
        .filter((booking) => booking.slotDate === date)
        .map((booking) => booking.slotTime);

      const blockedTimes = blockedSlots
        .filter((slot) => slot.slotDate === date)
        .map((slot) => slot.slotTime);

      const isFullDayBlocked = blockedTimes.includes("FULL_DAY");

      return {
        date,
        slots: isFullDayBlocked
          ? []
          : defaultSlots.filter(
              (time) => !bookedTimes.includes(time) && !blockedTimes.includes(time)
            )
      };
    });

    res.json({
      success: true,
      doctor,
      availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message
    });
  }
});

// Doctor dashboard - today's appointments
router.get("/dashboard/today", protectDoctor, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const appointments = await Booking.find({
      doctor: req.doctor._id,
      slotDate: today
    }).sort({ slotTime: 1 });

    res.json({
      success: true,
      date: today,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard",
      error: error.message
    });
  }
});

// Add diagnosis notes and prescription
router.put("/appointments/:bookingId/consultation", protectDoctor, async (req, res) => {
  try {
    const { diagnosisNotes, prescription } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      doctor: req.doctor._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    booking.diagnosisNotes = diagnosisNotes || booking.diagnosisNotes;
    booking.prescription = prescription || booking.prescription;
    booking.status = "Completed";

    await booking.save();

    res.json({
      success: true,
      message: "Consultation updated successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update consultation",
      error: error.message
    });
  }
});

// Block full day or single time slot
router.post("/block-slot", protectDoctor, async (req, res) => {
  try {
    const { slotDate, slotTime, reason } = req.body;

    if (!slotDate) {
      return res.status(400).json({
        success: false,
        message: "slotDate is required"
      });
    }

    const blockedSlot = await BlockedSlot.create({
      doctor: req.doctor._id,
      slotDate,
      slotTime: slotTime || "FULL_DAY",
      reason: reason || "Leave/Holiday"
    });

    res.status(201).json({
      success: true,
      message: "Slot blocked successfully",
      blockedSlot
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This slot is already blocked"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to block slot",
      error: error.message
    });
  }
});

module.exports = router;