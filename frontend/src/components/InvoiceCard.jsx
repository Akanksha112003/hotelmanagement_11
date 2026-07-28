export default function InvoiceCard({ checkout, onClose }) {
  if (!checkout) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const roomChg = Number(checkout.roomCharges) || 0;
  const foodChg = Number(checkout.foodCharges) || 0;
  const extraChg = Number(checkout.extraCharges) || 0;
  const disc = Number(checkout.discount) || 0;
  const subtotal = roomChg + foodChg + extraChg;
  const total = checkout.totalAmount !== undefined ? Number(checkout.totalAmount) : Math.max(0, subtotal - disc);

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 lg:p-10 max-w-2xl w-full shadow-[0_20px_50px_rgba(23,56,79,0.2)] border border-[#D9B77A]/20 transition-all duration-300 animate-[acg-fade-up_0.4s_ease_forwards] my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#17384F]/5 hover:bg-[#17384F]/10 text-[#17384F] flex items-center justify-center transition-all print:hidden"
        >
          ✕
        </button>

        {/* Invoice Printable Section */}
        <div id="printable-invoice" className="flex flex-col gap-6">
          {/* Invoice Header */}
          <div className="border-b border-[#17384F]/10 pb-6 flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
                Hotel Grand Palace
              </p>
              <h2 className="text-[28px] font-bold text-[#17384F] font-display mt-1">
                Checkout Invoice
              </h2>
              <p className="text-[12px] text-[#17384F]/50 mt-0.5">
                Receipt ID: #{checkout._id ? checkout._id.slice(-8).toUpperCase() : "INV-001"}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                checkout.paymentStatus === "Paid"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {checkout.paymentStatus || "Paid"}
              </span>
            </div>
          </div>

          {/* Guest & Stay Details */}
          <div className="grid grid-cols-2 gap-4 bg-[#F8F7F4] p-5 rounded-2xl border border-[#17384F]/5 text-[13px]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#17384F]/50 block mb-1">
                Guest Information
              </span>
              <p className="font-bold text-[#17384F] text-[15px]">{checkout.guestName}</p>
              <p className="text-[#17384F]/70 font-medium">Room: {checkout.roomNumber}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#17384F]/50 block mb-1">
                Stay Duration
              </span>
              <p className="text-[#17384F] font-medium">In: {formatDate(checkout.checkInDate)}</p>
              <p className="text-[#17384F] font-medium">Out: {formatDate(checkout.checkOutDate)}</p>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div className="border border-[#17384F]/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#17384F]/5 text-[11px] font-bold uppercase tracking-widest text-[#17384F]/70">
                <tr>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17384F]/5 font-medium text-[#17384F]">
                <tr>
                  <td className="px-5 py-3.5">Room Accommodations Charge</td>
                  <td className="px-5 py-3.5 text-right">${roomChg.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5">Room Service / Dining (Food Charges)</td>
                  <td className="px-5 py-3.5 text-right">${foodChg.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5">Extra Amenities & Services</td>
                  <td className="px-5 py-3.5 text-right">${extraChg.toFixed(2)}</td>
                </tr>
                {disc > 0 && (
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td className="px-5 py-3">Discount Applied</td>
                    <td className="px-5 py-3 text-right">-${disc.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bill Summary */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#17384F]/10">
            <div className="flex justify-between text-[13px] text-[#17384F]/70">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {disc > 0 && (
              <div className="flex justify-between text-[13px] text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>-${disc.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[20px] font-bold text-[#17384F] font-display pt-2 border-t border-[#17384F]/10">
              <span>Total Final Bill:</span>
              <span className="text-[#17384F]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method & Remarks */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#F8F7F4] p-4 rounded-xl text-[12px]">
            <div>
              <span className="font-bold uppercase tracking-wider text-[#17384F]/60">Payment Method: </span>
              <span className="font-semibold text-[#17384F]">{checkout.paymentMethod || "Cash"}</span>
            </div>
            {checkout.remarks && (
              <div className="text-[#17384F]/70 italic">
                Note: {checkout.remarks}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#17384F]/10 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest text-[#17384F]/60 hover:text-[#17384F] hover:bg-[#17384F]/5 transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all shadow-md"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
