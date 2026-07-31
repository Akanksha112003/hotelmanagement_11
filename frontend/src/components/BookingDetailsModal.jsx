import { X, Calendar, User, Home, CreditCard, Clock, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import BookingStatusBadge from "./BookingStatusBadge";

export default function BookingDetailsModal({ booking, onClose, onConvertToCheckIn }) {
  if (!booking) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
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

  // Calculate nights stay
  const calculateNights = (inDate, outDate) => {
    if (!inDate || !outDate) return 1;
    const diff = new Date(outDate) - new Date(inDate);
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const guest = booking.guest || {};
  const room = booking.room || {};

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-12">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Reservation Summary</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                  Source: {booking.bookingSource || "Direct"}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-light font-display text-white mt-1">
                {booking.bookingNumber}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.bookingStatus} />
              <BookingStatusBadge status={booking.paymentStatus} type="payment" />
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block">Check-In Date</span>
              <span className="text-sm font-bold text-[#17384F] mt-0.5 block">{formatDate(booking.checkInDate)}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block">Check-Out Date</span>
              <span className="text-sm font-bold text-[#17384F] mt-0.5 block">{formatDate(booking.checkOutDate)}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block">Duration</span>
              <span className="text-sm font-bold text-[#17384F] mt-0.5 block">{nights} Night{nights !== 1 ? "s" : ""}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block">Total Amount</span>
              <span className="text-lg font-bold font-display text-emerald-700">${(booking.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guest Details */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#17384F]/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B77A]">
                <User className="w-4 h-4 text-[#1E6F8E]" /> Guest Details
              </div>
              <div className="space-y-2 text-sm text-[#17384F]">
                <div>
                  <span className="text-xs text-[#17384F]/50 block">Full Name</span>
                  <span className="font-bold text-base">{guest.fullName || "Guest Profile Unavailable"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-[#17384F]/50 block">Email</span>
                    <span className="font-medium text-xs truncate block">{guest.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#17384F]/50 block">Phone</span>
                    <span className="font-medium text-xs block">{guest.phone || "—"}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-xs text-[#17384F]/50 block">ID Proof ({guest.idProofType || "ID"})</span>
                  <span className="font-mono text-xs font-bold text-[#1E6F8E]">{guest.idProofNumber || "Not Verified"}</span>
                </div>
              </div>
            </div>

            {/* Room & Stay Details */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#17384F]/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B77A]">
                <Home className="w-4 h-4 text-[#1E6F8E]" /> Reserved Room Info
              </div>
              <div className="space-y-2 text-sm text-[#17384F]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#17384F]/50 block">Room Number</span>
                    <span className="font-bold text-lg text-[#17384F]">Room {room.roomNumber || "Unassigned"}</span>
                  </div>
                  {room.type && (
                    <span className="px-3 py-1 rounded-full bg-[#17384F] text-[#D9B77A] text-xs font-bold capitalize">
                      {room.type}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-xs text-[#17384F]/50 block">Rate / Night</span>
                    <span className="font-semibold text-xs">${room.pricePerNight || 0}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#17384F]/50 block">Occupants</span>
                    <span className="font-semibold text-xs">{booking.adults || 1} Adult(s), {booking.children || 0} Child(ren)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-5 rounded-2xl border border-[#17384F]/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B77A]">
              <CreditCard className="w-4 h-4 text-[#1E6F8E]" /> Payment Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-1">
              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#17384F]/5">
                <span className="text-xs text-[#17384F]/50 block">Total Amount</span>
                <span className="font-bold text-base text-[#17384F]">${(booking.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#17384F]/5">
                <span className="text-xs text-[#17384F]/50 block">Advance Received</span>
                <span className="font-bold text-base text-emerald-700">${(booking.advanceAmount || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#17384F]/5">
                <span className="text-xs text-[#17384F]/50 block">Balance Payable</span>
                <span className="font-bold text-base text-rose-700">
                  ${Math.max(0, (booking.totalAmount || 0) - (booking.advanceAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Special Requests & Remarks */}
          {(booking.specialRequests || booking.remarks) && (
            <div className="bg-[#F8F7F4] p-5 rounded-2xl border border-[#17384F]/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#17384F]/70">
                <FileText className="w-4 h-4 text-[#D9B77A]" /> Special Requests & Staff Notes
              </div>
              {booking.specialRequests && (
                <p className="text-xs text-[#17384F]/80 leading-relaxed">
                  <strong>Special Requests:</strong> {booking.specialRequests}
                </p>
              )}
              {booking.remarks && (
                <p className="text-xs text-[#17384F]/80 leading-relaxed">
                  <strong>Staff Remarks:</strong> {booking.remarks}
                </p>
              )}
            </div>
          )}

          {/* Booking Timeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B77A]">
              <Clock className="w-4 h-4 text-[#1E6F8E]" /> Booking Lifecycle Timeline
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-[#17384F]/70 bg-[#F8F7F4]/50 p-4 rounded-xl border border-[#17384F]/5">
              <div>
                <span className="text-[#17384F]/40 block">Created On</span>
                <span className="font-semibold text-[#17384F]">{formatDateTime(booking.createdAt)}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#17384F]/30 hidden sm:block" />
              <div>
                <span className="text-[#17384F]/40 block">Last Updated</span>
                <span className="font-semibold text-[#17384F]">{formatDateTime(booking.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#F8F7F4]/50 border-t border-[#17384F]/5 flex items-center justify-between gap-3">
          <div>
            {["Confirmed", "Pending"].includes(booking.bookingStatus) && (
              <button
                onClick={() => onConvertToCheckIn(booking._id)}
                className="px-6 py-2.5 rounded-full bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Convert to Check-In
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#17384F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1E6F8E] transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
