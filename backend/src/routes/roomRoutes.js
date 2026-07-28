import express from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/", getRooms);
router.post("/", createRoom);
router.get("/:id", getRoomById);
router.put("/:id", updateRoom);
router.patch("/:id/status", updateRoomStatus);
router.delete("/:id", deleteRoom);

export default router;
