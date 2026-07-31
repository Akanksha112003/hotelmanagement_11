import mongoose from "mongoose";

const hotelProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      default: "Azure Coast Resort & Spa",
    },
    logo: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "100 Hospitality Blvd, Ocean View Drive",
    },
    city: {
      type: String,
      trim: true,
      default: "Miami",
    },
    state: {
      type: String,
      trim: true,
      default: "Florida",
    },
    country: {
      type: String,
      trim: true,
      default: "United States",
    },
    zipCode: {
      type: String,
      trim: true,
      default: "33139",
    },
    phone: {
      type: String,
      trim: true,
      default: "+1 (800) 555-HOTEL",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "contact@azurecoastresort.com",
    },
    website: {
      type: String,
      trim: true,
      default: "https://azurecoastresort.com",
    },
    taxNumber: {
      type: String,
      trim: true,
      default: "TX-882901",
    },
    currency: {
      type: String,
      trim: true,
      default: "USD",
    },
    timeZone: {
      type: String,
      trim: true,
      default: "America/New_York",
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
        "Luxury seaside hotel and resort offering premium guest accommodations, world-class amenities, and executive hospitality management.",
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
