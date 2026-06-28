const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

const protectDoctor = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.doctor = await Doctor.findById(decoded.id).select("-password");

    if (!req.doctor) {
      return res.status(401).json({
        success: false,
        message: "Doctor not found"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed"
    });
  }
};

module.exports = { protectDoctor };