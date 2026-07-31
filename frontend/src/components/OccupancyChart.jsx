import React from "react";
import { Home, PieChart } from "lucide-react";

export default function OccupancyChart({ data = {} }) {
  const {
    totalRooms = 0,
    occupied = 0,
    available = 0,
    reserved = 0,
    maintenance = 0,
    dirty = 0,
    occupancyRate = 0,
  } = data;

  const categories = [
    { label: "Occupied", count: occupied, color: "#059669", bg: "bg-emerald-500" },
    { label: "Available", count: available, color: "#1E6F8E", bg: "bg-[#1E6F8E]" },
    { label: "Reserved", count: reserved, color: "#D9B77A", bg: "bg-[#D9B77A]" },
    { label: "Dirty / Cleaning", count: dirty, color: "#d97706", bg: "bg-amber-600" },
    { label: "Maintenance", count: maintenance, color: "#dc2626", bg: "bg-rose-600" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#17384F]/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Room Inventory</span>
          <h3 className="text-xl font-bold font-display text-[#17384F]">Occupancy Breakdown</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-display text-[#17384F]">{occupancyRate}%</span>
          <span className="text-[10px] uppercase font-bold text-[#17384F]/50 block">Occupancy Rate</span>
        </div>
      </div>

      {/* Visual Ring / Stacked Bar */}
      <div className="space-y-4">
        {/* Multi-segment Progress Bar */}
        <div className="h-6 w-full rounded-2xl bg-[#F8F7F4] p-1 flex overflow-hidden border border-[#17384F]/5 shadow-inner">
          {categories.map((cat, idx) => {
            const widthPct = totalRooms > 0 ? (cat.count / totalRooms) * 100 : 0;
            if (widthPct === 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${widthPct}%`, backgroundColor: cat.color }}
                className="h-full first:rounded-l-xl last:rounded-r-xl transition-all duration-500 hover:opacity-80"
                title={`${cat.label}: ${cat.count} rooms (${Math.round(widthPct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F7F4]/60 border border-[#17384F]/5 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${cat.bg}`} />
                <span className="font-semibold text-[#17384F]">{cat.label}</span>
              </div>
              <span className="font-bold text-[#17384F] font-mono">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-[#17384F]/50 text-center border-t border-[#17384F]/5 pt-3 font-medium">
        Total Registered Rooms: <strong className="text-[#17384F]">{totalRooms}</strong>
      </div>
    </div>
  );
}
