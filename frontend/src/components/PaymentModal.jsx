import { useState } from "react";
import { DollarSign, CreditCard } from "lucide-react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

export default function PaymentModal({ invoice, onClose, onSubmit, loading, error }) {
  if (!invoice) return null;

  const [amount, setAmount] = useState(invoice.balanceAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const payVal = Number(amount);
    if (isNaN(payVal) || payVal <= 0) {
      setFormError("Please enter a valid payment amount greater than zero.");
      return;
    }
    if (payVal > (invoice.balanceAmount || 0) + 0.01) {
      setFormError(
        `Overpayment prohibited. Payment amount ($${payVal.toFixed(
          2
        )}) cannot exceed balance due ($${(invoice.balanceAmount || 0).toFixed(2)}).`
      );
      return;
    }

    onSubmit({
      amount: payVal,
      paymentMethod,
      remarks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Record Payment</span>
            <h3 className="text-xl font-light font-display">{invoice.invoiceNumber}</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-xs font-medium">
              {formError || error}
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#17384F]/50 block font-medium">Outstanding Balance</span>
              <span className="text-2xl font-bold font-display text-rose-700">
                ${(invoice.balanceAmount || 0).toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAmount(invoice.balanceAmount || 0)}
              className="text-xs font-bold text-[#1E6F8E] underline hover:text-[#17384F]"
            >
              Pay Full Balance
            </button>
          </div>

          {/* Payment Amount */}
          <div>
            <label className={labelCls}>Payment Amount ($) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-[#17384F]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0.01"
                max={invoice.balanceAmount || 0}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputCls} pl-10`}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className={labelCls}>Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={inputCls}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Payment Notes / Transaction ID</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Card Ref #9921, UPI Txn 1029..."
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
              className="px-8 py-2.5 rounded-full bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
