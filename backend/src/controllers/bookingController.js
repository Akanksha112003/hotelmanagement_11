import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Guest from "../models/Guest.js";
import Room from "../models/room.js";
import Checkin from "../models/Checkin.js";

/**
 * Generate sequential booking number: BK-YYYYMMDD-XXXX
 */
const generateBookingNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const prefix = `BK-${dateStr}-`;

  // Count existing bookings created today with this prefix
  const countToday = await Booking.countDocuments({
    bookingNumber: new RegExp(`^${prefix}`),
  });

  const seq = String(countToday + 1).padStart(4, "0");
  return `${prefix}${seq}`;
};

/**
 * Check if dates overlap: (startA < endB) && (endA > startB)
 */
const checkDateOverlap = async (roomId, guestId, checkIn, checkOut, excludeBookingId = null) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const baseQuery = {
    bookingStatus: { $in: ["Pending", "Confirmed", "Checked-In"] },
    checkInDate: { $lt: end },
    checkOutDate: { $gt: start },
  };

  if (excludeBookingId) {
    baseQuery._id = { $ne: excludeBookingId };
  }

  // 1. Room overlap check
  const roomConflict = await Booking.findOne({
    ...baseQuery,
    room: roomId,
  });

  if (roomConflict) {
    return {
      hasConflict: true,
      reason: "This room is already booked for the selected dates.",
    };
  }

  // 2. Guest overlap check
  const guestConflict = await Booking.findOne({
    ...baseQuery,
    guest: guestId,
  });

  if (guestConflict) {
    return {
      hasConflict: true,
      reason: "This guest already has an active reservation during these dates.",
    };
  }

  return { hasConflict: false };
};

/**
 * GET /api/bookings
 * Fetch all bookings with populated guest and room details
 */
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("guest")
      .populate("room")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/:id
 * Get single booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = await Booking.findById(id).populate("guest").populate("room");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({ success: true, data: booking, booking });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bookings
 * Create a new booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      guest,
      room,
      checkInDate,
      checkOutDate,
      adults,
      children,
      bookingSource,
      bookingStatus,
      paymentStatus,
      advanceAmount,
      totalAmount,
      specialRequests,
      remarks,
    } = req.body;

    // Required fields check
    if (!guest || !mongoose.Types.ObjectId.isValid(guest)) {
      return res.status(400).json({ success: false, message: "Valid guest is required" });
    }
    if (!room || !mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ success: false, message: "Valid room is required" });
    }
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ success: false, message: "Check-in and Check-out dates are required" });
    }
    if (totalAmount === undefined || totalAmount === null || Number(totalAmount) < 0) {
      return res.status(400).json({ success: false, message: "Valid total amount is required" });
    }

    // Verify Guest exists
    const guestObj = await Guest.findById(guest);
    if (!guestObj) {
      return res.status(404).json({ success: false, message: "Selected guest not found" });
    }

    // Verify Room exists
    const roomObj = await Room.findById(room);
    if (!roomObj) {
      return res.status(404).json({ success: false, message: "Selected room not found" });
    }

    // Room status check
    const forbiddenStatuses = ["occupied", "dirty", "maintenance"];
    if (forbiddenStatuses.includes(roomObj.status)) {
      return res.status(400).json({
        success: false,
        message: `Room ${roomObj.roomNumber} is currently ${roomObj.status} and cannot be booked.`,
      });
    }

    // Date validations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const checkInDay = new Date(checkIn);
    checkInDay.setHours(0, 0, 0, 0);

    if (checkInDay < todayStart) {
      return res.status(400).json({ success: false, message: "Check-in date cannot be in the past" });
    }
    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: "Check-out date must be after Check-in date" });
    }

    // Double booking check
    const overlapResult = await checkDateOverlap(room, guest, checkIn, checkOut);
    if (overlapResult.hasConflict) {
      return res.status(400).json({ success: false, message: overlapResult.reason });
    }

    // Generate unique sequential booking number
    const bookingNumber = await generateBookingNumber();

    const status = bookingStatus || "Confirmed";

    const booking = await Booking.create({
      bookingNumber,
      guest,
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      bookingSource: bookingSource || "Website",
      bookingStatus: status,
      paymentStatus: paymentStatus || "Pending",
      advanceAmount: Number(advanceAmount) || 0,
      totalAmount: Number(totalAmount),
      specialRequests: specialRequests ? String(specialRequests).trim() : "",
      remarks: remarks ? String(remarks).trim() : "",
    });

    // If Confirmed, set Room status to reserved
    if (status === "Confirmed") {
      await Room.findByIdAndUpdate(room, { status: "reserved" });
    }

    const populatedBooking = await Booking.findById(booking._id).populate("guest").populate("room");

    return res.status(201).json({
      success: true,
      message: `Booking ${bookingNumber} created successfully`,
      data: populatedBooking,
      booking: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/bookings/:id
 * Update booking details
 */
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const {
      guest,
      room,
      checkInDate,
      checkOutDate,
      adults,
      children,
      bookingSource,
      bookingStatus,
      paymentStatus,
      advanceAmount,
      totalAmount,
      specialRequests,
      remarks,
    } = req.body;

    const targetGuest = guest || existingBooking.guest;
    const targetRoom = room || existingBooking.room;
    const targetCheckIn = checkInDate ? new Date(checkInDate) : existingBooking.checkInDate;
    const targetCheckOut = checkOutDate ? new Date(checkOutDate) : existingBooking.checkOutDate;

    if (targetCheckOut <= targetCheckIn) {
      return res.status(400).json({ success: false, message: "Check-out date must be after Check-in date" });
    }

    // Overlap check excluding current booking
    const overlapResult = await checkDateOverlap(targetRoom, targetGuest, targetCheckIn, targetCheckOut, id);
    if (overlapResult.hasConflict) {
      return res.status(400).json({ success: false, message: overlapResult.reason });
    }

    const updateFields = {};
    if (guest) updateFields.guest = guest;
    if (room) updateFields.room = room;
    if (checkInDate) updateFields.checkInDate = targetCheckIn;
    if (checkOutDate) updateFields.checkOutDate = targetCheckOut;
    if (adults !== undefined) updateFields.adults = Number(adults);
    if (children !== undefined) updateFields.children = Number(children);
    if (bookingSource) updateFields.bookingSource = bookingSource;
    if (bookingStatus) updateFields.bookingStatus = bookingStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (advanceAmount !== undefined) updateFields.advanceAmount = Number(advanceAmount);
    if (totalAmount !== undefined) updateFields.totalAmount = Number(totalAmount);
    if (specialRequests !== undefined) updateFields.specialRequests = String(specialRequests).trim();
    if (remarks !== undefined) updateFields.remarks = String(remarks).trim();

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    }).populate("guest").populate("room");

    // Handle room status sync on status update
    if (bookingStatus) {
      if (bookingStatus === "Confirmed") {
        await Room.findByIdAndUpdate(targetRoom, { status: "reserved" });
      } else if (bookingStatus === "Cancelled") {
        // Release room only if no other active booking exists for this room
        const activeOther = await Booking.findOne({
          room: targetRoom,
          _id: { $ne: id },
          bookingStatus: { $in: ["Pending", "Confirmed", "Checked-In"] },
        });
        if (!activeOther) {
          await Room.findByIdAndUpdate(targetRoom, { status: "available" });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
      booking: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/status
 * Update status or paymentStatus of booking
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const updateFields = {};
    if (bookingStatus) updateFields.bookingStatus = bookingStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    }).populate("guest").populate("room");

    // Sync room status
    if (bookingStatus === "Confirmed") {
      await Room.findByIdAndUpdate(booking.room, { status: "reserved" });
    } else if (bookingStatus === "Cancelled") {
      const activeOther = await Booking.findOne({
        room: booking.room,
        _id: { $ne: id },
        bookingStatus: { $in: ["Pending", "Confirmed", "Checked-In"] },
      });
      if (!activeOther) {
        await Room.findByIdAndUpdate(booking.room, { status: "available" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
      booking: updatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bookings/:id/check-in
 * Convert a confirmed booking directly into a Check-In record
 */
export const convertBookingToCheckIn = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = await Booking.findById(id).populate("guest").populate("room");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.bookingStatus === "Checked-In") {
      return res.status(400).json({ success: false, message: "Booking is already checked-in" });
    }
    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cancelled booking cannot be checked-in" });
    }

    const guestObj = booking.guest;
    const roomObj = booking.room;

    if (!guestObj || !roomObj) {
      return res.status(400).json({ success: false, message: "Associated guest or room details are missing" });
    }

    // 1. Create Checkin record
    const checkinRecord = await Checkin.create({
      guestName: guestObj.fullName,
      email: guestObj.email,
      phone: guestObj.phone,
      roomNumber: roomObj.roomNumber,
      checkInDate: new Date(),
      checkOutDate: booking.checkOutDate,
      numberOfGuests: (booking.adults || 1) + (booking.children || 0),
      idProof: guestObj.idProofType || "nationalId",
      idProofNumber: guestObj.idProofNumber || "N/A",
      status: "checked-in",
    });

    // 2. Update booking status to Checked-In
    booking.bookingStatus = "Checked-In";
    await booking.save();

    // 3. Update room status to occupied
    await Room.findByIdAndUpdate(roomObj._id, { status: "occupied" });

    return res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingNumber} converted to Check-In successfully`,
      data: {
        booking,
        checkin: checkinRecord,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/bookings/:id
 * Delete booking (prevent deletion if Checked-In or Completed)
 */
export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (["Checked-In", "Completed"].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete a booking that is ${booking.bookingStatus}`,
      });
    }

    const roomId = booking.room;
    await Booking.findByIdAndDelete(id);

    // Release room if no other active booking exists
    if (roomId) {
      const activeOther = await Booking.findOne({
        room: roomId,
        bookingStatus: { $in: ["Pending", "Confirmed", "Checked-In"] },
      });
      if (!activeOther) {
        await Room.findByIdAndUpdate(roomId, { status: "available" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
