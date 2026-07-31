import React from "react";
import { Utensils } from "lucide-react";

export default function FoodSalesChart({ data = {} }) {
  const {
    totalOrders = 0,
    totalRevenue = 0,
    deliveredOrders = 0,
    topItems = [],
  } = data;

  const maxItemCount = Math.max(...topItems.map((i) => i.count || 0), 1);

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#17384F]/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Dining & Kitchen</span>
          <h3 className="text-xl font-bold font-display text-[#17384F]">Top Food Sales & Items</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-display text-emerald-700">${totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] uppercase font-bold text-[#17384F]/50 block">{totalOrders} Orders ({deliveredOrders} Served)</span>
        </div>
      </div>

      {/* Top Menu Items List with progress bar */}
      {topItems.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#17384F]/40 font-medium">
          No food order records found.
        </div>
      ) : (
        <div className="space-y-3">
          {topItems.slice(0, 5).map((item, idx) => {
            const widthPct = Math.round((item.count / maxItemCount) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-[#17384F]">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#17384F]/10 text-[#17384F] flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {item.name}
                  </span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {item.count} orders (${(item.revenue || 0).toLocaleString()})
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#F8F7F4] overflow-hidden border border-[#17384F]/5">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="h-full bg-gradient-to-r from-[#1E6F8E] to-[#D9B77A] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
