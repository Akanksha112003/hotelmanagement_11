import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Guest from "../models/Guest.js";
import Room from "../models/room.js";
import Checkout from "../models/Checkout.js";
import FoodOrder from "../models/FoodOrder.js";

/**
 * Generate sequential invoice number: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const prefix = `INV-${dateStr}-`;

  const countToday = await Invoice.countDocuments({
    invoiceNumber: new RegExp(`^${prefix}`),
  });

  const seq = String(countToday + 1).padStart(4, "0");
  return `${prefix}${seq}`;
};

/**
 * Perform server-side financial calculations
 */
const calculateInvoiceTotals = (params) => {
  const roomCharges = Math.max(0, Number(params.roomCharges) || 0);
  const foodCharges = Math.max(0, Number(params.foodCharges) || 0);
  const extraCharges = Math.max(0, Number(params.extraCharges) || 0);
  const discount = Math.max(0, Number(params.discount) || 0);
  const taxPercentage = Math.max(0, Number(params.taxPercentage) !== undefined ? Number(params.taxPercentage) : 12);
  const amountPaid = Math.max(0, Number(params.amountPaid) || 0);

  const subtotal = roomCharges + foodCharges + extraCharges;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Number((taxableAmount * (taxPercentage / 100)).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));
  const balanceAmount = Number(Math.max(0, totalAmount - amountPaid).toFixed(2));

  let paymentStatus = params.paymentStatus || "Pending";
  let invoiceStatus = params.invoiceStatus || "Issued";

  if (balanceAmount <= 0 && totalAmount >= 0) {
    paymentStatus = "Paid";
    invoiceStatus = "Paid";
  } else if (amountPaid > 0 && balanceAmount > 0) {
    paymentStatus = "Partial";
  }

  return {
    roomCharges,
    foodCharges,
    extraCharges,
    discount,
    taxPercentage,
    taxAmount,
    subtotal,
    totalAmount,
    amountPaid,
    balanceAmount,
    paymentStatus,
    invoiceStatus,
  };
};

/**
 * GET /api/invoices
 * Get all invoices populated with guest, booking, checkout, and room details
 */
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate("guest")
      .populate("booking")
      .populate("checkout")
      .populate("room")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
      invoices,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invoices/:id
 * Get single invoice by ID
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = await Invoice.findById(id)
      .populate("guest")
      .populate("booking")
      .populate("checkout")
      .populate("room");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    return res.status(200).json({ success: true, data: invoice, invoice });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/invoices
 * Create a new invoice with duplicate checkout protection
 */
export const createInvoice = async (req, res, next) => {
  try {
    const {
      guest,
      booking,
      checkout,
      room,
      roomCharges,
      foodCharges,
      extraCharges,
      discount,
      taxPercentage,
      paymentMethod,
      amountPaid: initialPaid,
      remarks,
    } = req.body;

    if (!guest || !mongoose.Types.ObjectId.isValid(guest)) {
      return res.status(400).json({ success: false, message: "Valid guest is required" });
    }

    // Check duplicate invoice for checkout
    if (checkout && mongoose.Types.ObjectId.isValid(checkout)) {
      const existingInvoice = await Invoice.findOne({ checkout });
      if (existingInvoice) {
        return res.status(400).json({
          success: false,
          message: `An invoice (${existingInvoice.invoiceNumber}) has already been generated for this checkout.`,
        });
      }
    }

    const initialAmountPaid = Number(initialPaid) || 0;
    const totals = calculateInvoiceTotals({
      roomCharges,
      foodCharges,
      extraCharges,
      discount,
      taxPercentage,
      amountPaid: initialAmountPaid,
    });

    const invoiceNumber = await generateInvoiceNumber();

    const payments = [];
    if (initialAmountPaid > 0) {
      payments.push({
        amount: initialAmountPaid,
        paymentMethod: paymentMethod || "Cash",
        paidAt: new Date(),
        remarks: "Initial Payment upon Invoice Generation",
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      guest,
      booking: booking && mongoose.Types.ObjectId.isValid(booking) ? booking : null,
      checkout: checkout && mongoose.Types.ObjectId.isValid(checkout) ? checkout : null,
      room: room && mongoose.Types.ObjectId.isValid(room) ? room : null,
      ...totals,
      paymentMethod: paymentMethod || "Cash",
      payments,
      remarks: remarks ? String(remarks).trim() : "",
      issuedAt: new Date(),
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("guest")
      .populate("booking")
      .populate("checkout")
      .populate("room");

    return res.status(201).json({
      success: true,
      message: `Invoice ${invoiceNumber} generated successfully`,
      data: populatedInvoice,
      invoice: populatedInvoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/invoices/:id
 * Update invoice details (only allowed if not Paid)
 */
export const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Lock Paid Invoices
    if (existingInvoice.paymentStatus === "Paid" || existingInvoice.invoiceStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid invoices are locked and cannot be modified.",
      });
    }

    const {
      roomCharges,
      foodCharges,
      extraCharges,
      discount,
      taxPercentage,
      paymentMethod,
      invoiceStatus,
      remarks,
    } = req.body;

    const totals = calculateInvoiceTotals({
      roomCharges: roomCharges !== undefined ? roomCharges : existingInvoice.roomCharges,
      foodCharges: foodCharges !== undefined ? foodCharges : existingInvoice.foodCharges,
      extraCharges: extraCharges !== undefined ? extraCharges : existingInvoice.extraCharges,
      discount: discount !== undefined ? discount : existingInvoice.discount,
      taxPercentage: taxPercentage !== undefined ? taxPercentage : existingInvoice.taxPercentage,
      amountPaid: existingInvoice.amountPaid,
      paymentStatus: existingInvoice.paymentStatus,
      invoiceStatus: invoiceStatus || existingInvoice.invoiceStatus,
    });

    const updateFields = {
      ...totals,
    };
    if (paymentMethod) updateFields.paymentMethod = paymentMethod;
    if (remarks !== undefined) updateFields.remarks = String(remarks).trim();

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("guest")
      .populate("booking")
      .populate("checkout")
      .populate("room");

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
      invoice: updatedInvoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/invoices/:id/payment
 * Record a payment against an invoice (verifies overpayment prevention & payment history)
 */
export const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.paymentStatus === "Paid" || invoice.balanceAmount <= 0) {
      return res.status(400).json({ success: false, message: "This invoice is already fully paid." });
    }
    if (invoice.invoiceStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot record payment on a cancelled invoice." });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: "Payment amount must be greater than zero." });
    }

    // Overpayment prevention check
    if (payAmount > invoice.balanceAmount + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Overpayment prohibited. Payment amount ($${payAmount.toFixed(
          2
        )}) exceeds outstanding balance ($${invoice.balanceAmount.toFixed(2)}).`,
      });
    }

    const newAmountPaid = Number((invoice.amountPaid + payAmount).toFixed(2));
    const newBalanceAmount = Number(Math.max(0, invoice.totalAmount - newAmountPaid).toFixed(2));

    let newPaymentStatus = "Partial";
    let newInvoiceStatus = invoice.invoiceStatus;

    if (newBalanceAmount <= 0.01) {
      newPaymentStatus = "Paid";
      newInvoiceStatus = "Paid";
    }

    const paymentEntry = {
      amount: payAmount,
      paymentMethod: paymentMethod || invoice.paymentMethod || "Cash",
      paidAt: new Date(),
      remarks: remarks ? String(remarks).trim() : "Payment recorded",
    };

    invoice.amountPaid = newAmountPaid;
    invoice.balanceAmount = newBalanceAmount <= 0.01 ? 0 : newBalanceAmount;
    invoice.paymentStatus = newPaymentStatus;
    invoice.invoiceStatus = newInvoiceStatus;
    invoice.payments.push(paymentEntry);

    await invoice.save();

    const populatedInvoice = await Invoice.findById(id)
      .populate("guest")
      .populate("booking")
      .populate("checkout")
      .populate("room");

    return res.status(200).json({
      success: true,
      message: `Payment of $${payAmount.toFixed(2)} recorded successfully`,
      data: populatedInvoice,
      invoice: populatedInvoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/invoices/:id
 * Delete invoice (prohibited if Paid)
 */
export const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.paymentStatus === "Paid" || invoice.invoiceStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid invoices are locked and cannot be deleted.",
      });
    }

    await Invoice.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
