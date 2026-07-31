export default function InvoiceStatusBadge({ status, type = "invoice" }) {
  if (type === "payment") {
    const paymentStyles = {
      Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Partial: "bg-amber-50 text-amber-700 border-amber-200",
      Pending: "bg-rose-50 text-rose-700 border-rose-200",
      Refunded: "bg-gray-50 text-gray-700 border-gray-200",
    };

    const style = paymentStyles[status] || "bg-gray-50 text-gray-700 border-gray-200";

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
        {status || "Pending"}
      </span>
    );
  }

  const statusStyles = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Issued: "bg-[#1E6F8E]/10 text-[#1E6F8E] border-[#1E6F8E]/30",
    Draft: "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const style = statusStyles[status] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {status || "Issued"}
    </span>
  );
}
