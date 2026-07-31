import express from "express";
import {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
} from "../controllers/guestController.js";

const router = express.Router();

router.get("/", getGuests);
router.get("/:id", getGuestById);
router.post("/", createGuest);
router.put("/:id", updateGuest);
router.delete("/:id", deleteGuest);

export default router;
