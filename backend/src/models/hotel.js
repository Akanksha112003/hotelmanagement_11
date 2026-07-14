import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: "String", default: "Hotel Name" },
    address: { type: "String", default: "Hotel Address" },
    city: { type: "String", default: "Hotel City" },
    country: { type: "String", default: "Hotel Country" },
    phone: { type: "String", default: "" },
    email: { type: "String", default: "" },
    website: { type: "String", default: "" },
    description: { type: "String", default: "Hotel Description" },
    starRating: { type: "Number", default: 3 },
    checkInTime: { type: "String", default: "14:00" },
    checkOutTime: { type: "String", default: "12:00" },
    currency: { type: "String", default: "" },
    taxRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Hotel = mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
export default Hotel;
