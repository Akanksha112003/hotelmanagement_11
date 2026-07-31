export default function GuestStatCard({ label, value, subtext, icon: Icon, color = "text-[#17384F]/50", accent = "#17384F" }) {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col justify-between gap-3 transition-all duration-300 hover:shadow-md"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-widest ${color}`}>
          {label}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-[#F8F7F4] text-[#17384F]">
            <Icon className="w-4 h-4 text-[#17384F]/70" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[36px] font-bold text-[#17384F] font-display leading-none">
          {value}
        </span>
        {subtext && (
          <span className="text-[12px] text-[#17384F]/50 font-medium">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
