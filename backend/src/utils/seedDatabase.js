import User from "../models/user.js";
import Hotel from "../models/hotel.js";
import Room from "../models/room.js";
import Checkin from "../models/checkin.js";
import HouseKeepingTask from "../models/housekeepingTask.js";

export const seedDatabase = async () => {
  try {
    // 1. Seed Users (Admin + Staff)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const usersToCreate = [
        { name: "Admin", email: "admin@hotel.com", password: "password123", role: "admin" },
        { name: "Receptionist Sarah", email: "sarah@hotel.com", password: "password123", role: "user" },
        { name: "Receptionist John", email: "john@hotel.com", password: "password123", role: "user" },
        { name: "Receptionist Emily", email: "emily@hotel.com", password: "password123", role: "user" },
        { name: "Housekeeping Maria", email: "maria@hotel.com", password: "password123", role: "user" },
        { name: "Housekeeping David", email: "david@hotel.com", password: "password123", role: "user" },
        { name: "Housekeeping Linda", email: "linda@hotel.com", password: "password123", role: "user" },
        { name: "Housekeeping Robert", email: "robert@hotel.com", password: "password123", role: "user" },
        { name: "Housekeeping Susan", email: "susan@hotel.com", password: "password123", role: "user" },
        { name: "Manager Michael", email: "michael@hotel.com", password: "password123", role: "admin" },
        { name: "Manager Jessica", email: "jessica@hotel.com", password: "password123", role: "admin" },
      ];
      // Use User.create so pre-save hook handles password hashing for each user
      await Promise.all(usersToCreate.map(u => User.create(u)));
      console.log("Seeded 11 users (admins and staff).");
    } else {
      console.log("Users already exist. Skipping user seed.");
    }

    // 2. Seed Hotel Profile
    const hotelCount = await Hotel.countDocuments();
    if (hotelCount === 0) {
      await Hotel.create({
        name: "Azure Coast Grand Hotel",
        address: "1 Ocean Drive",
        city: "Miami",
        country: "USA",
        phone: "+1 (800) 555-0199",
        email: "contact@azurecoast.com",
        website: "https://azurecoastgrand.com",
        description: "Experience the pinnacle of luxury at Azure Coast Grand Hotel, featuring panoramic ocean views and world-class amenities.",
        starRating: 5,
        checkInTime: "15:00",
        checkOutTime: "11:00",
        currency: "USD",
        taxRate: 10,
      });
      console.log("Seeded default hotel profile.");
    } else {
      console.log("Hotel profile already exists. Skipping hotel seed.");
    }

    // 3. Seed Rooms (20 Rooms)
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const sampleRooms = [
        { roomNumber: "101", floor: 1, type: "single", pricePerNight: 150, capacity: 1, status: "available" },
        { roomNumber: "102", floor: 1, type: "single", pricePerNight: 150, capacity: 1, status: "available" },
        { roomNumber: "103", floor: 1, type: "double", pricePerNight: 250, capacity: 2, status: "occupied" },
        { roomNumber: "104", floor: 1, type: "double", pricePerNight: 250, capacity: 2, status: "maintenance" },
        { roomNumber: "105", floor: 1, type: "single", pricePerNight: 160, capacity: 1, status: "available" },
        
        { roomNumber: "201", floor: 2, type: "deluxe", pricePerNight: 350, capacity: 3, status: "available" },
        { roomNumber: "202", floor: 2, type: "deluxe", pricePerNight: 350, capacity: 3, status: "occupied" },
        { roomNumber: "203", floor: 2, type: "suite", pricePerNight: 500, capacity: 4, status: "available" },
        { roomNumber: "204", floor: 2, type: "suite", pricePerNight: 550, capacity: 4, status: "reserved" },
        { roomNumber: "205", floor: 2, type: "double", pricePerNight: 260, capacity: 2, status: "available" },
        
        { roomNumber: "301", floor: 3, type: "suite", pricePerNight: 500, capacity: 4, status: "occupied" },
        { roomNumber: "302", floor: 3, type: "suite", pricePerNight: 550, capacity: 4, status: "available" },
        { roomNumber: "303", floor: 3, type: "presidential", pricePerNight: 1200, capacity: 6, status: "reserved" },
        { roomNumber: "304", floor: 3, type: "deluxe", pricePerNight: 400, capacity: 3, status: "available" },
        { roomNumber: "305", floor: 3, type: "deluxe", pricePerNight: 400, capacity: 3, status: "maintenance" },
        
        { roomNumber: "401", floor: 4, type: "presidential", pricePerNight: 1500, capacity: 6, status: "available" },
        { roomNumber: "402", floor: 4, type: "suite", pricePerNight: 600, capacity: 4, status: "occupied" },
        { roomNumber: "403", floor: 4, type: "double", pricePerNight: 280, capacity: 2, status: "available" },
        { roomNumber: "404", floor: 4, type: "double", pricePerNight: 280, capacity: 2, status: "available" },
        { roomNumber: "405", floor: 4, type: "single", pricePerNight: 180, capacity: 1, status: "reserved" },
      ];
      await Room.insertMany(sampleRooms);
      console.log("Seeded 20 sample rooms.");
    } else {
      console.log("Rooms already exist. Skipping room seed.");
    }

    // 4. Seed Checkins / Reservations
    const checkinCount = await Checkin.countDocuments();
    if (checkinCount === 0) {
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
      
      const sampleCheckins = [
        { guestName: "Alice Smith", email: "alice@example.com", roomNumber: "103", checkInDate: yesterday, checkOutDate: tomorrow, numberOfGuests: 2, phone: 1234567890, idProof: "Passport", idProofNumber: "P12345", status: "checked-in" },
        { guestName: "Bob Johnson", email: "bob@example.com", roomNumber: "202", checkInDate: today, checkOutDate: nextWeek, numberOfGuests: 2, phone: 1234567890, idProof: "National ID", idProofNumber: "N12345", status: "checked-in" },
        { guestName: "Charlie Brown", email: "charlie@example.com", roomNumber: "301", checkInDate: yesterday, checkOutDate: tomorrow, numberOfGuests: 4, phone: 1234567890, idProof: "Driver License", idProofNumber: "D12345", status: "checked-in" },
        { guestName: "David Williams", email: "david@example.com", roomNumber: "402", checkInDate: today, checkOutDate: nextWeek, numberOfGuests: 2, phone: 1234567890, idProof: "Passport", idProofNumber: "P98765", status: "checked-in" },
        { guestName: "Eve Davis", email: "eve@example.com", roomNumber: "204", checkInDate: tomorrow, checkOutDate: nextWeek, numberOfGuests: 2, phone: 1234567890, idProof: "National ID", idProofNumber: "N98765", status: "booked" },
        { guestName: "Frank Miller", email: "frank@example.com", roomNumber: "303", checkInDate: tomorrow, checkOutDate: nextWeek, numberOfGuests: 4, phone: 1234567890, idProof: "Driver License", idProofNumber: "D98765", status: "booked" },
        { guestName: "Grace Wilson", email: "grace@example.com", roomNumber: "405", checkInDate: tomorrow, checkOutDate: nextWeek, numberOfGuests: 1, phone: 1234567890, idProof: "Passport", idProofNumber: "P54321", status: "booked" },
        { guestName: "Harry Moore", email: "harry@example.com", roomNumber: "101", checkInDate: yesterday, checkOutDate: today, numberOfGuests: 1, phone: 1234567890, idProof: "National ID", idProofNumber: "N54321", status: "checked-out" },
        { guestName: "Ivy Taylor", email: "ivy@example.com", roomNumber: "102", checkInDate: yesterday, checkOutDate: today, numberOfGuests: 1, phone: 1234567890, idProof: "Driver License", idProofNumber: "D54321", status: "checked-out" },
        { guestName: "Jack Anderson", email: "jack@example.com", roomNumber: "201", checkInDate: yesterday, checkOutDate: today, numberOfGuests: 2, phone: 1234567890, idProof: "Passport", idProofNumber: "P11111", status: "checked-out" },
      ];
      await Checkin.insertMany(sampleCheckins);
      console.log("Seeded 10 check-in records.");
    } else {
      console.log("Check-ins already exist. Skipping check-in seed.");
    }

    // 5. Seed Housekeeping Tasks
    const hkCount = await HouseKeepingTask.countDocuments();
    if (hkCount === 0) {
      const today = new Date();
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      
      const sampleHKTasks = [
        { roomNumber: "104", taskType: "maintenance", status: "in-progress", assignedTo: "Housekeeping Maria", priority: "high", notes: "Fix leaking sink", dueDate: today },
        { roomNumber: "305", taskType: "maintenance", status: "pending", assignedTo: "Housekeeping David", priority: "normal", notes: "Replace AC filter", dueDate: tomorrow },
        { roomNumber: "101", taskType: "cleaning", status: "done", assignedTo: "Housekeeping Linda", priority: "high", notes: "Clean after check-out", dueDate: today },
        { roomNumber: "102", taskType: "cleaning", status: "pending", assignedTo: "Housekeeping Robert", priority: "high", notes: "Clean after check-out", dueDate: today },
        { roomNumber: "201", taskType: "cleaning", status: "done", assignedTo: "Housekeeping Susan", priority: "high", notes: "Clean after check-out", dueDate: today },
        { roomNumber: "103", taskType: "turndown", status: "pending", assignedTo: "Housekeeping Maria", priority: "normal", notes: "Evening turndown service", dueDate: today },
        { roomNumber: "202", taskType: "turndown", status: "in-progress", assignedTo: "Housekeeping David", priority: "normal", notes: "Evening turndown service", dueDate: today },
        { roomNumber: "301", taskType: "turndown", status: "pending", assignedTo: "Housekeeping Linda", priority: "low", notes: "Evening turndown service", dueDate: today },
        { roomNumber: "402", taskType: "turndown", status: "pending", assignedTo: "Housekeeping Robert", priority: "normal", notes: "Evening turndown service", dueDate: today },
        { roomNumber: "203", taskType: "inspection", status: "pending", assignedTo: "Manager Michael", priority: "normal", notes: "Routine room inspection", dueDate: tomorrow },
        { roomNumber: "204", taskType: "cleaning", status: "pending", assignedTo: "Housekeeping Susan", priority: "high", notes: "Pre-arrival cleaning", dueDate: tomorrow },
        { roomNumber: "303", taskType: "cleaning", status: "pending", assignedTo: "Housekeeping Maria", priority: "high", notes: "Pre-arrival cleaning", dueDate: tomorrow },
        { roomNumber: "405", taskType: "cleaning", status: "pending", assignedTo: "Housekeeping David", priority: "high", notes: "Pre-arrival cleaning", dueDate: tomorrow },
        { roomNumber: "401", taskType: "inspection", status: "pending", assignedTo: "Manager Jessica", priority: "normal", notes: "Routine room inspection", dueDate: nextWeek },
        { roomNumber: "302", taskType: "turndown", status: "done", assignedTo: "Housekeeping Linda", priority: "low", notes: "Evening turndown service", dueDate: yesterday },
      ];
      await HouseKeepingTask.insertMany(sampleHKTasks);
      console.log("Seeded 15 housekeeping tasks.");
    } else {
      console.log("Housekeeping tasks already exist. Skipping housekeeping seed.");
    }

    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};
