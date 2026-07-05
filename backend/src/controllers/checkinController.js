import Checkin from "../models/Checkin.js";

export const createCheckin = async (req, res, next) => {
  try {
    const {
      guestName,
      email,
      phone,
      roomNumber,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      idProof,
      idProofNumber,
      status,
    } = req.body;

    if (
      !guestName ||
      !email ||
      !phone ||
      !roomNumber ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfGuests ||
      !idProof ||
      !idProofNumber ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const checkin = await Checkin.create({
      guestName,
      email,
      phone,
      roomNumber,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      idProof,
      idProofNumber,
      status,
    });
    return res.status(201).json({
      success: true,
      message: "Check-in created successfully",
      checkin,
    });
  } catch (err) {
    next(err);
  }
};

export const getCheckins = async (req, res, next) => {
  try {
    const checkins = await Checkin.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Check-ins retrieved successfully",
      checkins,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCheckin = async (req, res, next) => {
  try {
    const checkin = await Checkin.findByIdAndDelete(req.params.id);
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: "Check-in not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Check-in deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateCheckin = async (req, res, next) => {
  try {
    const checkin = await Checkin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!checkin) {
      return res.status(404).json({
        success: false,
        message: "Check-in not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Check-in updated successfully",
      checkin,
    });
  } catch (err) {
    next(err);
  }
};
