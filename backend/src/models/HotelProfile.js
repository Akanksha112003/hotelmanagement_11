import mongoose from "mongoose";

const hotelProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      default: "THE AURELIA GRAND",
    },
    logo: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "100 Hospitality Blvd, Heritage Precinct",
    },
    city: {
      type: String,
      trim: true,
      default: "New Delhi",
    },
    state: {
      type: String,
      trim: true,
      default: "Delhi",
    },
    country: {
      type: String,
      trim: true,
      default: "India",
    },
    zipCode: {
      type: String,
      trim: true,
      default: "110001",
    },
    phone: {
      type: String,
      trim: true,
      default: "+91 (11) 2345-6789",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "concierge@aureliagrand.com",
    },
    website: {
      type: String,
      trim: true,
      default: "https://aureliagrand.com",
    },
    taxNumber: {
      type: String,
      trim: true,
      default: "GSTIN-07AABCT8829Q1Z5",
    },
    currency: {
      type: String,
      trim: true,
      default: "INR",
    },
    timeZone: {
      type: String,
      trim: true,
      default: "Asia/Kolkata",
    },
    checkInTime: {
      type: String,
      trim: true,
      default: "14:00",
    },
    checkOutTime: {
      type: String,
      trim: true,
      default: "12:00",
    },
    description: {
      type: String,
      trim: true,
      default:
        "Classic Hospitality. Modern Excellence. The Aurelia Grand provides luxury guest accommodations, heritage hospitality, and executive management.",
    },
    socialMedia: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

const HotelProfile =
  mongoose.models.HotelProfile ||
  mongoose.model("HotelProfile", hotelProfileSchema);

export default HotelProfile;
