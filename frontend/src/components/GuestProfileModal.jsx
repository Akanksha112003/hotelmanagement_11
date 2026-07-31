import { User, Mail, Phone, MapPin, CreditCard, ShieldAlert, Calendar, DollarSign, Award, FileText, X } from "lucide-react";

export default function GuestProfileModal({ guest, onClose }) {
  if (!guest) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return "G";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#D9B77A] text-[#17384F] font-bold font-display text-2xl flex items-center justify-center shadow-lg shrink-0">
              {getInitials(guest.fullName)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-light font-display text-white">{guest.fullName}</h3>
                {guest.totalVisits > 3 ? (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#D9B77A] text-[#17384F] flex items-center gap-1">
                    <Award className="w-3 h-3" /> VIP Guest
                  </span>
                ) : guest.totalVisits > 1 ? (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#1E6F8E] text-white">
                    Returning Guest
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white">
                    New Guest
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                <span>{guest.nationality || "Nationality not specified"}</span>
                {guest.gender && <span>• {guest.gender}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block mb-1">Total Visits</span>
              <span className="text-2xl font-bold font-display text-[#17384F]">{guest.totalVisits || 0}</span>
            </div>
            <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block mb-1">Total Spent</span>
              <span className="text-2xl font-bold font-display text-emerald-700">${(guest.totalSpent || 0).toLocaleString()}</span>
            </div>
            <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block mb-1">Last Stay Date</span>
              <span className="text-sm font-bold text-[#17384F] mt-1 block">{formatDate(guest.lastStayDate)}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#D9B77A]">Contact Information</h4>
              
              <div className="flex items-start gap-3 text-sm text-[#17384F]">
                <Mail className="w-4 h-4 text-[#1E6F8E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#17384F]/50 block">Email Address</span>
                  <span className="font-medium">{guest.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-[#17384F]">
                <Phone className="w-4 h-4 text-[#1E6F8E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#17384F]/50 block">Phone Number</span>
                  <span className="font-medium">{guest.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-[#17384F]">
                <MapPin className="w-4 h-4 text-[#1E6F8E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#17384F]/50 block">Residential Address</span>
                  <span className="font-medium">{guest.address || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Verification & Identity */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#D9B77A]">Identity & Verification</h4>

              <div className="flex items-start gap-3 text-sm text-[#17384F]">
                <CreditCard className="w-4 h-4 text-[#1E6F8E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#17384F]/50 block">ID Proof Type & Number</span>
                  <span className="font-medium capitalize">
                    {guest.idProofType || "ID"}: <strong className="font-mono">{guest.idProofNumber}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-[#17384F]">
                <Calendar className="w-4 h-4 text-[#1E6F8E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#17384F]/50 block">Date of Birth</span>
                  <span className="font-medium">{formatDate(guest.dateOfBirth)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-[#17384F]">
                <ShieldAlert className="w-4 h-4 text-[#1E6F8E] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#17384F]/50 block">Emergency Contact</span>
                  <span className="font-medium">{guest.emergencyContact || "None listed"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Preferences */}
          {guest.notes && (
            <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-[#17384F]/5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#17384F]/70">
                <FileText className="w-4 h-4 text-[#D9B77A]" /> Notes & Special Preferences
              </div>
              <p className="text-sm text-[#17384F]/80 leading-relaxed whitespace-pre-line pl-6">
                {guest.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#F8F7F4]/50 border-t border-[#17384F]/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#17384F] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1E6F8E] transition-all"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
