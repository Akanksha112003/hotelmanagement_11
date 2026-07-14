/**
 * Backend Entry Point — Node.js ESM Bootstrap
 *
 * ESM Dotenv Strategy:
 *   `import "dotenv/config"` MUST be the first import. It is a side-effect
 *   module that calls dotenv.config() during its own module evaluation, which
 *   the ESM loader guarantees runs before any sibling import's code executes.
 *   This is the official Node.js ESM best practice for loading .env files.
 *
 * Startup Order (enforced):
 *   1. dotenv/config  → process.env populated
 *   2. connectDB()    → MongoDB Atlas connected
 *   3. seedDatabase() → default data initialised (idempotent)
 *   4. app.listen()   → server accepts requests
 */
import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/auth.js";
import checkinRoute from "./src/routes/checkin.js";
import housekeepingRoute from "./src/routes/housekeeping.js";
import settingsRoute from "./src/routes/settings.js";
import dashboardRoute from "./src/routes/dashboard.js";
import { errorHandler, notFound } from "./src/middleWare/errorMiddleware.js";
import { seedDatabase } from "./src/utils/seedDatabase.js";

// ─── Express App ────────────────────────────────────────────────────────────

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hotel Management API is running.",
  });
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/checkin", checkinRoute);
app.use("/api/housekeeping", housekeepingRoute);
app.use("/api/settings", settingsRoute);
app.use("/api/dashboard", dashboardRoute);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// ─── Startup Sequence ────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB Atlas — throws if MONGO_URI is missing or unreachable
    await connectDB();

    // Step 2: Seed default data if collections are empty (idempotent)
    await seedDatabase();

    // Step 3: Only begin accepting HTTP requests after DB is confirmed connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
