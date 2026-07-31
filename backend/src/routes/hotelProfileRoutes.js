import express from "express";
import {
  getHotelProfile,
  createHotelProfile,
  updateHotelProfile,
} from "../controllers/hotelProfileController.js";

const router = express.Router();

router.get("/", getHotelProfile);
router.post("/", createHotelProfile);
router.put("/", updateHotelProfile);

export default router;
