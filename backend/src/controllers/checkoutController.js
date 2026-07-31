import mongoose from "mongoose";
import Checkout from "../models/Checkout.js";
import Checkin from "../models/Checkin.js";
import Room from "../models/room.js";
import HouseKeepingTask from "../models/housekeepingTask.js";
import FoodOrder from "../models/FoodOrder.js";
import Guest from "../models/Guest.js";
import Booking from "../models/Booking.js";
import Invoice from "../models/Invoice.js";

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

    // 4. Update matching Guest stats (totalVisits, totalSpent, lastStayDate)
    try {
      let checkinRec = null;
      if (checkinId && mongoose.Types.ObjectId.isValid(checkinId)) {
        checkinRec = await Checkin.findById(checkinId);
      }
      if (!checkinRec) {
        checkinRec = await Checkin.findOne({ roomNumber: String(roomNumber).trim() }).sort({ createdAt: -1 });
      }

      let guestMatchQuery = null;
      if (checkinRec) {
        guestMatchQuery = {
          $or: [
            { email: checkinRec.email },
            { phone: String(checkinRec.phone) },
            { idProofNumber: checkinRec.idProofNumber },
            { fullName: new RegExp(`^${checkinRec.guestName}$`, "i") }
          ]
        };
      } else {
        guestMatchQuery = { fullName: new RegExp(`^${String(guestName).trim()}$`, "i") };
      }

      const matchingGuest = await Guest.findOne(guestMatchQuery);
      if (matchingGuest) {
        await Guest.findByIdAndUpdate(matchingGuest._id, {
          $inc: { totalVisits: 1, totalSpent: totalAmount },
          $set: { lastStayDate: checkout.checkOutDate || new Date() }
        });
      }
    } catch (gErr) {
      console.warn("Could not update Guest stats during checkout:", gErr.message);
    }

    // 5. Update active Booking status to "Completed"
    let matchedBookingObj = null;
    try {
      const activeBooking = await Booking.findOne({
        bookingStatus: { $in: ["Checked-In", "Confirmed"] },
      }).populate("room");

      if (activeBooking && activeBooking.room && activeBooking.room.roomNumber === String(roomNumber).trim()) {
        await Booking.findByIdAndUpdate(activeBooking._id, { bookingStatus: "Completed" });
        matchedBookingObj = activeBooking;
      }
    } catch (bErr) {
      console.warn("Could not update Booking status during checkout:", bErr.message);
    }

    // 6. Automatically generate Invoice for this checkout
    try {
      const existingInv = await Invoice.findOne({ checkout: checkout._id });
      if (!existingInv) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const prefix = `INV-${dateStr}-`;
        const countToday = await Invoice.countDocuments({ invoiceNumber: new RegExp(`^${prefix}`) });
        const invoiceNumber = `${prefix}${String(countToday + 1).padStart(4, "0")}`;

        const roomObj = await Room.findOne({ roomNumber: String(roomNumber).trim() });
        const guestObj = await Guest.findOne(guestMatchQuery);

        const sub = (roomCharges || 0) + (foodCharges || 0) + (extraCharges || 0);
        const disc = discount || 0;
        const taxable = Math.max(0, sub - disc);
        const taxVal = Number((taxable * 0.12).toFixed(2));
        const finalTot = Number((taxable + taxVal).toFixed(2));

        const paidVal = payStatus === "Paid" ? finalTot : 0;
        const balVal = Math.max(0, finalTot - paidVal);

        const paymentsList = [];
        if (paidVal > 0) {
          paymentsList.push({
            amount: paidVal,
            paymentMethod: method,
            paidAt: new Date(),
            remarks: "Payment collected upon Checkout",
          });
        }

        if (guestObj) {
          await Invoice.create({
            invoiceNumber,
            guest: guestObj._id,
            booking: matchedBookingObj ? matchedBookingObj._id : null,
            checkout: checkout._id,
            room: roomObj ? roomObj._id : null,
            roomCharges: roomCharges || 0,
            foodCharges: foodCharges || 0,
            extraCharges: extraCharges || 0,
            discount: disc,
            taxPercentage: 12,
            taxAmount: taxVal,
            subtotal: sub,
            totalAmount: finalTot,
            paymentMethod: method,
            paymentStatus: payStatus === "Paid" ? "Paid" : "Pending",
            amountPaid: paidVal,
            balanceAmount: balVal,
            invoiceStatus: payStatus === "Paid" ? "Paid" : "Issued",
            payments: paymentsList,
            remarks: remarks ? String(remarks).trim() : "Auto-generated invoice from checkout",
            issuedAt: new Date(),
          });
        }
      }
    } catch (iErr) {
      console.warn("Could not auto-generate Invoice during checkout:", iErr.message);
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
