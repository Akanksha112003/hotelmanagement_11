import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/housekeepingController.js";
import { protect } from "../middleWare/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.patch("/:id/status", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
