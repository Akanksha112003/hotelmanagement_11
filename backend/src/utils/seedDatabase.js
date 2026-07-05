import User from "../models/user.js";
import Hotel from "../models/hotel.js";
import Room from "../models/room.js";

export const seedDatabase = async () => {
  try {
    // 1. Seed Admin User
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: "Admin",
        email: "admin@hotel.com",
        password: "password123", // Will be hashed by pre-save hook
        role: "admin",
      });
      console.log("Seeded default admin user (admin@hotel.com / password123)");
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

    // 3. Seed Sample Rooms
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const sampleRooms = [
        { roomNumber: "101", floor: 1, type: "single", pricePerNight: 150, capacity: 1, status: "available" },
        { roomNumber: "102", floor: 1, type: "double", pricePerNight: 250, capacity: 2, status: "available" },
        { roomNumber: "201", floor: 2, type: "suite", pricePerNight: 500, capacity: 4, status: "available" },
        { roomNumber: "202", floor: 2, type: "suite", pricePerNight: 550, capacity: 4, status: "available" },
        { roomNumber: "301", floor: 3, type: "double", pricePerNight: 300, capacity: 2, status: "available" },
      ];
      await Room.insertMany(sampleRooms);
      console.log("Seeded default sample rooms.");
    } else {
      console.log("Rooms already exist. Skipping room seed.");
    }

    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  }
};
