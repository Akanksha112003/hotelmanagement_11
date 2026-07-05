import { Router } from "express";
import { protect } from "../middleWare/authMiddleware.js";
import {
  addRoom,
  addUser,
  Changepassword,
  deleteRoom,
  getHotelProfile,
  getRooms,
  getUser,
  updateHotelProfile,
  updateUserRole,
  deleteUser,
} from "../controllers/settingsController.js";

const router = Router();

router.get("/hotel", protect, getHotelProfile);
router.put("/hotel", protect, updateHotelProfile);

router.get("/rooms", protect, getRooms);
router.post("/rooms", protect, addRoom);
router.delete("/rooms/:id", protect, deleteRoom);

router.get("/users", protect, getUser);
router.post("/users", protect, addUser);
router.patch("/users/:id/role", protect, updateUserRole);
router.delete("/users/:id", protect, deleteUser);

router.put("/password", protect, Changepassword);

export default router;
