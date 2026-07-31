import React from "react";
import { Calendar, X } from "lucide-react";

export default function DateRangeFilter({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onDateChange,
  onClear,
}) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-[#17384F]/5 shadow-sm flex flex-wrap items-center justify-between gap-4">
      {/* Period Selection Tabs */}
      <div className="flex items-center gap-1.5 bg-[#F8F7F4] p-1.5 rounded-2xl border border-[#17384F]/5">
        {["daily", "weekly", "monthly", "yearly"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriodChange(p)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              period === p && !startDate && !endDate
                ? "bg-[#17384F] text-white shadow-sm"
                : "text-[#17384F]/60 hover:text-[#17384F] hover:bg-white/50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#17384F]/70">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D9B77A]" />
          <span>Custom Range:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) => onDateChange("start", e.target.value)}
            className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-3 py-2 text-xs text-[#17384F] outline-none focus:border-[#D9B77A] transition-all"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) => onDateChange("end", e.target.value)}
            className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-3 py-2 text-xs text-[#17384F] outline-none focus:border-[#D9B77A] transition-all"
          />
        </div>

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-rose-600 font-bold hover:text-rose-700 underline ml-2 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Clear Dates
          </button>
        )}
      </div>
    </div>
  );
}
