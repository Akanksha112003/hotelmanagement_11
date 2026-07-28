import mongoose from "mongoose";
import Room from "../models/room.js";

const ALLOWED_TYPES = ["single", "double", "suite", "deluxe", "presidential"];
const ALLOWED_STATUSES = ["available", "occupied", "maintenance", "reserved", "dirty"];

/**
 * GET /api/rooms
 * Get all rooms, sorted by roomNumber
 */
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rooms/:id
 * Get a single room by ID
 */
export const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rooms
 * Create a new room (prevents duplicate roomNumber)
 */
export const createRoom = async (req, res, next) => {
  try {
    const {
      roomNumber,
      type,
      floor,
      capacity,
      pricePerNight,
      status,
      amenities,
      description,
    } = req.body;

    if (!roomNumber || !roomNumber.toString().trim()) {
      return res.status(400).json({ success: false, message: "Room number is required" });
    }
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Room type is required. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      });
    }
    if (!floor || Number(floor) < 1) {
      return res.status(400).json({ success: false, message: "Floor must be at least 1" });
    }
    if (!capacity || Number(capacity) < 1) {
      return res.status(400).json({ success: false, message: "Capacity must be at least 1" });
    }
    if (pricePerNight === undefined || pricePerNight === null || Number(pricePerNight) < 0) {
      return res.status(400).json({ success: false, message: "Price per night must be a non-negative number" });
    }

    // Prevent duplicate room number
    const existing = await Room.findOne({ roomNumber: String(roomNumber).trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Room number already exists" });
    }

    const room = await Room.create({
      roomNumber: String(roomNumber).trim(),
      type,
      floor: Number(floor),
      capacity: Number(capacity),
      pricePerNight: Number(pricePerNight),
      status: status && ALLOWED_STATUSES.includes(status) ? status : "available",
      amenities: Array.isArray(amenities) ? amenities.filter(Boolean) : [],
      description: description ? String(description).trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rooms/:id
 * Update a room's full details
 */
export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const {
      roomNumber,
      type,
      floor,
      capacity,
      pricePerNight,
      status,
      amenities,
      description,
    } = req.body;

    // If changing roomNumber, check for conflicts with another room
    if (roomNumber) {
      const conflict = await Room.findOne({
        roomNumber: String(roomNumber).trim(),
        _id: { $ne: id },
      });
      if (conflict) {
        return res.status(400).json({ success: false, message: "Room number already exists" });
      }
    }

    if (type && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid room type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const updateFields = {};
    if (roomNumber !== undefined) updateFields.roomNumber = String(roomNumber).trim();
    if (type !== undefined) updateFields.type = type;
    if (floor !== undefined) updateFields.floor = Number(floor);
    if (capacity !== undefined) updateFields.capacity = Number(capacity);
    if (pricePerNight !== undefined) updateFields.pricePerNight = Number(pricePerNight);
    if (status !== undefined) updateFields.status = status;
    if (amenities !== undefined) updateFields.amenities = Array.isArray(amenities) ? amenities.filter(Boolean) : [];
    if (description !== undefined) updateFields.description = String(description).trim();

    const room = await Room.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/rooms/:id/status
 * Update only the status of a room
 */
export const updateRoomStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const room = await Room.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Room status updated successfully",
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/rooms/:id
 * Delete a room (verifies existence first)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    await Room.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
