import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than 0"],
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Bank Transfer"],
      default: "Cash",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: [true, "Guest is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    checkout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checkout",
      default: null,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    roomCharges: {
      type: Number,
      default: 0,
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
    taxPercentage: {
      type: Number,
      default: 12,
      min: [0, "Tax percentage cannot be negative"],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, "Tax amount cannot be negative"],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: [0, "Subtotal cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Bank Transfer"],
      default: "Cash",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid", "Refunded"],
      default: "Pending",
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount paid cannot be negative"],
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: [0, "Balance amount cannot be negative"],
    },
    invoiceStatus: {
      type: String,
      enum: ["Draft", "Issued", "Paid", "Cancelled"],
      default: "Issued",
    },
    payments: [paymentTransactionSchema],
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
