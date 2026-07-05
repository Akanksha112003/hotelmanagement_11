import express from "express";
import {
  createCheckin,
  deleteCheckin,
  getCheckins,
  updateCheckin,
} from "../controllers/checkinController.js";

const router = express.Router();

router.post("/", createCheckin);
router.get("/", getCheckins);
router.delete("/:id", deleteCheckin);
router.put("/:id", updateCheckin);

export default router;
