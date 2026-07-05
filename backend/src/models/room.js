import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["single", "double", "suite", "deluxe", "presidential"],
      required: true,
    },
    floor: { type: Number, required: true, min: 1 },
    capacity: { type: Number, required: true, min: 1 },
    pricePerNight: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
