import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: [true, "Booking number is required"],
      unique: true,
      trim: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: [true, "Guest is required"],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    adults: {
      type: Number,
      default: 1,
      min: [1, "At least 1 adult is required"],
    },
    children: {
      type: Number,
      default: 0,
      min: [0, "Children cannot be negative"],
    },
    bookingSource: {
      type: String,
      enum: ["Walk-in", "Website", "Phone", "OTA"],
      default: "Website",
    },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Checked-In", "Cancelled", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: [0, "Advance amount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    specialRequests: {
      type: String,
      trim: true,
      default: "",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
