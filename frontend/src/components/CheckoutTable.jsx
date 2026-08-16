import PaymentStatusBadge from "./PaymentStatusBadge";
import InvoiceCard from "./InvoiceCard";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";

const thCls = "px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";
const PAYMENT_STATUSES = ["Pending", "Paid"];

export default function CheckoutTable({
  checkouts,
  fetching,
  onUpdatePayment,
  onDeleteCheckout,
}) {
  const [invoiceRecord, setInvoiceRecord] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
          <h3 className="text-[20px] font-bold text-[#17384F] font-display">Checkout Ledger</h3>
          <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#17384F]/40">
            {checkouts.length} record{checkouts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#17384F]/10 bg-white">
                <th className={thCls}>Room / Guest</th>
                <th className={thCls}>Stay Period</th>
                <th className={thCls}>Room Charges</th>
                <th className={thCls}>Food Charges</th>
                <th className={thCls}>Extra / Discount</th>
                <th className={thCls}>Total Bill</th>
                <th className={thCls}>Method</th>
                <th className={thCls}>Payment</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17384F]/5">
              {fetching ? (
                <tr>
                  <td colSpan="9" className="px-8 py-16 text-center">
                    <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                      <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin"></div>
                      Fetching checkout records...
                    </div>
                  </td>
                </tr>
              ) : checkouts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-8 py-16 text-center">
                    <p className="text-[15px] text-[#17384F]/40 font-medium">
                      No checkout records found.
                    </p>
                  </td>
                </tr>
              ) : (
                checkouts.map((record) => (
                  <tr key={record._id} className="hover:bg-[#F8F7F4]/50 transition-colors group">
                    {/* Room & Guest */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#17384F] text-[15px]">
                          Room {record.roomNumber}
                        </span>
                        <span className="text-[13px] text-[#17384F]/70 font-medium">
                          {record.guestName}
                        </span>
                      </div>
                    </td>

                    {/* Stay Period */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5 text-[13px] text-[#17384F]/70">
                        <span>In: {formatDate(record.checkInDate)}</span>
                        <span>Out: {formatDate(record.checkOutDate)}</span>
                      </div>
                    </td>

                    {/* Room Charges */}
                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#17384F] text-[14px]">
                        ${Number(record.roomCharges || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Food Charges */}
                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#17384F] text-[14px]">
                        ${Number(record.foodCharges || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Extra / Discount */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5 text-[13px]">
                        <span className="text-[#17384F]/70">
                          +${Number(record.extraCharges || 0).toFixed(2)}
                        </span>
                        {Number(record.discount) > 0 && (
                          <span className="text-emerald-600 font-semibold">
                            -${Number(record.discount).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Bill */}
                    <td className="px-6 py-5">
                      <span className="font-bold text-[#17384F] text-[16px] font-display">
                        ${Number(record.totalAmount || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#17384F]/5 text-[#17384F] border border-[#17384F]/10">
                        {record.paymentMethod || "Cash"}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 items-start">
                        <PaymentStatusBadge status={record.paymentStatus} />
                        <select
                          value={record.paymentStatus}
                          onChange={(e) => onUpdatePayment(record._id, e.target.value)}
                          className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              Set: {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInvoiceRecord(record)}
                          className="text-[11px] font-bold uppercase tracking-wider text-[#1E6F8E] hover:text-white bg-[#1E6F8E]/10 hover:bg-[#1E6F8E] border border-[#1E6F8E]/20 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Invoice
                        </button>
                        <button
                          onClick={() => onDeleteCheckout(record._id)}
                          className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceRecord && (
        <InvoiceCard
          checkout={invoiceRecord}
          onClose={() => setInvoiceRecord(null)}
        />
      )}
    </>
  );
}
