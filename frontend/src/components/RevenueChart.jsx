import React from "react";
import { TrendingUp, DollarSign } from "lucide-react";

export default function RevenueChart({ trend = [], totalRevenue = 0, avgRevenue = 0 }) {
  const maxRevenue = Math.max(...trend.map((t) => t.revenue || 0), 100);

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#17384F]/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Financial Analytics</span>
          <h3 className="text-xl font-bold font-display text-[#17384F]">Revenue Trend & Growth</h3>
        </div>
        <div className="flex items-center gap-4 bg-[#F8F7F4] px-4 py-2 rounded-2xl border border-[#17384F]/5 text-xs">
          <div>
            <span className="text-[#17384F]/50 block">Period Revenue</span>
            <span className="font-bold text-emerald-700 text-sm">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 bg-[#17384F]/10" />
          <div>
            <span className="text-[#17384F]/50 block">Avg / Invoice</span>
            <span className="font-bold text-[#17384F] text-sm">${avgRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      {trend.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-[#17384F]/40 text-sm font-medium">
          No revenue transaction records for this period.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-[#17384F]/10 overflow-x-auto">
            {trend.map((item, idx) => {
              const heightPct = Math.max((item.revenue / maxRevenue) * 100, 4);
              return (
                <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold text-[#17384F] bg-[#D9B77A]/20 px-2 py-1 rounded-md mb-1 whitespace-nowrap shadow-sm">
                    ${item.revenue.toLocaleString()}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-[#17384F] to-[#1E6F8E] group-hover:from-[#1E6F8E] group-hover:to-[#D9B77A] rounded-t-xl transition-all duration-300 shadow-sm"
                  />
                  <span className="text-[10px] font-bold text-[#17384F]/60 truncate w-full text-center mt-2">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#17384F]/50 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E6F8E]" /> Daily Collected Revenue ($)
            </span>
            <span>Scale Max: ${maxRevenue.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
