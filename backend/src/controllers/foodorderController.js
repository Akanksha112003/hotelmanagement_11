import mongoose from "mongoose";
import FoodOrder from "../models/FoodOrder.js";

const ALLOWED_ORDER_STATUSES = ["Pending", "Preparing", "Delivered", "Cancelled"];
const ALLOWED_PAYMENT_STATUSES = ["Pending", "Paid"];

/**
 * GET /foodorders
 * Get all food orders sorted by creation date descending
 */
export const getFoodOrders = async (req, res, next) => {
  try {
    const foodOrders = await FoodOrder.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: foodOrders.length,
      data: foodOrders,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /foodorders
 * Create a new food order (totalAmount calculated server-side)
 */
export const createFoodOrder = async (req, res, next) => {
  try {
    const {
      roomNumber,
      guestName,
      orderedItems,
      orderStatus,
      paymentStatus,
      remarks,
    } = req.body;

    // Validate required top-level fields
    if (!roomNumber || !guestName) {
      return res.status(400).json({
        success: false,
        message: "Room number and guest name are required",
      });
    }

    // Validate orderedItems array
    if (!orderedItems || !Array.isArray(orderedItems) || orderedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ordered items must contain at least one item",
      });
    }

    // Validate individual items and calculate totalAmount on server
    let totalAmount = 0;
    for (const item of orderedItems) {
      if (
        !item ||
        typeof item.itemName !== "string" ||
        !item.itemName.trim() ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.price !== "number" ||
        item.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each ordered item must have a valid itemName, quantity (> 0), and price (>= 0)",
        });
      }
      totalAmount += item.quantity * item.price;
    }

    // Validate statuses if provided
    if (orderStatus && !ALLOWED_ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    if (paymentStatus && !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    const foodOrder = await FoodOrder.create({
      roomNumber,
      guestName,
      orderedItems,
      totalAmount,
      orderStatus: orderStatus || "Pending",
      paymentStatus: paymentStatus || "Pending",
      remarks: remarks || "",
    });

    return res.status(201).json({
      success: true,
      message: "Food order created successfully",
      data: foodOrder,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /foodorders/:id
 * Get a single food order by ID
 */
export const getFoodOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    const foodOrder = await FoodOrder.findById(id);
    if (!foodOrder) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: foodOrder,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /foodorders/:id/status
 * Update the orderStatus of a food order
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, status } = req.body;
    const newStatus = orderStatus || status;

    if (!newStatus || !ALLOWED_ORDER_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    const foodOrder = await FoodOrder.findByIdAndUpdate(
      id,
      { orderStatus: newStatus },
      { returnDocument: "after", runValidators: true }
    );

    if (!foodOrder) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: foodOrder,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /foodorders/:id/payment
 * Update the paymentStatus of a food order
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    const foodOrder = await FoodOrder.findByIdAndUpdate(
      id,
      { paymentStatus },
      { returnDocument: "after", runValidators: true }
    );

    if (!foodOrder) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: foodOrder,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /foodorders/:id
 * Delete a food order by ID (verifies order exists first)
 */
export const deleteFoodOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    const foodOrder = await FoodOrder.findById(id);
    if (!foodOrder) {
      return res.status(404).json({
        success: false,
        message: "Food order not found",
      });
    }

    await FoodOrder.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Food order deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
