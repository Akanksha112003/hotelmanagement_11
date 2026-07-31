import { useState } from "react";
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, User, AlertTriangle } from "lucide-react";

const thCls =
  "px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";

export default function GuestTable({
  guests,
  fetching,
  onViewProfile,
  onEdit,
  onDelete,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Pagination calculation
  const totalPages = Math.ceil((guests.length || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuests = guests.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
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

  const getInitials = (name) => {
    if (!name) return "G";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
      {/* Table Header */}
      <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Guest Directory</h3>
        <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#17384F]/40">
          {guests.length} Registered Guest{guests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-[#17384F]/10 bg-white">
              <th className={thCls}>Guest Info</th>
              <th className={thCls}>Contact Information</th>
              <th className={thCls}>ID Verification</th>
              <th className={thCls}>Nationality</th>
              <th className={thCls}>Stay History</th>
              <th className={thCls}>Last Stay</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17384F]/5 text-sm">
            {fetching ? (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                    <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin" />
                    Loading guests directory...
                  </div>
                </td>
              </tr>
            ) : paginatedGuests.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-16 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center gap-2">
                    <User className="w-10 h-10 text-[#17384F]/20" />
                    <p className="text-[15px] text-[#17384F]/50 font-medium">No guest records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedGuests.map((guest) => (
                <tr key={guest._id} className="hover:bg-[#F8F7F4]/40 transition-colors group">
                  {/* Guest Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#17384F] text-[#D9B77A] font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(guest.fullName)}
                      </div>
                      <div>
                        <span className="font-bold text-[#17384F] block">{guest.fullName}</span>
                        {guest.gender && <span className="text-[11px] text-[#17384F]/50 capitalize">{guest.gender}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-[#17384F] block">{guest.email}</span>
                    <span className="text-xs text-[#17384F]/60">{guest.phone}</span>
                  </td>

                  {/* ID Proof */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-[#17384F] block">
                      {guest.idProofNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#1E6F8E]">
                      {guest.idProofType || "ID Proof"}
                    </span>
                  </td>

                  {/* Nationality */}
                  <td className="px-6 py-4 font-medium text-[#17384F]">
                    {guest.nationality || "—"}
                  </td>

                  {/* Stay History */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#17384F] block">{guest.totalVisits || 0} Visit{guest.totalVisits !== 1 ? "s" : ""}</span>
                    <span className="text-xs text-emerald-700 font-medium">${(guest.totalSpent || 0).toLocaleString()} spent</span>
                  </td>

                  {/* Last Stay */}
                  <td className="px-6 py-4 text-xs font-medium text-[#17384F]/70">
                    {formatDate(guest.lastStayDate)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewProfile(guest)}
                        title="View Full Profile"
                        className="p-2 rounded-lg text-[#17384F]/70 hover:text-[#1E6F8E] hover:bg-[#1E6F8E]/10 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(guest)}
                        title="Edit Guest"
                        className="p-2 rounded-lg text-[#17384F]/70 hover:text-[#D9B77A] hover:bg-[#D9B77A]/10 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(guest)}
                        title="Delete Guest"
                        className="p-2 rounded-lg text-[#17384F]/70 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {guests.length > 0 && (
        <div className="px-8 py-4 border-t border-[#17384F]/5 bg-white flex items-center justify-between">
          <span className="text-xs text-[#17384F]/60 font-medium">
            Showing <strong className="text-[#17384F]">{startIndex + 1}</strong> to{" "}
            <strong className="text-[#17384F]">{Math.min(startIndex + itemsPerPage, guests.length)}</strong> of{" "}
            <strong className="text-[#17384F]">{guests.length}</strong> guests
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
              <h4 className="text-xl font-bold font-display text-[#17384F]">Delete Guest Record?</h4>
              <p className="text-sm text-[#17384F]/70 mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-[#17384F]">{deleteTarget.fullName}</strong>? This action cannot be undone.
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
