const express = require("express");
const Doctor = require("../models/Doctor");
const Booking = require("../models/Booking");
const BlockedSlot = require("../models/BlockedSlot");

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

const generateBookingId = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AMB-${Date.now()}-${random}`;
};

const getNext7DatesFrom = (startDate) => {
  const dates = [];
  const baseDate = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

const findNextAvailableSlot = async (doctorId, requestedDate, requestedTime) => {
  const dates = getNext7DatesFrom(requestedDate);

  const bookings = await Booking.find({
    doctor: doctorId,
    slotDate: { $in: dates },
    status: { $ne: "Cancelled" }
  });

  const blockedSlots = await BlockedSlot.find({
    doctor: doctorId,
    slotDate: { $in: dates }
  });

  for (const date of dates) {
    const bookedTimes = bookings
      .filter((booking) => booking.slotDate === date)
      .map((booking) => booking.slotTime);

    const blockedTimes = blockedSlots
      .filter((slot) => slot.slotDate === date)
      .map((slot) => slot.slotTime);

    if (blockedTimes.includes("FULL_DAY")) {
      continue;
    }

    for (const time of defaultSlots) {
      if (date === requestedDate) {
        const requestedIndex = defaultSlots.indexOf(requestedTime);
        const currentIndex = defaultSlots.indexOf(time);

        if (requestedIndex !== -1 && currentIndex <= requestedIndex) {
          continue;
        }
      }

      if (!bookedTimes.includes(time) && !blockedTimes.includes(time)) {
        return { date, time };
      }
    }
  }

  return null;
};

// Book appointment
router.post("/", async (req, res) => {
  try {
    const {
      doctorId,
      patientName,
      age,
      phone,
      slotDate,
      slotTime,
      bloodGroup,
      medicalConditions,
      currentMedications
    } = req.body;

    if (!doctorId || !patientName || !age || !phone || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required booking fields"
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const isBlocked = await BlockedSlot.findOne({
      doctor: doctorId,
      slotDate,
      $or: [{ slotTime }, { slotTime: "FULL_DAY" }]
    });

    if (isBlocked) {
      const nextAvailableSlot = await findNextAvailableSlot(
        doctorId,
        slotDate,
        slotTime
      );

      return res.status(409).json({
        success: false,
        message: "This slot is blocked by the doctor",
        nextAvailableSlot
      });
    }

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      doctor: doctorId,
      patientName,
      age,
      phone,
      slotDate,
      slotTime,
      bloodGroup,
      medicalConditions,
      currentMedications
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      booking
    });
  } catch (error) {
    if (error.code === 11000) {
      const nextAvailableSlot = await findNextAvailableSlot(
        req.body.doctorId,
        req.body.slotDate,
        req.body.slotTime
      );

      return res.status(409).json({
        success: false,
        message:
          "This slot was just booked by another patient. Please choose the next available slot.",
        nextAvailableSlot
      });
    }

    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: error.message
    });
  }
});

// Get booking confirmation by Booking ID
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId
    }).populate("doctor", "name specialization location consultationFee");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message
    });
  }
});

module.exports = router;