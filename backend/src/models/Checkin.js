import mongoose from "mongoose";

const checkinSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
      minlength: [3, "Guest name must be at least 3 characters"],
      maxlength: [50, "Guest name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
    },
    numberOfGuests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest is required"],
      max: [10, "Maximum 10 guests allowed"],
    },
    phone: {
      type: Number,
      required: [true, "Phone number is required"],
      trim: true,
    },
    idProof: {
      type: String,
      required: [true, "ID proof is required"],
      trim: true,
    },
    idProofNumber: {
      type: String,
      required: [true, "ID proof number is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["booked", "checked-in", "checked-out"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Checkin = mongoose.model("Checkin", checkinSchema);

export default Checkin;
