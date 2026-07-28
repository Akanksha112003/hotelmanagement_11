import mongoose from "mongoose";
import Checkout from "../models/Checkout.js";
import Checkin from "../models/Checkin.js";
import Room from "../models/room.js";
import HouseKeepingTask from "../models/housekeepingTask.js";
import FoodOrder from "../models/FoodOrder.js";

const ALLOWED_PAYMENT_METHODS = ["Cash", "Card", "UPI", "Bank Transfer"];
const ALLOWED_PAYMENT_STATUSES = ["Pending", "Paid"];

/**
 * GET /api/checkout
 * Get all checkout records sorted by creation date descending
 */
export const getCheckouts = async (req, res, next) => {
  try {
    const checkouts = await Checkout.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: checkouts.length,
      data: checkouts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/checkout
 * Process a new checkout, calculate final bill, update Check-In status, Room status (to Dirty), and create Housekeeping task
 */
export const createCheckout = async (req, res, next) => {
  try {
    const {
      checkinId,
      roomNumber,
      guestName,
      checkInDate,
      checkOutDate,
      roomCharges,
      foodCharges: providedFoodCharges,
      extraCharges: providedExtraCharges,
      discount: providedDiscount,
      paymentMethod,
      paymentStatus,
      remarks,
    } = req.body;

    // Validate required fields
    if (!roomNumber || !guestName) {
      return res.status(400).json({
        success: false,
        message: "Room number and guest name are required",
      });
    }

    if (roomCharges === undefined || roomCharges === null || typeof roomCharges !== "number" || roomCharges < 0) {
      return res.status(400).json({
        success: false,
        message: "Room charges are required and must be a non-negative number",
      });
    }

    // Validate payment method and payment status
    const method = paymentMethod || "Cash";
    if (!ALLOWED_PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(", ")}`,
      });
    }

    const payStatus = paymentStatus || "Paid";
    if (!ALLOWED_PAYMENT_STATUSES.includes(payStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed: ${ALLOWED_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    // Fetch food charges automatically from Food Orders for this room
    let autoFoodCharges = 0;
    try {
      const foodOrders = await FoodOrder.find({ roomNumber: String(roomNumber).trim() });
      autoFoodCharges = foodOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    } catch (fErr) {
      console.warn("Could not query food orders for checkout calculation:", fErr.message);
    }

    const foodCharges =
      typeof providedFoodCharges === "number" && providedFoodCharges > 0
        ? Math.max(providedFoodCharges, autoFoodCharges)
        : autoFoodCharges;

    const extraCharges = typeof providedExtraCharges === "number" && providedExtraCharges >= 0 ? providedExtraCharges : 0;
    const discount = typeof providedDiscount === "number" && providedDiscount >= 0 ? providedDiscount : 0;

    // Calculate final bill server-side
    let totalAmount = (roomCharges + foodCharges + extraCharges) - discount;
    if (totalAmount < 0) totalAmount = 0;

    const finalCheckInDate = checkInDate ? new Date(checkInDate) : new Date();

    // Create Checkout Record
    const checkout = await Checkout.create({
      checkinId: checkinId && mongoose.Types.ObjectId.isValid(checkinId) ? checkinId : null,
      roomNumber: String(roomNumber).trim(),
      guestName: String(guestName).trim(),
      checkInDate: finalCheckInDate,
      checkOutDate: checkOutDate ? new Date(checkOutDate) : new Date(),
      roomCharges,
      foodCharges,
      extraCharges,
      discount,
      totalAmount,
      paymentMethod: method,
      paymentStatus: payStatus,
      remarks: remarks ? String(remarks).trim() : "",
    });

    // 1. Update Check-In status to checked-out
    try {
      if (checkinId && mongoose.Types.ObjectId.isValid(checkinId)) {
        await Checkin.findByIdAndUpdate(checkinId, { status: "checked-out" });
      } else {
        await Checkin.findOneAndUpdate(
          { roomNumber: String(roomNumber).trim(), status: { $ne: "checked-out" } },
          { status: "checked-out" }
        );
      }
    } catch (cErr) {
      console.warn("Could not update Check-in status during checkout:", cErr.message);
    }

    // 2. Change Room status to "dirty" (not Available)
    try {
      await Room.findOneAndUpdate(
        { roomNumber: String(roomNumber).trim() },
        { status: "dirty" }
      );
    } catch (rErr) {
      console.warn("Could not update Room status during checkout:", rErr.message);
    }

    // 3. Automatically create a Housekeeping task with status "pending"
    try {
      await HouseKeepingTask.create({
        roomNumber: String(roomNumber).trim(),
        taskType: "cleaning",
        status: "pending",
        priority: "normal",
        notes: `Automated room cleaning task created upon checkout for Room ${roomNumber}`,
      });
    } catch (hErr) {
      console.warn("Could not auto-create Housekeeping task during checkout:", hErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Checkout processed successfully",
      data: checkout,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/checkout/:id
 * Get single checkout record by ID
 */
export const getCheckoutById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Checkout record not found",
      });
    }

    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Checkout record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: checkout,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/checkout/:id/payment
 * Update payment status for a checkout record
 */
export const updateCheckoutPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed: ${ALLOWED_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Checkout record not found",
      });
    }

    const checkout = await Checkout.findByIdAndUpdate(
      id,
      { paymentStatus },
      { returnDocument: "after", runValidators: true }
    );

    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Checkout record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: checkout,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/checkout/:id
 * Delete a checkout record (verifies existence first)
 */
export const deleteCheckout = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Checkout record not found",
      });
    }

    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: "Checkout record not found",
      });
    }

    await Checkout.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Checkout record deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
