import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    checkinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checkin",
      default: null,
    },
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
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOutDate: {
      type: Date,
      default: Date.now,
    },
    roomCharges: {
      type: Number,
      required: [true, "Room charges are required"],
      min: [0, "Room charges cannot be negative"],
    },
    foodCharges: {
      type: Number,
      default: 0,
      min: [0, "Food charges cannot be negative"],
    },
    extraCharges: {
      type: Number,
      default: 0,
      min: [0, "Extra charges cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["Cash", "Card", "UPI", "Bank Transfer"],
        message: "Invalid payment method",
      },
      default: "Cash",
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required"],
      enum: {
        values: ["Pending", "Paid"],
        message: "Invalid payment status",
      },
      default: "Paid",
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

const Checkout =
  mongoose.models.Checkout || mongoose.model("Checkout", checkoutSchema);

export default Checkout;
