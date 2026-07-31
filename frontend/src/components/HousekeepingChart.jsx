import React from "react";
import { CheckSquare } from "lucide-react";

export default function HousekeepingChart({ data = {} }) {
  const {
    total = 0,
    pending = 0,
    inProgress = 0,
    done = 0,
    completionRate = 0,
    avgCompletionHours = 0,
    highPriority = 0,
    normalPriority = 0,
    lowPriority = 0,
  } = data;

  const statuses = [
    { label: "Done / Cleaned", count: done, color: "bg-emerald-600", text: "text-emerald-700" },
    { label: "In-Progress", count: inProgress, color: "bg-[#1E6F8E]", text: "text-[#1E6F8E]" },
    { label: "Pending Task", count: pending, color: "bg-amber-500", text: "text-amber-700" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#17384F]/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Facility & Hygiene</span>
          <h3 className="text-xl font-bold font-display text-[#17384F]">Housekeeping Efficiency</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-display text-emerald-700">{completionRate}%</span>
          <span className="text-[10px] uppercase font-bold text-[#17384F]/50 block">Completion Rate</span>
        </div>
      </div>

      {/* Status Progress Bars */}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 border-t border-[#17384F]/5 pt-4 text-xs">
        <div className="bg-[#F8F7F4] p-3 rounded-2xl border border-[#17384F]/5">
          <span className="text-[#17384F]/50 block text-[10px] font-bold uppercase">Avg Task Completion</span>
          <span className="font-bold text-[#17384F] text-sm">{avgCompletionHours} hours</span>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-200">
          <span className="text-red-700 block text-[10px] font-bold uppercase">High Priority Urgent</span>
          <span className="font-bold text-red-800 text-sm">{highPriority} tasks</span>
        </div>
      </div>
    </div>
  );
}
