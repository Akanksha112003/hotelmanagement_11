import { useState, useEffect } from "react";
import { getRooms } from "../api";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

export default function EditBookingModal({ booking, onClose, onSubmit, loading, error }) {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    bookingSource: "Website",
    bookingStatus: "Confirmed",
    paymentStatus: "Pending",
    advanceAmount: 0,
    totalAmount: 0,
    specialRequests: "",
    remarks: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await getRooms();
      setRooms(res.data || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (booking) {
      setForm({
        checkInDate: booking.checkInDate
          ? new Date(booking.checkInDate).toISOString().split("T")[0]
          : "",
        checkOutDate: booking.checkOutDate
          ? new Date(booking.checkOutDate).toISOString().split("T")[0]
          : "",
        adults: booking.adults || 1,
        children: booking.children || 0,
        bookingSource: booking.bookingSource || "Website",
        bookingStatus: booking.bookingStatus || "Confirmed",
        paymentStatus: booking.paymentStatus || "Pending",
        advanceAmount: booking.advanceAmount || 0,
        totalAmount: booking.totalAmount || 0,
        specialRequests: booking.specialRequests || "",
        remarks: booking.remarks || "",
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.checkInDate || !form.checkOutDate) {
      setFormError("Check-in and Check-out dates are required.");
      return;
    }
    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      setFormError("Check-out date must be after Check-in date.");
      return;
    }

    onSubmit({
      ...form,
      adults: Number(form.adults) || 1,
      children: Number(form.children) || 0,
      advanceAmount: Number(form.advanceAmount) || 0,
      totalAmount: Number(form.totalAmount) || 0,
    });
  };

  const guestName = booking?.guest?.fullName || "Guest";
  const roomNum = booking?.room?.roomNumber || "Unassigned";

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Edit Reservation</span>
            <h3 className="text-2xl font-light font-display">{booking?.bookingNumber} ({guestName} • Room {roomNum})</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-xs font-medium">
              {formError || error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Check-In Date */}
            <div>
              <label className={labelCls}>Check-In Date *</label>
              <input
                type="date"
                name="checkInDate"
                required
                value={form.checkInDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Check-Out Date */}
            <div>
              <label className={labelCls}>Check-Out Date *</label>
              <input
                type="date"
                name="checkOutDate"
                required
                value={form.checkOutDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Adults */}
            <div>
              <label className={labelCls}>Adults *</label>
              <input
                type="number"
                min="1"
                name="adults"
                required
                value={form.adults}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Children */}
            <div>
              <label className={labelCls}>Children</label>
              <input
                type="number"
                min="0"
                name="children"
                value={form.children}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Booking Source */}
            <div>
              <label className={labelCls}>Booking Source</label>
              <select
                name="bookingSource"
                value={form.bookingSource}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Phone">Phone</option>
                <option value="OTA">OTA</option>
              </select>
            </div>

            {/* Booking Status */}
            <div>
              <label className={labelCls}>Booking Status</label>
              <select
                name="bookingStatus"
                value={form.bookingStatus}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className={labelCls}>Payment Status</label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Advance Amount */}
            <div>
              <label className={labelCls}>Advance Received ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="advanceAmount"
                value={form.advanceAmount}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Total Amount */}
            <div className="md:col-span-2">
              <label className={labelCls}>Total Amount ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="totalAmount"
                required
                value={form.totalAmount}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className={labelCls}>Special Requests</label>
            <textarea
              name="specialRequests"
              rows="2"
              value={form.specialRequests}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Internal Remarks</label>
            <textarea
              name="remarks"
              rows="2"
              value={form.remarks}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#17384F]/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-[#17384F]/20 text-[#17384F] text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-full bg-[#17384F] hover:bg-[#1E6F8E] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
