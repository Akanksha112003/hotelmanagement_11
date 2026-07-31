import express from "express";
import {
  getDashboardSummary,
  getRevenueReport,
  getOccupancyReport,
  getBookingReport,
  getGuestReport,
  getFoodReport,
  getPaymentReport,
  getHousekeepingReport,
} from "../controllers/reportController.js";

const router = express.Router();

// All routes are GET-only — read-only analytics. No writes.
router.get("/dashboard", getDashboardSummary);
router.get("/revenue", getRevenueReport);
router.get("/occupancy", getOccupancyReport);
router.get("/bookings", getBookingReport);
router.get("/guests", getGuestReport);
router.get("/food", getFoodReport);
router.get("/payments", getPaymentReport);
router.get("/housekeeping", getHousekeepingReport);

export default router;
