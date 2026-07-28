import express from "express";
import {
  getCheckouts,
  createCheckout,
  getCheckoutById,
  updateCheckoutPayment,
  deleteCheckout,
} from "../controllers/checkoutController.js";

const router = express.Router();

router.get("/", getCheckouts);
router.post("/", createCheckout);
router.get("/:id", getCheckoutById);
router.patch("/:id/payment", updateCheckoutPayment);
router.delete("/:id", deleteCheckout);

export default router;
