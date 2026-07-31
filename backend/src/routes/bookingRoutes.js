import express from "express";
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  convertBookingToCheckIn,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", getBookings);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.patch("/:id/status", updateBookingStatus);
router.post("/:id/check-in", convertBookingToCheckIn);
router.delete("/:id", deleteBooking);

export default router;
