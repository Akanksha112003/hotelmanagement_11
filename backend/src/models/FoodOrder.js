import mongoose from "mongoose";

const orderedItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false }
);

const foodOrderSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    orderedItems: {
      type: [orderedItemSchema],
      required: [true, "Ordered items are required"],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Ordered items must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["Pending", "Preparing", "Delivered", "Cancelled"],
        message: "Invalid order status",
      },
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["Pending", "Paid"],
        message: "Invalid payment status",
      },
      default: "Pending",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const FoodOrder =
  mongoose.models.FoodOrder || mongoose.model("FoodOrder", foodOrderSchema);

export default FoodOrder;
