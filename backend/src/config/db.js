import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      "MONGO_URI is not defined. Check that your .env file is present and correctly configured."
    );
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000, // 30s — Atlas free tier can be slow to wake
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 — fixes querySrv ECONNREFUSED on Windows
  });

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

export default connectDB;
