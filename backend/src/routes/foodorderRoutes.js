import express from "express";
import {
  getFoodOrders,
  createFoodOrder,
  getFoodOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteFoodOrder,
} from "../controllers/foodorderController.js";

const router = express.Router();

router.get("/", getFoodOrders);
router.post("/", createFoodOrder);
router.get("/:id", getFoodOrderById);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment", updatePaymentStatus);
router.delete("/:id", deleteFoodOrder);

export default router;
