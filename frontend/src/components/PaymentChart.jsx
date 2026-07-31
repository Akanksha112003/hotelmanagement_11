import React from "react";
import { CreditCard } from "lucide-react";

export default function PaymentChart({ data = {} }) {
  const {
    totalCollected = 0,
    totalOutstanding = 0,
    foodRevenue = 0,
    paidInvoices = 0,
    partialInvoices = 0,
    pendingInvoices = 0,
    methodBreakdown = {},
  } = data;

  const totalByMethods = Object.values(methodBreakdown).reduce((a, b) => a + b, 0) || 1;

  const methodColors = {
    Cash: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200" },
    Card: { bg: "bg-[#1E6F8E]", text: "text-[#1E6F8E]", border: "border-[#1E6F8E]/30" },
    UPI: { bg: "bg-[#D9B77A]", text: "text-[#17384F]", border: "border-[#D9B77A]" },
    "Bank Transfer": { bg: "bg-purple-600", text: "text-purple-700", border: "border-purple-200" },
  };

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col justify-between gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#17384F]/5 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Transactions & Gateway</span>
          <h3 className="text-xl font-bold font-display text-[#17384F]">Payment Methods & Balance</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-display text-rose-700">${totalOutstanding.toLocaleString()}</span>
          <span className="text-[10px] uppercase font-bold text-[#17384F]/50 block">Outstanding Balance</span>
        </div>
      </div>

      {/* Payment Methods Progress Bar */}
      <div className="space-y-4">
        <div className="h-5 w-full rounded-2xl bg-[#F8F7F4] p-1 flex overflow-hidden border border-[#17384F]/5 shadow-inner">
          {Object.entries(methodBreakdown).map(([method, amount], idx) => {
            const widthPct = (amount / totalByMethods) * 100;
            if (widthPct === 0) return null;
            const style = methodColors[method] || { bg: "bg-gray-500" };
            return (
              <div
                key={idx}
                style={{ width: `${widthPct}%` }}
                className={`h-full ${style.bg} first:rounded-l-xl last:rounded-r-xl transition-all duration-500`}
                title={`${method}: $${amount.toLocaleString()} (${Math.round(widthPct)}%)`}
              />
            );
          })}
        </div>

        {/* Method Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(methodBreakdown).map(([method, amount], idx) => {
            const style = methodColors[method] || { bg: "bg-gray-500", text: "text-gray-700" };
            const pct = Math.round((amount / totalByMethods) * 100);
            return (
              <div key={idx} className="bg-[#F8F7F4]/60 p-3 rounded-2xl border border-[#17384F]/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${style.bg}`} />
                  <span className="font-semibold text-[#17384F]">{method}</span>
                </div>
                <span className="font-bold text-[#17384F] font-mono">${amount.toLocaleString()} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Invoice Status Counters */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#17384F]/5 pt-4 text-center text-xs">
        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
          <span className="text-emerald-700 block text-[10px] font-bold uppercase">Paid Bills</span>
          <span className="font-bold text-emerald-800">{paidInvoices}</span>
        </div>
        <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
          <span className="text-amber-700 block text-[10px] font-bold uppercase">Partial</span>
          <span className="font-bold text-amber-800">{partialInvoices}</span>
        </div>
        <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
          <span className="text-rose-700 block text-[10px] font-bold uppercase">Unpaid</span>
          <span className="font-bold text-rose-800">{pendingInvoices}</span>
        </div>
      </div>
    </div>
  );
}
