import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    defaultPrice: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const roomSettingsSchema = new mongoose.Schema(
  {
    roomTypes: {
      type: [roomTypeSchema],
      default: [
        { type: "single", displayName: "Single Standard", defaultPrice: 100, capacity: 1, description: "Cozy single room for solo travelers." },
        { type: "double", displayName: "Double Deluxe", defaultPrice: 160, capacity: 2, description: "Spacious double bed room for couples." },
        { type: "suite", displayName: "Executive Suite", defaultPrice: 280, capacity: 3, description: "Luxury suite with ocean view balcony." },
        { type: "deluxe", displayName: "Royal Deluxe", defaultPrice: 350, capacity: 4, description: "Premium suite with king bed and jacuzzi." },
        { type: "presidential", displayName: "Presidential Penthouse", defaultPrice: 600, capacity: 6, description: "Ultra-luxury penthouse with private pool." }
      ]
    },
    amenities: {
      type: [String],
      default: [
        "Free Wi-Fi",
        "Air Conditioning",
        "Flat Screen TV",
        "Mini Bar",
        "Ocean View Balcony",
        "Room Service",
        "Swimming Pool Access",
        "Spa & Fitness Center",
        "Complimentary Breakfast",
        "Safe Deposit Box"
      ]
    },
    defaultTaxRate: {
      type: Number,
      default: 12,
      min: [0, "Tax rate cannot be negative"]
    },
    occupancyLimits: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 10 }
    },
    roomPolicies: {
      checkInPolicy: { type: String, default: "Standard check-in from 14:00. Early check-in subject to availability." },
      cancellationPolicy: { type: String, default: "Free cancellation up to 24 hours before check-in." },
      smokingPolicy: { type: String, default: "Non-smoking rooms. Designated outdoor smoking areas available." },
      petPolicy: { type: String, default: "Pets allowed in designated pet-friendly suites with deposit." }
    }
  },
  { timestamps: true }
);

const RoomSettings = mongoose.models.RoomSettings || mongoose.model("RoomSettings", roomSettingsSchema);

export default RoomSettings;
