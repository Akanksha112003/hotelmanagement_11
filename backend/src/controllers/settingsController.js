import Hotel from "../models/hotel.js";
import Room from "../models/room.js";
import User from "../models/user.js";

export const getHotelProfile = async (req, res, next) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) hotel = await Hotel.create({});
    res.json({ success: true, data: hotel });
  } catch (err) {
    next(err);
  }
};

export const updateHotelProfile = async (req, res, next) => {
  try {
    const fields = [
      "name",
      "address",
      "city",
      "country",
      "phone",
      "email",
      "website",
      "description",
      "starRating",
      "checkInTime",
      "checkOutTime",
      "currency",
      "taxRate",
    ];
    const update = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });

    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = await Hotel.create(update);
    } else {
      Object.assign(hotel, update);
      await hotel.save();
    }
    res.json({ success: true, message: "Hotel Profile updated", data: hotel });
  } catch (err) {
    next(err);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

export const addRoom = async (req, res, next) => {
  try {
    const {
      roomNumber,
      type,
      floor,
      capacity,
      pricePerNight,
      status,
      description,
    } = req.body;

    if (!roomNumber || !type || !floor || !capacity || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "roomNumber, type, floor, capacity, pricePerNight are required",
      });
    }
    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Room number already exists" });
    }
    const room = await Room.create({
      roomNumber,
      type,
      floor,
      capacity,
      pricePerNight,
      status,
      description,
    });
    res.status(201).json({ success: true, message: "Room Added", data: room });
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const addUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "name, email, password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const Changepassword = async (req, res, next) => {
  try {
    // Accept both "oldPassword" (sent by frontend) and "currentPassword" for compatibility
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New Password must be at least 6 characters",
      });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Valid role (user|admin) is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "Role updated", data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User removed" });
  } catch (err) {
    next(err);
  }
};

// ─── User Profile (my account) ──────────────────────────────────────────────

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, phone, profilePicture, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (profilePicture && profilePicture.length > 2 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "Profile picture size exceeds the 1.5 MB limit." });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (preferences !== undefined) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── Room Settings ──────────────────────────────────────────────────────────

import RoomSettings from "../models/RoomSettings.js";

export const getRoomSettings = async (req, res, next) => {
  try {
    let settings = await RoomSettings.findOne();
    if (!settings) settings = await RoomSettings.create({});
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateRoomSettings = async (req, res, next) => {
  try {
    let settings = await RoomSettings.findOne();
    if (!settings) {
      settings = await RoomSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, message: "Room settings updated", data: settings });
  } catch (err) {
    next(err);
  }
};
