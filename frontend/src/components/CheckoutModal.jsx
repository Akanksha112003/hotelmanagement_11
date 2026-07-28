import { useState } from "react";

const labelCls = "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls = "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all";

const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Bank Transfer"];
const PAYMENT_STATUSES = ["Pending", "Paid"];

export default function CheckoutModal({ onClose, onSubmit, loading, error }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [roomCharges, setRoomCharges] = useState("");
  const [foodCharges, setFoodCharges] = useState("0");
  const [extraCharges, setExtraCharges] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");

  const calculateTotal = () => {
    const rc = Number(roomCharges) || 0;
    const fc = Number(foodCharges) || 0;
    const ec = Number(extraCharges) || 0;
    const dc = Number(discount) || 0;
    const sub = rc + fc + ec;
    return Math.max(0, sub - dc);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!roomNumber.trim() || !guestName.trim()) {
      setFormError("Room number and guest name are required.");
      return;
    }

    const rc = Number(roomCharges);
    if (isNaN(rc) || rc < 0) {
      setFormError("Room charges must be a valid non-negative number.");
      return;
    }

    const fc = Number(foodCharges) || 0;
    const ec = Number(extraCharges) || 0;
    const dc = Number(discount) || 0;

    if (fc < 0 || ec < 0 || dc < 0) {
      setFormError("Charges and discounts cannot be negative numbers.");
      return;
    }

    onSubmit({
      roomNumber: roomNumber.trim(),
      guestName: guestName.trim(),
      checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
      checkOutDate: checkOutDate ? new Date(checkOutDate) : new Date(),
      roomCharges: rc,
      foodCharges: fc,
      extraCharges: ec,
      discount: dc,
      paymentMethod,
      paymentStatus,
      remarks: remarks.trim(),
    });
  };

  const totalBill = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 lg:p-10 max-w-3xl w-full shadow-[0_20px_50px_rgba(23,56,79,0.2)] border border-[#D9B77A]/20 transition-all duration-300 animate-[acg-fade-up_0.4s_ease_forwards] my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[24px] font-bold text-[#17384F] font-display">Process Room Checkout</h3>
            <p className="text-[#17384F]/60 text-[14px] mt-1">
              Finalize guest bill, update room status to dirty, and create cleaning task.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#17384F]/5 hover:bg-[#17384F]/10 text-[#17384F] flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {(formError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-[14px] font-medium mb-6">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Guest & Room Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Room Number</label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Guest Name</label>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Check-In Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Check-Out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Charges Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5">
            <div>
              <label className={labelCls}>Room Charges ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={roomCharges}
                onChange={(e) => setRoomCharges(e.target.value)}
                required
                className="w-full bg-white border border-[#17384F]/10 rounded-xl px-4 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
              />
            </div>
            <div>
              <label className={labelCls}>Food Charges ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Auto-calculated"
                value={foodCharges}
                onChange={(e) => setFoodCharges(e.target.value)}
                className="w-full bg-white border border-[#17384F]/10 rounded-xl px-4 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
              />
            </div>
            <div>
              <label className={labelCls}>Extra Charges ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={extraCharges}
                onChange={(e) => setExtraCharges(e.target.value)}
                className="w-full bg-white border border-[#17384F]/10 rounded-xl px-4 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
              />
            </div>
            <div>
              <label className={labelCls}>Discount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-white border border-[#17384F]/10 rounded-xl px-4 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
              />
            </div>
          </div>

          {/* Payment Method & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={inputCls}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={inputCls}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Guest paid via Credit Card at desk"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Total & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#17384F]/10">
            <div className="text-left">
              <span className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/60">Final Bill Total:</span>
              <span className="text-[26px] font-bold text-[#17384F] font-display ml-3">
                ${totalBill.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest text-[#17384F]/60 hover:text-[#17384F] hover:bg-[#17384F]/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#D9B77A] to-[#c4a162] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Complete Checkout"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
