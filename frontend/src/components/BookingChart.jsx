import React from "react";
import { CalendarCheck } from "lucide-react";

export default function BookingChart({ data = {} }) {
  const {
    total = 0,
    pending = 0,
    confirmed = 0,
    checkedIn = 0,
    cancelled = 0,
    completed = 0,
    sourceBreakdown = {},
  } = data;

  const statuses = [
    { label: "Confirmed", count: confirmed, color: "bg-[#1E6F8E]" },
    { label: "Checked-In", count: checkedIn, color: "bg-emerald-600" },
    { label: "Completed", count: completed, color: "bg-teal-700" },
    { label: "Pending", count: pending, color: "bg-amber-500" },
    { label: "Cancelled", count: cancelled, color: "bg-rose-600" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#17384F]/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Reservation Metrics</span>
          <h3 className="text-xl font-bold font-display text-[#17384F]">Booking Status & Sources</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-display text-[#17384F]">{total}</span>
          <span className="text-[10px] uppercase font-bold text-[#17384F]/50 block">Total Reservations</span>
        </div>
      </div>

      {/* Horizontal Status Progress Bars */}
      <div className="space-y-3">
        {statuses.map((st, idx) => {
          const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#17384F]">
                <span>{st.label}</span>
                <span className="font-mono">{st.count} ({pct}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#F8F7F4] overflow-hidden border border-[#17384F]/5">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full ${st.color} rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sources Pill Row */}
      {Object.keys(sourceBreakdown).length > 0 && (
        <div className="border-t border-[#17384F]/5 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#17384F]/50 block mb-2">Booking Channels</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(sourceBreakdown).map(([source, count], idx) => (
              <div key={idx} className="bg-[#F8F7F4] p-2.5 rounded-xl border border-[#17384F]/5 text-center text-xs">
                <span className="text-[#17384F]/50 block text-[10px] font-bold uppercase">{source}</span>
                <span className="font-bold text-[#17384F] text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
