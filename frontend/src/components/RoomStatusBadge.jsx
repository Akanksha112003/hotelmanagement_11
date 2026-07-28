const STATUS_STYLES = {
  available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  occupied: "bg-[#1E6F8E]/10 text-[#1E6F8E] border border-[#1E6F8E]/20",
  reserved: "bg-violet-50 text-violet-700 border border-violet-200",
  dirty: "bg-amber-50 text-amber-700 border border-amber-200",
  maintenance: "bg-red-50 text-red-600 border border-red-200",
};

export default function RoomStatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] || "bg-gray-50 text-gray-700 border border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status}
    </span>
  );
}
