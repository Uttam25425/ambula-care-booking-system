const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Doctor = require("../models/Doctor");

dotenv.config();
connectDB();

const seedDoctors = async () => {
  try {
    await Doctor.deleteMany();

    const doctors = [
      {
        name: "Dr. Priya Sharma",
        email: "priya@ambula.com",
        password: await bcrypt.hash("123456", 10),
        specialization: "Cardiologist",
        location: "Bhubaneswar",
        consultationFee: 600,
        experience: "8+ years",
        bio: "Heart specialist with experience in preventive cardiac care."
      },
      {
        name: "Dr. Amit Verma",
        email: "amit@ambula.com",
        password: await bcrypt.hash("123456", 10),
        specialization: "Dermatologist",
        location: "Cuttack",
        consultationFee: 500,
        experience: "6+ years",
        bio: "Skin and hair care specialist for common and advanced conditions."
      },
      {
        name: "Dr. Sneha Patnaik",
        email: "sneha@ambula.com",
        password: await bcrypt.hash("123456", 10),
        specialization: "General Physician",
        location: "Bhubaneswar",
        consultationFee: 400,
        experience: "5+ years",
        bio: "General physician for fever, infection, diabetes and regular checkups."
      }
    ];

    await Doctor.insertMany(doctors);

    console.log("✅ Sample doctors inserted successfully");
    console.log("Doctor login test credentials:");
    console.log("Email: priya@ambula.com");
    console.log("Password: 123456");

    process.exit();
  } catch (error) {
    console.log("❌ Seed failed");
    console.log(error.message);
    process.exit(1);
  }
};

seedDoctors();