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
  getMyProfile,
  updateMyProfile,
  getRoomSettings,
  updateRoomSettings,
} from "../controllers/settingsController.js";

const router = Router();

router.get("/hotel", protect, getHotelProfile);
router.put("/hotel", protect, updateHotelProfile);

router.get("/rooms", protect, getRooms);
router.post("/rooms", protect, addRoom);
router.delete("/rooms/:id", protect, deleteRoom);

// Room Configuration Settings
router.get("/room-settings", protect, getRoomSettings);
router.put("/room-settings", protect, updateRoomSettings);

router.get("/users", protect, getUser);
router.post("/users", protect, addUser);
router.patch("/users/:id/role", protect, updateUserRole);
router.delete("/users/:id", protect, deleteUser);

// Authenticated User's own profile
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.put("/password", protect, Changepassword);

export default router;
