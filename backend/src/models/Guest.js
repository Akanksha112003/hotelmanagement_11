import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name must be less than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    nationality: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    idProofType: {
      type: String,
      trim: true,
      default: "nationalId",
    },
    idProofNumber: {
      type: String,
      required: [true, "ID proof number is required"],
      unique: true,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: [0, "Total visits cannot be negative"],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, "Total spent cannot be negative"],
    },
    lastStayDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Guest = mongoose.models.Guest || mongoose.model("Guest", guestSchema);

export default Guest;
