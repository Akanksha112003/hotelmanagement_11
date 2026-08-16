import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, CreditCard, AlertTriangle, FileText, Lock } from "lucide-react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

const thCls =
  "px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";

export default function InvoiceTable({
  invoices,
  fetching,
  onViewDetails,
  onRecordPayment,
  onEdit,
  onDelete,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalPages = Math.ceil((invoices.length || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Invoices Directory</h3>
        <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#17384F]/40">
          {invoices.length} Invoice{invoices.length !== 1 ? "s" : ""} Total
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-[#17384F]/10 bg-white">
              <th className={thCls}>Invoice #</th>
              <th className={thCls}>Guest Info</th>
              <th className={thCls}>Room Info</th>
              <th className={thCls}>Total Amount</th>
              <th className={thCls}>Paid / Balance Due</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17384F]/5 text-sm">
            {fetching ? (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                    <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin" />
                    Loading billing invoices...
                  </div>
                </td>
              </tr>
            ) : paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-[#17384F]/20" />
                    <p className="text-[15px] text-[#17384F]/50 font-medium">No invoice records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => {
                const guest = inv.guest || {};
                const room = inv.room || {};
                const isPaid = inv.paymentStatus === "Paid" || inv.invoiceStatus === "Paid";

                return (
                  <tr key={inv._id} className="hover:bg-[#F8F7F4]/40 transition-colors group">
                    {/* Invoice Number */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-[#17384F] block">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-[#17384F]/50 block">
                        Issued: {formatDate(inv.issuedAt)}
                      </span>
                    </td>

                    {/* Guest */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#17384F] block">{guest.fullName || "Guest Profile"}</span>
                      <span className="text-xs text-[#17384F]/60">{guest.phone || guest.email || "—"}</span>
                    </td>

                    {/* Room */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#17384F] block">Room {room.roomNumber || "—"}</span>
                      <span className="text-xs text-[#1E6F8E] capitalize font-medium">{room.type || "Standard"}</span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4">
                      <span className="font-bold font-display text-emerald-700 block text-base">
                        ${(inv.totalAmount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#17384F]/50 block font-medium">
                        (Tax: ${(inv.taxAmount || 0).toFixed(2)})
                      </span>
                    </td>

                    {/* Paid / Balance Due */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-emerald-700 font-semibold block">
                        Paid: ${(inv.amountPaid || 0).toLocaleString()}
                      </span>
                      <span className={`text-xs font-bold block ${inv.balanceAmount > 0 ? "text-rose-700" : "text-gray-400"}`}>
                        Balance: ${(inv.balanceAmount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Status Badges */}
                    <td className="px-6 py-4 space-y-1">
                      <div>
                        <InvoiceStatusBadge status={inv.invoiceStatus} />
                      </div>
                      <div>
                        <InvoiceStatusBadge status={inv.paymentStatus} type="payment" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => onViewDetails(inv)}
                          title="View Full Invoice"
                          className="p-2 rounded-lg text-[#17384F]/70 hover:text-[#1E6F8E] hover:bg-[#1E6F8E]/10 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Record Payment */}
                        {inv.balanceAmount > 0 && inv.invoiceStatus !== "Cancelled" && (
                          <button
                            onClick={() => onRecordPayment(inv)}
                            title="Record Payment directly"
                            className="p-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all flex items-center gap-1 font-bold text-xs cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span className="hidden xl:inline">Record Payment</span>
                          </button>
                        )}

                        {/* Edit (Disabled if Paid) */}
                        <button
                          onClick={() => onEdit(inv)}
                          disabled={isPaid}
                          title={isPaid ? "Paid invoices are locked" : "Edit Invoice"}
                          className={`p-2 rounded-lg transition-all ${
                            isPaid
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-[#17384F]/70 hover:text-[#D9B77A] hover:bg-[#D9B77A]/10"
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete (Disabled if Paid) */}
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          disabled={isPaid}
                          title={isPaid ? "Paid invoices are locked" : "Delete Draft Invoice"}
                          className={`p-2 rounded-lg transition-all ${
                            isPaid
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-[#17384F]/70 hover:text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {isPaid ? <Lock className="w-4 h-4 text-gray-300" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {invoices.length > 0 && (
        <div className="px-8 py-4 border-t border-[#17384F]/5 bg-white flex items-center justify-between">
          <span className="text-xs text-[#17384F]/60 font-medium">
            Showing <strong className="text-[#17384F]">{startIndex + 1}</strong> to{" "}
            <strong className="text-[#17384F]">{Math.min(startIndex + itemsPerPage, invoices.length)}</strong> of{" "}
            <strong className="text-[#17384F]">{invoices.length}</strong> invoices
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-[#17384F]/10 text-[#17384F] disabled:opacity-30 hover:bg-[#F8F7F4] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[#17384F] px-3">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-[#17384F]/10 text-[#17384F] disabled:opacity-30 hover:bg-[#F8F7F4] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#17384F]/10 space-y-5 animate-fadeIn text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-xl font-bold font-display text-[#17384F]">Delete Invoice Record?</h4>
              <p className="text-sm text-[#17384F]/70 mt-2 leading-relaxed">
                Are you sure you want to delete invoice <strong className="text-[#17384F]">{deleteTarget.invoiceNumber}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-2.5 rounded-full border border-[#17384F]/20 text-[#17384F] text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
