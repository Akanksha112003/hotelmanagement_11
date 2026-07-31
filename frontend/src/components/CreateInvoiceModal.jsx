import { useState, useEffect } from "react";
import { listGuests, getRooms, listCheckouts } from "../api";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

export default function CreateInvoiceModal({ onClose, onSubmit, loading, error }) {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [checkouts, setCheckouts] = useState([]);

  const [form, setForm] = useState({
    guest: "",
    room: "",
    checkout: "",
    roomCharges: 0,
    foodCharges: 0,
    extraCharges: 0,
    discount: 0,
    taxPercentage: 12,
    paymentMethod: "Cash",
    amountPaid: 0,
    remarks: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchDropdowns() {
    try {
      const [gRes, rRes, cRes] = await Promise.all([
        listGuests().catch(() => ({ data: [] })),
        getRooms().catch(() => ({ data: [] })),
        listCheckouts().catch(() => ({ data: [] })),
      ]);

      setGuests(gRes.data || gRes.guests || []);
      setRooms(rRes.data || []);
      setCheckouts(cRes.data || cRes.checkouts || []);
    } catch {
      // ignore
    }
  }

  // Handle Checkout Auto-Populate
  const handleCheckoutSelect = (e) => {
    const checkoutId = e.target.value;
    setForm((prev) => ({ ...prev, checkout: checkoutId }));

    if (!checkoutId) return;

    const selectedCo = checkouts.find((c) => c._id === checkoutId);
    if (selectedCo) {
      // Find guest & room match
      const matchedGuest = guests.find(
        (g) => g.fullName.toLowerCase() === selectedCo.guestName?.toLowerCase() || g.phone === selectedCo.phone
      );
      const matchedRoom = rooms.find((r) => r.roomNumber === String(selectedCo.roomNumber).trim());

      setForm((prev) => ({
        ...prev,
        guest: matchedGuest ? matchedGuest._id : prev.guest,
        room: matchedRoom ? matchedRoom._id : prev.room,
        roomCharges: selectedCo.roomCharges || 0,
        foodCharges: selectedCo.foodCharges || 0,
        extraCharges: selectedCo.extraCharges || 0,
        discount: selectedCo.discount || 0,
        amountPaid: selectedCo.paymentStatus === "Paid" ? selectedCo.totalAmount || 0 : 0,
        paymentMethod: selectedCo.paymentMethod || "Cash",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate live preview totals
  const roomC = Number(form.roomCharges) || 0;
  const foodC = Number(form.foodCharges) || 0;
  const extraC = Number(form.extraCharges) || 0;
  const disc = Number(form.discount) || 0;
  const taxPct = Number(form.taxPercentage) || 0;
  const initialPaid = Number(form.amountPaid) || 0;

  const previewSubtotal = roomC + foodC + extraC;
  const previewTaxable = Math.max(0, previewSubtotal - disc);
  const previewTax = Number((previewTaxable * (taxPct / 100)).toFixed(2));
  const previewTotal = Number((previewTaxable + previewTax).toFixed(2));
  const previewBalance = Math.max(0, previewTotal - initialPaid);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.guest) {
      setFormError("Please select a guest.");
      return;
    }

    onSubmit({
      ...form,
      roomCharges: roomC,
      foodCharges: foodC,
      extraCharges: extraC,
      discount: disc,
      taxPercentage: taxPct,
      amountPaid: initialPaid,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Financial Billing</span>
            <h3 className="text-2xl font-light font-display">Generate New Invoice</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-xs font-medium">
              {formError || error}
            </div>
          )}

          {/* Select Checkout for Auto Populate */}
          {checkouts.length > 0 && (
            <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/10 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#D9B77A]">
                Auto-Populate from Completed Checkout (Optional)
              </label>
              <select
                value={form.checkout}
                onChange={handleCheckoutSelect}
                className={inputCls}
              >
                <option value="">-- Choose Checkout Record --</option>
                {checkouts.map((co) => (
                  <option key={co._id} value={co._id}>
                    Room {co.roomNumber} • {co.guestName} (${co.totalAmount})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Guest */}
            <div>
              <label className={labelCls}>Guest *</label>
              <select
                name="guest"
                required
                value={form.guest}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select Guest --</option>
                {guests.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.fullName} ({g.phone || g.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className={labelCls}>Room</label>
              <select
                name="room"
                value={form.room}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">-- Select Room --</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} ({r.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Charges */}
            <div>
              <label className={labelCls}>Room Charges ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="roomCharges"
                value={form.roomCharges}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Food Charges */}
            <div>
              <label className={labelCls}>Food Orders Charges ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="foodCharges"
                value={form.foodCharges}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Extra Charges */}
            <div>
              <label className={labelCls}>Extra Charges ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="extraCharges"
                value={form.extraCharges}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Discount */}
            <div>
              <label className={labelCls}>Discount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Tax Percentage */}
            <div>
              <label className={labelCls}>Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                name="taxPercentage"
                value={form.taxPercentage}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Initial Amount Paid */}
            <div>
              <label className={labelCls}>Initial Payment Collected ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="amountPaid"
                value={form.amountPaid}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            {/* Payment Method */}
            <div className="md:col-span-2">
              <label className={labelCls}>Payment Method</label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Live Financial Calculation Card */}
          <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#17384F]/50 block">Subtotal</span>
              <span className="font-bold text-[#17384F] text-sm">${previewSubtotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#17384F]/50 block">Tax ({taxPct}%)</span>
              <span className="font-bold text-[#17384F] text-sm">${previewTax.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#17384F]/50 block">Final Total</span>
              <span className="font-bold text-emerald-700 text-sm">${previewTotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[#17384F]/50 block">Balance Due</span>
              <span className="font-bold text-rose-700 text-sm">${previewBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Invoice Remarks</label>
            <textarea
              name="remarks"
              rows="2"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Notes, corporate tax info, special remarks..."
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
              {loading ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
