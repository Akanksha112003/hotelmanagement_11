/**
 * Azure Coast Hotel — Comprehensive Seed Script
 * ----------------------------------------------
 * Inserts realistic Indian hotel sample data into MongoDB.
 * Safe to run multiple times: checks for existing records by unique key before inserting.
 *
 * Usage: node seed.mjs
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

// ── Models ──────────────────────────────────────────────────────────────────
import Guest from "./src/models/Guest.js";
import Room from "./src/models/room.js";
import Booking from "./src/models/Booking.js";
import Checkin from "./src/models/Checkin.js";
import Checkout from "./src/models/Checkout.js";
import FoodOrder from "./src/models/FoodOrder.js";
import Invoice from "./src/models/Invoice.js";
import HouseKeepingTask from "./src/models/housekeepingTask.js";

// ── Connect ──────────────────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  family: 4,
});
console.log("✔  Connected to MongoDB");

// ── Helpers ──────────────────────────────────────────────────────────────────
const d = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(12, 0, 0, 0);
  return date;
};

// ════════════════════════════════════════════════════════════════════════════
// 1. ROOMS
// ════════════════════════════════════════════════════════════════════════════
const roomsData = [
  { roomNumber: "101", type: "single",       floor: 1, capacity: 1, pricePerNight: 2500,  status: "available",   amenities: ["Wi-Fi", "AC", "TV"],                              description: "Cosy single room overlooking the garden." },
  { roomNumber: "102", type: "single",       floor: 1, capacity: 1, pricePerNight: 2500,  status: "occupied",    amenities: ["Wi-Fi", "AC", "TV"],                              description: "Standard single room with city view." },
  { roomNumber: "103", type: "single",       floor: 1, capacity: 1, pricePerNight: 2800,  status: "dirty",       amenities: ["Wi-Fi", "AC", "TV", "Mini Fridge"],               description: "Freshly renovated single room." },
  { roomNumber: "201", type: "double",       floor: 2, capacity: 2, pricePerNight: 4500,  status: "available",   amenities: ["Wi-Fi", "AC", "TV", "Bathtub"],                   description: "Spacious double room with balcony." },
  { roomNumber: "202", type: "double",       floor: 2, capacity: 2, pricePerNight: 4500,  status: "occupied",    amenities: ["Wi-Fi", "AC", "TV", "Bathtub"],                   description: "Double room with sea-facing view." },
  { roomNumber: "203", type: "double",       floor: 2, capacity: 2, pricePerNight: 4800,  status: "reserved",    amenities: ["Wi-Fi", "AC", "TV", "Bathtub", "Work Desk"],      description: "Executive double room." },
  { roomNumber: "204", type: "double",       floor: 2, capacity: 2, pricePerNight: 4500,  status: "maintenance", amenities: ["Wi-Fi", "AC", "TV"],                              description: "Under maintenance — AC repair." },
  { roomNumber: "301", type: "deluxe",       floor: 3, capacity: 3, pricePerNight: 7500,  status: "available",   amenities: ["Wi-Fi", "AC", "TV", "Jacuzzi", "Mini Bar"],       description: "Deluxe room with panoramic view." },
  { roomNumber: "302", type: "deluxe",       floor: 3, capacity: 3, pricePerNight: 7500,  status: "occupied",    amenities: ["Wi-Fi", "AC", "TV", "Jacuzzi", "Mini Bar"],       description: "Deluxe corner room with king bed." },
  { roomNumber: "303", type: "deluxe",       floor: 3, capacity: 3, pricePerNight: 8000,  status: "available",   amenities: ["Wi-Fi", "AC", "TV", "Jacuzzi", "Mini Bar", "Lounge Chair"], description: "Premium deluxe with terrace access." },
  { roomNumber: "401", type: "suite",        floor: 4, capacity: 4, pricePerNight: 14000, status: "occupied",    amenities: ["Wi-Fi", "AC", "Smart TV", "Jacuzzi", "Mini Bar", "Living Area", "Butler Service"], description: "Executive suite with separate living room." },
  { roomNumber: "402", type: "suite",        floor: 4, capacity: 4, pricePerNight: 14000, status: "available",   amenities: ["Wi-Fi", "AC", "Smart TV", "Jacuzzi", "Mini Bar", "Living Area"], description: "Luxury suite with pool view." },
  { roomNumber: "403", type: "suite",        floor: 4, capacity: 4, pricePerNight: 15000, status: "reserved",    amenities: ["Wi-Fi", "AC", "Smart TV", "Jacuzzi", "Mini Bar", "Living Area", "Dining Area"], description: "Grand suite with private dining." },
  { roomNumber: "501", type: "presidential", floor: 5, capacity: 6, pricePerNight: 35000, status: "available",   amenities: ["Wi-Fi", "AC", "Smart TV", "Private Pool", "Jacuzzi", "Full Kitchen", "Butler", "Lounge", "Dining"], description: "The Azure Presidential — pinnacle of luxury." },
  { roomNumber: "502", type: "presidential", floor: 5, capacity: 6, pricePerNight: 38000, status: "occupied",    amenities: ["Wi-Fi", "AC", "Smart TV", "Private Pool", "Jacuzzi", "Full Kitchen", "Butler", "Home Theatre"], description: "Presidential suite with home theatre and ocean view." },
];

const savedRooms = {};
for (const r of roomsData) {
  const existing = await Room.findOne({ roomNumber: r.roomNumber });
  if (existing) {
    savedRooms[r.roomNumber] = existing;
  } else {
    savedRooms[r.roomNumber] = await Room.create(r);
  }
}
console.log(`✔  Rooms: ${Object.keys(savedRooms).length} upserted`);

// ════════════════════════════════════════════════════════════════════════════
// 2. GUESTS
// ════════════════════════════════════════════════════════════════════════════
const guestsData = [
  { fullName: "Arjun Sharma",       email: "arjun.sharma@gmail.com",     phone: "9876543210", address: "42 MG Road, Bengaluru, Karnataka",    nationality: "Indian", gender: "Male",   dateOfBirth: new Date("1985-03-14"), idProofType: "Aadhaar", idProofNumber: "AADH-1001-2025", totalVisits: 3, totalSpent: 87500, lastStayDate: d(-30), notes: "Prefers high floor rooms." },
  { fullName: "Priya Nair",         email: "priya.nair@outlook.com",      phone: "9812345678", address: "7 Residency Road, Kochi, Kerala",      nationality: "Indian", gender: "Female", dateOfBirth: new Date("1990-07-22"), idProofType: "Passport", idProofNumber: "PASS-2002-2025", totalVisits: 1, totalSpent: 14000, lastStayDate: d(-5),  notes: "Honeymoon couple — extra amenities." },
  { fullName: "Rajesh Gupta",       email: "rajesh.gupta@yahoo.com",      phone: "9988776655", address: "15 Civil Lines, New Delhi",            nationality: "Indian", gender: "Male",   dateOfBirth: new Date("1972-11-08"), idProofType: "Voter ID", idProofNumber: "VOTE-3003-2025", totalVisits: 7, totalSpent: 245000, lastStayDate: d(-2),  notes: "Corporate guest — loyalty member." },
  { fullName: "Sneha Kulkarni",     email: "sneha.kulkarni@gmail.com",    phone: "9123456789", address: "22 Shivajinagar, Pune, Maharashtra",   nationality: "Indian", gender: "Female", dateOfBirth: new Date("1995-01-30"), idProofType: "Aadhaar", idProofNumber: "AADH-4004-2025", totalVisits: 2, totalSpent: 45000, lastStayDate: d(-15), notes: "Vegetarian food preference." },
  { fullName: "Vikram Reddy",       email: "vikram.reddy@hotmail.com",    phone: "9876012345", address: "88 Banjara Hills, Hyderabad, Telangana", nationality: "Indian", gender: "Male", dateOfBirth: new Date("1980-05-19"), idProofType: "Driving License", idProofNumber: "DL-5005-2025", totalVisits: 4, totalSpent: 120000, lastStayDate: d(-10), notes: "VIP — always requests suite." },
  { fullName: "Meera Iyer",         email: "meera.iyer@gmail.com",        phone: "9765432100", address: "3 Anna Nagar, Chennai, Tamil Nadu",    nationality: "Indian", gender: "Female", dateOfBirth: new Date("1988-09-04"), idProofType: "Passport", idProofNumber: "PASS-6006-2025", totalVisits: 2, totalSpent: 67000, lastStayDate: d(-20), notes: "Requires extra pillows." },
  { fullName: "Anand Joshi",        email: "anand.joshi@gmail.com",       phone: "9654321098", address: "10 Satellite Road, Ahmedabad, Gujarat", nationality: "Indian", gender: "Male", dateOfBirth: new Date("1975-12-25"), idProofType: "Aadhaar", idProofNumber: "AADH-7007-2025", totalVisits: 5, totalSpent: 175000, lastStayDate: d(-8),  notes: "Arrives late — late check-in arranged." },
  { fullName: "Kavitha Menon",      email: "kavitha.menon@yahoo.com",     phone: "9543210987", address: "55 Indiranagar, Bengaluru, Karnataka", nationality: "Indian", gender: "Female", dateOfBirth: new Date("1993-06-15"), idProofType: "PAN Card", idProofNumber: "PANC-8008-2025", totalVisits: 1, totalSpent: 38000, lastStayDate: d(-3),  notes: "First-time guest." },
  { fullName: "Suresh Patel",       email: "suresh.patel@gmail.com",      phone: "9432109876", address: "27 Navrangpura, Ahmedabad, Gujarat",  nationality: "Indian", gender: "Male",   dateOfBirth: new Date("1968-04-02"), idProofType: "Passport", idProofNumber: "PASS-9009-2025", totalVisits: 10, totalSpent: 520000, lastStayDate: d(-1),  notes: "Long-stay guest — ask for special rate." },
  { fullName: "Divya Krishnamurthy",email: "divya.krishna@gmail.com",     phone: "9321098765", address: "14 T. Nagar, Chennai, Tamil Nadu",    nationality: "Indian", gender: "Female", dateOfBirth: new Date("1997-08-18"), idProofType: "Aadhaar", idProofNumber: "AADH-1010-2025", totalVisits: 1, totalSpent: 14000, lastStayDate: d(-4),  notes: "" },
  { fullName: "Harish Tiwari",      email: "harish.tiwari@gmail.com",     phone: "9210987654", address: "9 Hazratganj, Lucknow, UP",           nationality: "Indian", gender: "Male",   dateOfBirth: new Date("1982-02-28"), idProofType: "Voter ID", idProofNumber: "VOTE-1111-2025", totalVisits: 3, totalSpent: 89000, lastStayDate: d(-6),  notes: "Requests ground floor rooms." },
  { fullName: "Nandini Bose",       email: "nandini.bose@outlook.com",    phone: "9109876543", address: "33 Park Street, Kolkata, West Bengal", nationality: "Indian", gender: "Female", dateOfBirth: new Date("1991-11-11"), idProofType: "Passport", idProofNumber: "PASS-1212-2025", totalVisits: 2, totalSpent: 56000, lastStayDate: d(-12), notes: "Prefers non-smoking rooms." },
  { fullName: "Rohan Singh",        email: "rohan.singh@gmail.com",       phone: "9098765432", address: "6 Civil Lines, Jaipur, Rajasthan",   nationality: "Indian", gender: "Male",   dateOfBirth: new Date("1988-07-07"), idProofType: "Aadhaar", idProofNumber: "AADH-1313-2025", totalVisits: 6, totalSpent: 198000, lastStayDate: d(0),   notes: "Currently checked in." },
  { fullName: "Lakshmi Pillai",     email: "lakshmi.pillai@gmail.com",    phone: "8987654321", address: "19 Trivandrum Road, Kochi, Kerala",  nationality: "Indian", gender: "Female", dateOfBirth: new Date("1965-03-20"), idProofType: "Driving License", idProofNumber: "DL-1414-2025", totalVisits: 4, totalSpent: 145000, lastStayDate: d(0),   notes: "Senior guest — needs wheelchair access." },
  { fullName: "Aditya Chopra",      email: "aditya.chopra@yahoo.com",     phone: "8876543210", address: "72 Malabar Hill, Mumbai, Maharashtra", nationality: "Indian", gender: "Male", dateOfBirth: new Date("1978-10-05"), idProofType: "Passport", idProofNumber: "PASS-1515-2025", totalVisits: 8, totalSpent: 380000, lastStayDate: d(-7),  notes: "Premium member — complimentary upgrade." },
];

const savedGuests = {};
for (const g of guestsData) {
  const existing = await Guest.findOne({ email: g.email });
  if (existing) {
    savedGuests[g.email] = existing;
  } else {
    savedGuests[g.email] = await Guest.create(g);
  }
}
console.log(`✔  Guests: ${Object.keys(savedGuests).length} upserted`);

// Alias helpers for cleaner code below
const G = (email) => savedGuests[email];
const R = (num)   => savedRooms[num];

// ════════════════════════════════════════════════════════════════════════════
// 3. BOOKINGS
// ════════════════════════════════════════════════════════════════════════════
const bookingsData = [
  { bookingNumber: "BK-2025-001", guest: G("arjun.sharma@gmail.com"),     room: R("302"), checkInDate: d(-10), checkOutDate: d(-7),  adults: 1, children: 0, bookingSource: "Website",   bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 7500,  totalAmount: 22500, specialRequests: "High floor preferred.", remarks: "" },
  { bookingNumber: "BK-2025-002", guest: G("priya.nair@outlook.com"),      room: R("401"), checkInDate: d(-5),  checkOutDate: d(-2),  adults: 2, children: 0, bookingSource: "Phone",     bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 14000, totalAmount: 42000, specialRequests: "Honeymoon — rose petals and champagne.", remarks: "Suite pre-decorated." },
  { bookingNumber: "BK-2025-003", guest: G("rajesh.gupta@yahoo.com"),      room: R("202"), checkInDate: d(-2),  checkOutDate: d(1),   adults: 1, children: 0, bookingSource: "OTA",       bookingStatus: "Checked-In", paymentStatus: "Partial", advanceAmount: 4500,  totalAmount: 13500, specialRequests: "Early check-in.", remarks: "Corporate account - invoice required." },
  { bookingNumber: "BK-2025-004", guest: G("sneha.kulkarni@gmail.com"),    room: R("303"), checkInDate: d(-3),  checkOutDate: d(0),   adults: 2, children: 1, bookingSource: "Website",   bookingStatus: "Checked-In", paymentStatus: "Paid",    advanceAmount: 8000,  totalAmount: 24000, specialRequests: "Vegetarian meals.", remarks: "" },
  { bookingNumber: "BK-2025-005", guest: G("vikram.reddy@hotmail.com"),    room: R("502"), checkInDate: d(-7),  checkOutDate: d(-4),  adults: 2, children: 0, bookingSource: "Phone",     bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 38000, totalAmount: 114000, specialRequests: "VIP treatment.", remarks: "Return guest — upgrade applied." },
  { bookingNumber: "BK-2025-006", guest: G("meera.iyer@gmail.com"),        room: R("201"), checkInDate: d(-20), checkOutDate: d(-18), adults: 2, children: 0, bookingSource: "Website",   bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 4500,  totalAmount: 9000,  specialRequests: "Extra pillows.", remarks: "" },
  { bookingNumber: "BK-2025-007", guest: G("anand.joshi@gmail.com"),       room: R("102"), checkInDate: d(-8),  checkOutDate: d(-6),  adults: 1, children: 0, bookingSource: "Walk-in",   bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 2500,  totalAmount: 5000,  specialRequests: "Late check-in after 11 PM.", remarks: "Key handed to night desk." },
  { bookingNumber: "BK-2025-008", guest: G("kavitha.menon@yahoo.com"),     room: R("301"), checkInDate: d(-3),  checkOutDate: d(0),   adults: 1, children: 0, bookingSource: "OTA",       bookingStatus: "Checked-In", paymentStatus: "Partial", advanceAmount: 7500,  totalAmount: 22500, specialRequests: "", remarks: "" },
  { bookingNumber: "BK-2025-009", guest: G("suresh.patel@gmail.com"),      room: R("102"), checkInDate: d(-1),  checkOutDate: d(6),   adults: 1, children: 0, bookingSource: "Phone",     bookingStatus: "Checked-In", paymentStatus: "Partial", advanceAmount: 5000,  totalAmount: 17500, specialRequests: "Long stay — weekly rate preferred.", remarks: "Rate agreed at ₹2500/night." },
  { bookingNumber: "BK-2025-010", guest: G("divya.krishna@gmail.com"),     room: R("101"), checkInDate: d(-4),  checkOutDate: d(-2),  adults: 1, children: 0, bookingSource: "Website",   bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 2500,  totalAmount: 5000,  specialRequests: "", remarks: "" },
  { bookingNumber: "BK-2025-011", guest: G("harish.tiwari@gmail.com"),     room: R("103"), checkInDate: d(-6),  checkOutDate: d(-4),  adults: 2, children: 1, bookingSource: "Walk-in",   bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 2800,  totalAmount: 5600,  specialRequests: "Ground floor room.", remarks: "" },
  { bookingNumber: "BK-2025-012", guest: G("nandini.bose@outlook.com"),    room: R("203"), checkInDate: d(2),   checkOutDate: d(5),   adults: 2, children: 0, bookingSource: "Website",   bookingStatus: "Confirmed",  paymentStatus: "Partial", advanceAmount: 4800,  totalAmount: 14400, specialRequests: "Non-smoking room.", remarks: "" },
  { bookingNumber: "BK-2025-013", guest: G("rohan.singh@gmail.com"),       room: R("302"), checkInDate: d(0),   checkOutDate: d(3),   adults: 1, children: 0, bookingSource: "OTA",       bookingStatus: "Checked-In", paymentStatus: "Pending", advanceAmount: 0,     totalAmount: 22500, specialRequests: "", remarks: "Walk-in upgrade from double." },
  { bookingNumber: "BK-2025-014", guest: G("lakshmi.pillai@gmail.com"),    room: R("202"), checkInDate: d(0),   checkOutDate: d(4),   adults: 2, children: 0, bookingSource: "Phone",     bookingStatus: "Checked-In", paymentStatus: "Partial", advanceAmount: 4500,  totalAmount: 18000, specialRequests: "Wheelchair accessible route to room.", remarks: "Assist with luggage." },
  { bookingNumber: "BK-2025-015", guest: G("aditya.chopra@yahoo.com"),     room: R("403"), checkInDate: d(3),   checkOutDate: d(7),   adults: 2, children: 2, bookingSource: "Phone",     bookingStatus: "Confirmed",  paymentStatus: "Partial", advanceAmount: 15000, totalAmount: 60000, specialRequests: "Private dining request.", remarks: "Premium member - complimentary upgrade." },
  { bookingNumber: "BK-2025-016", guest: G("arjun.sharma@gmail.com"),      room: R("201"), checkInDate: d(5),   checkOutDate: d(8),   adults: 2, children: 0, bookingSource: "Website",   bookingStatus: "Confirmed",  paymentStatus: "Pending", advanceAmount: 4500,  totalAmount: 13500, specialRequests: "Anniversary stay.", remarks: "" },
  { bookingNumber: "BK-2025-017", guest: G("vikram.reddy@hotmail.com"),    room: R("401"), checkInDate: d(-15), checkOutDate: d(-12), adults: 2, children: 1, bookingSource: "Phone",     bookingStatus: "Completed",  paymentStatus: "Paid",    advanceAmount: 14000, totalAmount: 42000, specialRequests: "VIP amenity basket.", remarks: "" },
  { bookingNumber: "BK-2025-018", guest: G("sneha.kulkarni@gmail.com"),    room: R("101"), checkInDate: d(-15), checkOutDate: d(-14), adults: 1, children: 0, bookingSource: "OTA",       bookingStatus: "Cancelled",  paymentStatus: "Pending", advanceAmount: 0,     totalAmount: 2500,  specialRequests: "", remarks: "Guest cancelled due to travel issues." },
];

const savedBookings = {};
for (const b of bookingsData) {
  const existing = await Booking.findOne({ bookingNumber: b.bookingNumber });
  if (existing) {
    savedBookings[b.bookingNumber] = existing;
  } else {
    savedBookings[b.bookingNumber] = await Booking.create(b);
  }
}
console.log(`✔  Bookings: ${Object.keys(savedBookings).length} upserted`);

// ════════════════════════════════════════════════════════════════════════════
// 4. CHECK-INS
// ════════════════════════════════════════════════════════════════════════════
const checkinsData = [
  { guestName: "Rajesh Gupta",       email: "rajesh.gupta@yahoo.com",    roomNumber: "202", checkInDate: d(-2),  checkOutDate: d(1),   numberOfGuests: 1, phone: 9988776655, idProof: "Voter ID",          idProofNumber: "VOTE-3003-2025", status: "checked-in"  },
  { guestName: "Sneha Kulkarni",     email: "sneha.kulkarni@gmail.com",  roomNumber: "303", checkInDate: d(-3),  checkOutDate: d(0),   numberOfGuests: 3, phone: 9123456789, idProof: "Aadhaar",           idProofNumber: "AADH-4004-2025", status: "checked-in"  },
  { guestName: "Kavitha Menon",      email: "kavitha.menon@yahoo.com",   roomNumber: "301", checkInDate: d(-3),  checkOutDate: d(0),   numberOfGuests: 1, phone: 9543210987, idProof: "PAN Card",          idProofNumber: "PANC-8008-2025", status: "checked-in"  },
  { guestName: "Suresh Patel",       email: "suresh.patel@gmail.com",    roomNumber: "102", checkInDate: d(-1),  checkOutDate: d(6),   numberOfGuests: 1, phone: 9432109876, idProof: "Passport",          idProofNumber: "PASS-9009-2025", status: "checked-in"  },
  { guestName: "Rohan Singh",        email: "rohan.singh@gmail.com",     roomNumber: "302", checkInDate: d(0),   checkOutDate: d(3),   numberOfGuests: 1, phone: 9098765432, idProof: "Aadhaar",           idProofNumber: "AADH-1313-2025", status: "checked-in"  },
  { guestName: "Lakshmi Pillai",     email: "lakshmi.pillai@gmail.com",  roomNumber: "202", checkInDate: d(0),   checkOutDate: d(4),   numberOfGuests: 2, phone: 8987654321, idProof: "Driving License",   idProofNumber: "DL-1414-2025",   status: "checked-in"  },
  { guestName: "Arjun Sharma",       email: "arjun.sharma@gmail.com",    roomNumber: "302", checkInDate: d(-10), checkOutDate: d(-7),  numberOfGuests: 1, phone: 9876543210, idProof: "Aadhaar",           idProofNumber: "AADH-1001-2025", status: "checked-out" },
  { guestName: "Priya Nair",         email: "priya.nair@outlook.com",    roomNumber: "401", checkInDate: d(-5),  checkOutDate: d(-2),  numberOfGuests: 2, phone: 9812345678, idProof: "Passport",          idProofNumber: "PASS-2002-2025", status: "checked-out" },
  { guestName: "Vikram Reddy",       email: "vikram.reddy@hotmail.com",  roomNumber: "502", checkInDate: d(-7),  checkOutDate: d(-4),  numberOfGuests: 2, phone: 9876012345, idProof: "Driving License",   idProofNumber: "DL-5005-2025",   status: "checked-out" },
  { guestName: "Anand Joshi",        email: "anand.joshi@gmail.com",     roomNumber: "102", checkInDate: d(-8),  checkOutDate: d(-6),  numberOfGuests: 1, phone: 9654321098, idProof: "Aadhaar",           idProofNumber: "AADH-7007-2025", status: "checked-out" },
  { guestName: "Harish Tiwari",      email: "harish.tiwari@gmail.com",   roomNumber: "103", checkInDate: d(-6),  checkOutDate: d(-4),  numberOfGuests: 3, phone: 9210987654, idProof: "Voter ID",          idProofNumber: "VOTE-1111-2025", status: "checked-out" },
  { guestName: "Divya Krishnamurthy",email: "divya.krishna@gmail.com",   roomNumber: "101", checkInDate: d(-4),  checkOutDate: d(-2),  numberOfGuests: 1, phone: 9321098765, idProof: "Aadhaar",           idProofNumber: "AADH-1010-2025", status: "checked-out" },
  { guestName: "Meera Iyer",         email: "meera.iyer@gmail.com",      roomNumber: "201", checkInDate: d(-20), checkOutDate: d(-18), numberOfGuests: 2, phone: 9765432100, idProof: "Passport",          idProofNumber: "PASS-6006-2025", status: "checked-out" },
  { guestName: "Vikram Reddy",       email: "vikram.reddy@hotmail.com",  roomNumber: "401", checkInDate: d(-15), checkOutDate: d(-12), numberOfGuests: 3, phone: 9876012345, idProof: "Driving License",   idProofNumber: "DL-5005-PREV",   status: "checked-out" },
];

const savedCheckins = [];
for (const c of checkinsData) {
  const existing = await Checkin.findOne({ email: c.email, roomNumber: c.roomNumber, checkInDate: c.checkInDate });
  if (existing) {
    savedCheckins.push(existing);
  } else {
    savedCheckins.push(await Checkin.create(c));
  }
}
console.log(`✔  Check-ins: ${savedCheckins.length} upserted`);

// ════════════════════════════════════════════════════════════════════════════
// 5. CHECKOUTS
// ════════════════════════════════════════════════════════════════════════════
// Only completed stays get a checkout record
const checkoutsData = [
  { roomNumber: "302", guestName: "Arjun Sharma",        checkInDate: d(-10), checkOutDate: d(-7),  roomCharges: 22500, foodCharges: 3200,  extraCharges: 500,  discount: 0,    totalAmount: 26200,  paymentMethod: "UPI",          paymentStatus: "Paid", remarks: "Happy with stay." },
  { roomNumber: "401", guestName: "Priya Nair",           checkInDate: d(-5),  checkOutDate: d(-2),  roomCharges: 42000, foodCharges: 8500,  extraCharges: 1500, discount: 2000, totalAmount: 50000,  paymentMethod: "Card",         paymentStatus: "Paid", remarks: "Honeymoon package — excellent feedback." },
  { roomNumber: "502", guestName: "Vikram Reddy",         checkInDate: d(-7),  checkOutDate: d(-4),  roomCharges: 114000, foodCharges: 22000, extraCharges: 5000, discount: 10000, totalAmount: 131000, paymentMethod: "Bank Transfer", paymentStatus: "Paid", remarks: "VIP — repeat guest discount applied." },
  { roomNumber: "201", guestName: "Meera Iyer",           checkInDate: d(-20), checkOutDate: d(-18), roomCharges: 9000,  foodCharges: 1800,  extraCharges: 0,    discount: 0,    totalAmount: 10800,  paymentMethod: "Cash",         paymentStatus: "Paid", remarks: "" },
  { roomNumber: "102", guestName: "Anand Joshi",          checkInDate: d(-8),  checkOutDate: d(-6),  roomCharges: 5000,  foodCharges: 750,   extraCharges: 0,    discount: 0,    totalAmount: 5750,   paymentMethod: "UPI",          paymentStatus: "Paid", remarks: "Late night checkout." },
  { roomNumber: "103", guestName: "Harish Tiwari",        checkInDate: d(-6),  checkOutDate: d(-4),  roomCharges: 5600,  foodCharges: 1200,  extraCharges: 300,  discount: 0,    totalAmount: 7100,   paymentMethod: "Cash",         paymentStatus: "Paid", remarks: "" },
  { roomNumber: "101", guestName: "Divya Krishnamurthy",  checkInDate: d(-4),  checkOutDate: d(-2),  roomCharges: 5000,  foodCharges: 600,   extraCharges: 0,    discount: 0,    totalAmount: 5600,   paymentMethod: "UPI",          paymentStatus: "Paid", remarks: "" },
  { roomNumber: "401", guestName: "Vikram Reddy",         checkInDate: d(-15), checkOutDate: d(-12), roomCharges: 42000, foodCharges: 9000,  extraCharges: 2000, discount: 3000, totalAmount: 50000,  paymentMethod: "Card",         paymentStatus: "Paid", remarks: "Previous visit checkout." },
];

const savedCheckouts = [];
for (const c of checkoutsData) {
  const existing = await Checkout.findOne({ roomNumber: c.roomNumber, guestName: c.guestName, checkInDate: c.checkInDate });
  if (existing) {
    savedCheckouts.push(existing);
  } else {
    savedCheckouts.push(await Checkout.create(c));
  }
}
console.log(`✔  Checkouts: ${savedCheckouts.length} upserted`);

// ════════════════════════════════════════════════════════════════════════════
// 6. FOOD ORDERS
// ════════════════════════════════════════════════════════════════════════════
const foodOrdersData = [
  {
    roomNumber: "202", guestName: "Rajesh Gupta",
    orderedItems: [
      { itemName: "Paneer Butter Masala", quantity: 1, price: 380 },
      { itemName: "Butter Naan (x4)",     quantity: 1, price: 200 },
      { itemName: "Dal Makhani",           quantity: 1, price: 320 },
      { itemName: "Masala Chai",           quantity: 2, price: 80  },
    ],
    totalAmount: 1060, orderStatus: "Delivered", paymentStatus: "Paid", remarks: "Extra spicy."
  },
  {
    roomNumber: "303", guestName: "Sneha Kulkarni",
    orderedItems: [
      { itemName: "Veg Thali",           quantity: 3, price: 450 },
      { itemName: "Gulab Jamun",         quantity: 2, price: 120 },
      { itemName: "Fresh Lime Soda",     quantity: 2, price: 90  },
    ],
    totalAmount: 1710, orderStatus: "Delivered", paymentStatus: "Pending", remarks: "Vegetarian only."
  },
  {
    roomNumber: "301", guestName: "Kavitha Menon",
    orderedItems: [
      { itemName: "Continental Breakfast", quantity: 1, price: 650 },
      { itemName: "Orange Juice",          quantity: 1, price: 180 },
    ],
    totalAmount: 830, orderStatus: "Preparing", paymentStatus: "Pending", remarks: "Deliver by 8 AM."
  },
  {
    roomNumber: "102", guestName: "Suresh Patel",
    orderedItems: [
      { itemName: "Club Sandwich",    quantity: 2, price: 350 },
      { itemName: "French Fries",     quantity: 1, price: 220 },
      { itemName: "Cold Coffee",      quantity: 2, price: 160 },
    ],
    totalAmount: 1240, orderStatus: "Delivered", paymentStatus: "Paid", remarks: ""
  },
  {
    roomNumber: "302", guestName: "Rohan Singh",
    orderedItems: [
      { itemName: "Chicken Biryani",   quantity: 1, price: 480 },
      { itemName: "Raita",             quantity: 1, price: 100 },
      { itemName: "Mango Lassi",       quantity: 1, price: 150 },
    ],
    totalAmount: 730, orderStatus: "Pending", paymentStatus: "Pending", remarks: "Room service ASAP."
  },
  {
    roomNumber: "202", guestName: "Lakshmi Pillai",
    orderedItems: [
      { itemName: "Idli Sambar (x6)",   quantity: 1, price: 300 },
      { itemName: "Filter Coffee",      quantity: 2, price: 100 },
      { itemName: "Medu Vada",          quantity: 1, price: 180 },
    ],
    totalAmount: 680, orderStatus: "Delivered", paymentStatus: "Paid", remarks: "South Indian preference."
  },
  {
    roomNumber: "401", guestName: "Priya Nair",
    orderedItems: [
      { itemName: "Champagne (Bottle)", quantity: 1, price: 4500 },
      { itemName: "Fruit Platter",      quantity: 1, price: 800 },
      { itemName: "Chocolate Fondue",   quantity: 1, price: 650 },
    ],
    totalAmount: 5950, orderStatus: "Delivered", paymentStatus: "Paid", remarks: "Honeymoon special — delivered with rose petals."
  },
  {
    roomNumber: "502", guestName: "Vikram Reddy",
    orderedItems: [
      { itemName: "Butter Chicken",     quantity: 2, price: 480 },
      { itemName: "Garlic Naan (x6)",   quantity: 1, price: 300 },
      { itemName: "Malai Kofta",        quantity: 1, price: 380 },
      { itemName: "Soft Drinks (x4)",   quantity: 1, price: 320 },
      { itemName: "Gulab Jamun",        quantity: 2, price: 120 },
    ],
    totalAmount: 2080, orderStatus: "Delivered", paymentStatus: "Paid", remarks: "VIP — priority delivery."
  },
  {
    roomNumber: "103", guestName: "Harish Tiwari",
    orderedItems: [
      { itemName: "Aloo Paratha (x4)",  quantity: 1, price: 280 },
      { itemName: "Pickle & Curd",      quantity: 1, price: 80  },
      { itemName: "Tea",                quantity: 3, price: 60  },
    ],
    totalAmount: 540, orderStatus: "Delivered", paymentStatus: "Paid", remarks: ""
  },
  {
    roomNumber: "302", guestName: "Arjun Sharma",
    orderedItems: [
      { itemName: "Caesar Salad",       quantity: 1, price: 350 },
      { itemName: "Grilled Fish",       quantity: 1, price: 680 },
      { itemName: "Mocktail",           quantity: 2, price: 220 },
    ],
    totalAmount: 1470, orderStatus: "Delivered", paymentStatus: "Paid", remarks: "Light dinner."
  },
];

let foodCount = 0;
for (const f of foodOrdersData) {
  const existing = await FoodOrder.findOne({ roomNumber: f.roomNumber, guestName: f.guestName, totalAmount: f.totalAmount });
  if (!existing) {
    await FoodOrder.create(f);
    foodCount++;
  }
}
console.log(`✔  Food Orders: ${foodCount} inserted (existing skipped)`);

// ════════════════════════════════════════════════════════════════════════════
// 7. INVOICES
// ════════════════════════════════════════════════════════════════════════════
const invoicesData = [
  {
    invoiceNumber: "INV-2025-001", guest: G("arjun.sharma@gmail.com"),  booking: savedBookings["BK-2025-001"], room: R("302"),
    roomCharges: 22500, foodCharges: 3200, extraCharges: 500, discount: 0,    taxPercentage: 12, taxAmount: 3144, subtotal: 26200, totalAmount: 29344, paymentMethod: "UPI",          paymentStatus: "Paid",    amountPaid: 29344, balanceAmount: 0,     invoiceStatus: "Paid",   remarks: "Full payment received at checkout.",
    payments: [{ amount: 7500, paymentMethod: "UPI", remarks: "Advance" }, { amount: 21844, paymentMethod: "UPI", remarks: "Balance at checkout" }]
  },
  {
    invoiceNumber: "INV-2025-002", guest: G("priya.nair@outlook.com"),   booking: savedBookings["BK-2025-002"], room: R("401"),
    roomCharges: 42000, foodCharges: 8500, extraCharges: 1500, discount: 2000, taxPercentage: 12, taxAmount: 6000, subtotal: 50000, totalAmount: 56000, paymentMethod: "Card",         paymentStatus: "Paid",    amountPaid: 56000, balanceAmount: 0,     invoiceStatus: "Paid",   remarks: "Honeymoon package — discount applied.",
    payments: [{ amount: 14000, paymentMethod: "Card", remarks: "Advance" }, { amount: 42000, paymentMethod: "Card", remarks: "Checkout payment" }]
  },
  {
    invoiceNumber: "INV-2025-003", guest: G("rajesh.gupta@yahoo.com"),   booking: savedBookings["BK-2025-003"], room: R("202"),
    roomCharges: 13500, foodCharges: 1060, extraCharges: 0, discount: 0,    taxPercentage: 12, taxAmount: 1747.2, subtotal: 14560, totalAmount: 16307.2, paymentMethod: "Bank Transfer", paymentStatus: "Partial", amountPaid: 4500, balanceAmount: 11807.2, invoiceStatus: "Issued", remarks: "Corporate billing — balance on checkout.",
    payments: [{ amount: 4500, paymentMethod: "Bank Transfer", remarks: "Advance paid" }]
  },
  {
    invoiceNumber: "INV-2025-004", guest: G("sneha.kulkarni@gmail.com"), booking: savedBookings["BK-2025-004"], room: R("303"),
    roomCharges: 24000, foodCharges: 1710, extraCharges: 0, discount: 0,    taxPercentage: 12, taxAmount: 3085.2, subtotal: 25710, totalAmount: 28795.2, paymentMethod: "UPI",          paymentStatus: "Paid",    amountPaid: 28795.2, balanceAmount: 0, invoiceStatus: "Paid", remarks: "",
    payments: [{ amount: 8000, paymentMethod: "UPI", remarks: "Advance" }, { amount: 20795.2, paymentMethod: "UPI", remarks: "Checkout" }]
  },
  {
    invoiceNumber: "INV-2025-005", guest: G("vikram.reddy@hotmail.com"), booking: savedBookings["BK-2025-005"], room: R("502"),
    roomCharges: 114000, foodCharges: 22000, extraCharges: 5000, discount: 10000, taxPercentage: 12, taxAmount: 15720, subtotal: 131000, totalAmount: 146720, paymentMethod: "Bank Transfer", paymentStatus: "Paid", amountPaid: 146720, balanceAmount: 0, invoiceStatus: "Paid", remarks: "VIP — loyalty discount applied.",
    payments: [{ amount: 38000, paymentMethod: "Bank Transfer", remarks: "Advance" }, { amount: 108720, paymentMethod: "Bank Transfer", remarks: "Checkout" }]
  },
  {
    invoiceNumber: "INV-2025-006", guest: G("meera.iyer@gmail.com"),     booking: savedBookings["BK-2025-006"], room: R("201"),
    roomCharges: 9000, foodCharges: 1800, extraCharges: 0, discount: 0,    taxPercentage: 12, taxAmount: 1296, subtotal: 10800, totalAmount: 12096, paymentMethod: "Cash", paymentStatus: "Paid", amountPaid: 12096, balanceAmount: 0, invoiceStatus: "Paid", remarks: "",
    payments: [{ amount: 12096, paymentMethod: "Cash", remarks: "Full payment at checkout" }]
  },
  {
    invoiceNumber: "INV-2025-007", guest: G("kavitha.menon@yahoo.com"),  booking: savedBookings["BK-2025-008"], room: R("301"),
    roomCharges: 22500, foodCharges: 830, extraCharges: 0, discount: 0,    taxPercentage: 12, taxAmount: 2799.6, subtotal: 23330, totalAmount: 26129.6, paymentMethod: "Card", paymentStatus: "Partial", amountPaid: 7500, balanceAmount: 18629.6, invoiceStatus: "Issued", remarks: "Balance due at checkout.",
    payments: [{ amount: 7500, paymentMethod: "Card", remarks: "Advance" }]
  },
  {
    invoiceNumber: "INV-2025-008", guest: G("suresh.patel@gmail.com"),   booking: savedBookings["BK-2025-009"], room: R("102"),
    roomCharges: 17500, foodCharges: 1240, extraCharges: 0, discount: 500, taxPercentage: 12, taxAmount: 2189.28, subtotal: 18240, totalAmount: 20429.28, paymentMethod: "UPI", paymentStatus: "Partial", amountPaid: 5000, balanceAmount: 15429.28, invoiceStatus: "Issued", remarks: "Long-stay rate applied.",
    payments: [{ amount: 5000, paymentMethod: "UPI", remarks: "Advance" }]
  },
  {
    invoiceNumber: "INV-2025-009", guest: G("rohan.singh@gmail.com"),    booking: savedBookings["BK-2025-013"], room: R("302"),
    roomCharges: 22500, foodCharges: 730, extraCharges: 0, discount: 0,    taxPercentage: 12, taxAmount: 2789.6, subtotal: 23230, totalAmount: 26019.6, paymentMethod: "Card", paymentStatus: "Pending", amountPaid: 0, balanceAmount: 26019.6, invoiceStatus: "Issued", remarks: "Payment pending.",
    payments: []
  },
  {
    invoiceNumber: "INV-2025-010", guest: G("aditya.chopra@yahoo.com"),  booking: savedBookings["BK-2025-015"], room: R("403"),
    roomCharges: 60000, foodCharges: 0, extraCharges: 0, discount: 0,    taxPercentage: 12, taxAmount: 7200, subtotal: 60000, totalAmount: 67200, paymentMethod: "Card", paymentStatus: "Partial", amountPaid: 15000, balanceAmount: 52200, invoiceStatus: "Issued", remarks: "Pre-booking invoice.",
    payments: [{ amount: 15000, paymentMethod: "Card", remarks: "Advance booking" }]
  },
];

let invCount = 0;
for (const inv of invoicesData) {
  const existing = await Invoice.findOne({ invoiceNumber: inv.invoiceNumber });
  if (!existing) {
    await Invoice.create(inv);
    invCount++;
  }
}
console.log(`✔  Invoices: ${invCount} inserted (existing skipped)`);

// ════════════════════════════════════════════════════════════════════════════
// 8. HOUSEKEEPING TASKS
// ════════════════════════════════════════════════════════════════════════════
const housekeepingData = [
  { roomNumber: "101", taskType: "cleaning",    status: "done",        assignedTo: "Linda Fernandez", priority: "high",   notes: "Standard check-out cleaning.",          dueDate: d(-2) },
  { roomNumber: "102", taskType: "turndown",    status: "in-progress", assignedTo: "Susan Mathews",   priority: "normal", notes: "Guest in room — evening turndown.",     dueDate: d(0)  },
  { roomNumber: "103", taskType: "cleaning",    status: "pending",     assignedTo: "Robert D'Souza",  priority: "high",   notes: "Post checkout — deep clean required.",  dueDate: d(0)  },
  { roomNumber: "201", taskType: "inspection",  status: "done",        assignedTo: "Maria Alves",     priority: "normal", notes: "Pre-arrival inspection passed.",         dueDate: d(-5) },
  { roomNumber: "202", taskType: "cleaning",    status: "in-progress", assignedTo: "Linda Fernandez", priority: "normal", notes: "Current guest requested mid-stay clean.",dueDate: d(0)  },
  { roomNumber: "203", taskType: "cleaning",    status: "done",        assignedTo: "David Kumar",     priority: "normal", notes: "Room prepped for upcoming reservation.", dueDate: d(1)  },
  { roomNumber: "204", taskType: "maintenance", status: "in-progress", assignedTo: "Ravi Nair",       priority: "high",   notes: "AC compressor replacement in progress.",dueDate: d(0)  },
  { roomNumber: "301", taskType: "turndown",    status: "pending",     assignedTo: "Susan Mathews",   priority: "normal", notes: "Evening service scheduled.",             dueDate: d(0)  },
  { roomNumber: "302", taskType: "cleaning",    status: "done",        assignedTo: "Maria Alves",     priority: "normal", notes: "Pre-arrival clean for new guest.",       dueDate: d(0)  },
  { roomNumber: "303", taskType: "cleaning",    status: "in-progress", assignedTo: "Robert D'Souza",  priority: "high",   notes: "Mid-stay clean — family with child.",   dueDate: d(0)  },
  { roomNumber: "401", taskType: "inspection",  status: "done",        assignedTo: "Linda Fernandez", priority: "high",   notes: "VIP suite pre-arrival inspection.",      dueDate: d(-5) },
  { roomNumber: "402", taskType: "cleaning",    status: "done",        assignedTo: "David Kumar",     priority: "normal", notes: "Vacant — weekly freshen-up done.",       dueDate: d(-1) },
  { roomNumber: "403", taskType: "cleaning",    status: "pending",     assignedTo: "Maria Alves",     priority: "high",   notes: "Prepare for VIP family arrival.",        dueDate: d(2)  },
  { roomNumber: "501", taskType: "inspection",  status: "done",        assignedTo: "Ravi Nair",       priority: "normal", notes: "Monthly presidential suite inspection.", dueDate: d(-3) },
  { roomNumber: "502", taskType: "cleaning",    status: "done",        assignedTo: "Susan Mathews",   priority: "high",   notes: "Post-VIP checkout deep clean.",          dueDate: d(-4) },
  { roomNumber: "101", taskType: "inspection",  status: "pending",     assignedTo: "Robert D'Souza",  priority: "low",    notes: "Routine quarterly inspection.",         dueDate: d(3)  },
  { roomNumber: "201", taskType: "turndown",    status: "pending",     assignedTo: "Linda Fernandez", priority: "normal", notes: "New guest arriving tonight.",            dueDate: d(0)  },
];

let hkCount = 0;
for (const task of housekeepingData) {
  const existing = await HouseKeepingTask.findOne({ roomNumber: task.roomNumber, taskType: task.taskType, dueDate: task.dueDate });
  if (!existing) {
    await HouseKeepingTask.create(task);
    hkCount++;
  }
}
console.log(`✔  Housekeeping Tasks: ${hkCount} inserted (existing skipped)`);

// ── Done ─────────────────────────────────────────────────────────────────────
await mongoose.disconnect();
console.log("\n🎉  Seed complete! All sample data is now in MongoDB.\n");
