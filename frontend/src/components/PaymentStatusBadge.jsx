const PAYMENT_STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border border-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function PaymentStatusBadge({ status }) {
  const style = PAYMENT_STATUS_STYLES[status] || "bg-gray-50 text-gray-700 border border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status}
    </span>
  );
}
