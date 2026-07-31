import { useState, useEffect } from "react";
import { listGuests, getRooms } from "../api";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

export default function AddBookingModal({ onClose, onSubmit, loading, error }) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    guest: "",
    room: "",
    checkInDate: todayStr,
    checkOutDate: "",
    adults: 1,
    children: 0,
    bookingSource: "Website",
    bookingStatus: "Confirmed",
    paymentStatus: "Pending",
    advanceAmount: 0,
    totalAmount: "",
    specialRequests: "",
    remarks: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchFormDropdowns();
  }, []);

  async function fetchFormDropdowns() {
    try {
      const [guestRes, roomRes] = await Promise.all([
        listGuests().catch(() => ({ data: [] })),
        getRooms().catch(() => ({ data: [] })),
      ]);

      setGuests(guestRes.data || guestRes.guests || []);
      const allRooms = roomRes.data || [];
      // Filter out unavailable rooms (occupied, dirty, maintenance)
      const validRooms = allRooms.filter(
        (r) => !["occupied", "dirty", "maintenance"].includes(r.status)
      );
      setRooms(validRooms);
    } catch (err) {
      setFormError("Could not load guests or rooms list.");
    }
  }

  // Calculate suggested total when room or dates change
  useEffect(() => {
    if (form.room && form.checkInDate && form.checkOutDate) {
      const selectedRoom = rooms.find((r) => r._id === form.room);
      if (selectedRoom && selectedRoom.pricePerNight) {
        const start = new Date(form.checkInDate);
        const end = new Date(form.checkOutDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          setForm((prev) => ({
            ...prev,
            totalAmount: diffDays * selectedRoom.pricePerNight,
          }));
        }
      }
    }
  }, [form.room, form.checkInDate, form.checkOutDate, rooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.guest) {
      setFormError("Please select a guest.");
      return;
    }
    if (!form.room) {
      setFormError("Please select a room.");
      return;
    }
    if (!form.checkInDate || !form.checkOutDate) {
      setFormError("Check-in and Check-out dates are required.");
      return;
    }

    if (new Date(form.checkInDate) < new Date(todayStr)) {
      setFormError("Check-in date cannot be in the past.");
      return;
    }
    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      setFormError("Check-out date must be after Check-in date.");
      return;
    }
    if (Number(form.totalAmount) < 0 || isNaN(Number(form.totalAmount))) {
      setFormError("Total amount must be a valid non-negative number.");
      return;
    }

    onSubmit({
      ...form,
      adults: Number(form.adults) || 1,
      children: Number(form.children) || 0,
      advanceAmount: Number(form.advanceAmount) || 0,
      totalAmount: Number(form.totalAmount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">New Reservation</span>
            <h3 className="text-2xl font-light font-display">Create Booking</h3>
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
            {/* Select Guest */}
            <div>
              <label className={labelCls}>Select Guest *</label>
              <select
                name="guest"
                required
                value={form.guest}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Choose Registered Guest --</option>
                {guests.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.fullName} ({g.phone || g.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Room */}
            <div>
              <label className={labelCls}>Select Room *</label>
              <select
                name="room"
                required
                value={form.room}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Choose Available Room --</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} • {r.type} (${r.pricePerNight}/nt) [{r.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In Date */}
            <div>
              <label className={labelCls}>Check-In Date *</label>
              <input
                type="date"
                name="checkInDate"
                min={todayStr}
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
                min={form.checkInDate || todayStr}
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
                <option value="OTA">OTA (Online Travel Agent)</option>
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
                <option value="Confirmed">Confirmed (Reserve Room)</option>
                <option value="Pending">Pending</option>
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
                placeholder="Total reservation bill..."
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
              placeholder="Airport pickup, early check-in, dietary preferences..."
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
              placeholder="Staff notes..."
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
              {loading ? "Creating Reservation..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
