import { useRef } from "react";
import { Link } from "react-router-dom";
import { X, Printer, Download, CreditCard, Building2, User, Home, Calendar, ShieldAlert } from "lucide-react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { useHotelProfile } from "../context/HotelProfileContext";

export default function InvoiceDetailsModal({ invoice, onClose, onRecordPayment }) {
  if (!invoice) return null;

  const { profile } = useHotelProfile();
  const printRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const guest = invoice.guest || {};
  const room = invoice.room || {};
  const booking = invoice.booking || {};
  const checkout = invoice.checkout || {};
  const payments = invoice.payments || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-[#17384F] text-white p-4 md:px-8 flex items-center justify-between border-b border-white/10 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Official Tax Invoice</span>
            <span className="font-mono text-sm font-bold">{invoice.invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>

            {invoice.balanceAmount > 0 && invoice.invoiceStatus !== "Cancelled" && (
              <button
                onClick={() => onRecordPayment(invoice)}
                className="px-4 py-2 rounded-full bg-[#A38A5A] hover:bg-[#8C7447] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" /> Record Payment
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div ref={printRef} className="p-8 md:p-12 overflow-y-auto space-y-8 print:p-0 print:overflow-visible">
          {/* Hotel Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-[#17384F]/10 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#17384F] text-[#D9B77A] flex items-center justify-center font-bold font-display text-2xl shadow-lg shrink-0 overflow-hidden p-1 border border-[#D9B77A]/30">
                {profile?.logo ? (
                  <img
                    src={profile.logo}
                    alt={profile.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "block";
                    }}
                  />
                ) : null}
                <Building2 className={`w-7 h-7 text-[#D9B77A] ${profile?.logo ? "hidden" : "block"}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-[#17384F]">
                  {profile?.name || "LUXURY HOTEL & RESORT"}
                </h1>
                <p className="text-xs text-[#17384F]/60">
                  {[profile?.address, profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ")}
                  {profile?.taxNumber ? ` • Tax ID: ${profile.taxNumber}` : ""}
                </p>
                <p className="text-xs text-[#17384F]/60">
                  {[profile?.phone && `Phone: ${profile.phone}`, profile?.email].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
              <h2 className="text-3xl font-light font-display text-[#17384F] tracking-tight">{invoice.invoiceNumber}</h2>
              <div className="flex items-center gap-2">
                <InvoiceStatusBadge status={invoice.invoiceStatus} />
                <InvoiceStatusBadge status={invoice.paymentStatus} type="payment" />
              </div>
              <span className="text-xs text-[#17384F]/60">Issued: {formatDateTime(invoice.issuedAt)}</span>
            </div>
          </div>

          {/* Guest & Stay Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F8F7F4] p-6 rounded-2xl border border-[#17384F]/5">
            {/* Guest Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B77A]">
                <User className="w-4 h-4 text-[#1E6F8E]" /> Billed To (Guest)
              </div>
              <h3 className="text-lg font-bold text-[#17384F]">{guest.fullName || "Guest Profile"}</h3>
              <p className="text-xs text-[#17384F]/70">{guest.email || "No email"}</p>
              <p className="text-xs text-[#17384F]/70">{guest.phone || "No phone"}</p>
              {guest.address && <p className="text-xs text-[#17384F]/60">{guest.address}</p>}
              {guest.idProofNumber && (
                <p className="text-xs text-[#17384F]/60 font-mono">
                  ID: {guest.idProofType || "ID"} • {guest.idProofNumber}
                </p>
              )}
            </div>

            {/* Room & Stay Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B77A]">
                <Home className="w-4 h-4 text-[#1E6F8E]" /> Stay Details
              </div>
              <p className="text-sm font-bold text-[#17384F]">
                Room {room.roomNumber || checkout.roomNumber || "Unassigned"} ({room.type || "Standard"})
              </p>
              {booking.bookingNumber && (
                <p className="text-xs text-[#17384F]/70 font-mono">
                  Booking Ref: <strong>{booking.bookingNumber}</strong>
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-[#17384F]/70 pt-1">
                <span>Check-In: <strong>{formatDate(checkout.checkInDate || booking.checkInDate)}</strong></span>
                <span>Check-Out: <strong>{formatDate(checkout.checkOutDate || booking.checkOutDate)}</strong></span>
              </div>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D9B77A]">Itemized Bill Summary</h4>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#17384F]/10 bg-[#F8F7F4]">
                  <th className="py-3 px-4 text-xs font-bold uppercase text-[#17384F]/60">Description</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-[#17384F]/60 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17384F]/5">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#17384F]">Room Stay Charges</td>
                  <td className="py-3.5 px-4 font-semibold text-[#17384F] text-right">${(invoice.roomCharges || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#17384F]">Restaurant & Food Orders</td>
                  <td className="py-3.5 px-4 font-semibold text-[#17384F] text-right">${(invoice.foodCharges || 0).toFixed(2)}</td>
                </tr>
                {invoice.extraCharges > 0 && (
                  <tr>
                    <td className="py-3.5 px-4 font-medium text-[#17384F]">Extra Amenities & Services</td>
                    <td className="py-3.5 px-4 font-semibold text-[#17384F] text-right">${(invoice.extraCharges || 0).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-[#17384F]/10 gap-6">
            <div className="max-w-xs text-xs text-[#17384F]/60 space-y-1">
              <p><strong>Payment Method:</strong> {invoice.paymentMethod || "Cash"}</p>
              {invoice.remarks && <p><strong>Remarks:</strong> {invoice.remarks}</p>}
            </div>

            <div className="w-full sm:w-72 space-y-2 text-sm text-[#17384F]">
              <div className="flex justify-between py-1 border-b border-[#17384F]/5">
                <span className="text-[#17384F]/60">Subtotal:</span>
                <span className="font-semibold">${(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 border-b border-[#17384F]/5 text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="font-semibold">-${(invoice.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#17384F]/5">
                <span className="text-[#17384F]/60">Tax ({invoice.taxPercentage || 12}%):</span>
                <span className="font-semibold">${(invoice.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#17384F]/20 text-base font-bold">
                <span>Final Total:</span>
                <span className="font-display text-[#17384F] text-xl">${(invoice.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs text-emerald-700 font-semibold">
                <span>Amount Paid:</span>
                <span>${(invoice.amountPaid || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <span>Balance Due:</span>
                <span>${(invoice.balanceAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Transaction History Log Table */}
          <div className="space-y-3 pt-4 border-t border-[#17384F]/10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D9B77A]">Payment Transaction History</h4>
            {payments.length === 0 ? (
              <p className="text-xs text-[#17384F]/50 italic">No payments recorded yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#17384F]/10 bg-[#F8F7F4]">
                    <th className="py-2.5 px-3 font-bold uppercase text-[#17384F]/60">Date & Time</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[#17384F]/60">Method</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[#17384F]/60">Remarks</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[#17384F]/60 text-right">Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17384F]/5">
                  {payments.map((p, idx) => (
                    <tr key={p._id || idx}>
                      <td className="py-2.5 px-3 text-[#17384F]">{formatDateTime(p.paidAt)}</td>
                      <td className="py-2.5 px-3 font-bold text-[#17384F]">{p.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-[#17384F]/70">{p.remarks || "—"}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700 text-right">${(p.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#F8F7F4]/50 border-t border-[#17384F]/5 flex justify-end shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#17384F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1E6F8E] transition-all"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
