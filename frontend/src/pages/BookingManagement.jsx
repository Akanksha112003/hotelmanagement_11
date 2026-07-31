import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import GuestStatCard from "../components/GuestStatCard";
import BookingTable from "../components/BookingTable";
import AddBookingModal from "../components/AddBookingModal";
import EditBookingModal from "../components/EditBookingModal";
import BookingDetailsModal from "../components/BookingDetailsModal";
import {
  listBookings,
  addNewBooking,
  editBooking,
  setBookingStatus,
  convertBookingToCheckInApi,
  removeBooking,
} from "../api";
import { Calendar, CheckCircle, Clock, XCircle, DollarSign, Plus, Search, Filter, CheckCircle2, AlertCircle } from "lucide-react";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingBookingDetails, setViewingBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookingStatus, setSelectedBookingStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  async function fetchBookingsData() {
    setFetching(true);
    setError("");
    try {
      const res = await listBookings();
      setBookings(res.data || res.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  // Handlers
  const handleCreateBooking = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await addNewBooking(data);
      setShowAddModal(false);
      showToast("success", res.message || "Reservation created successfully!");
      await fetchBookingsData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = async (data) => {
    if (!editingBooking) return;
    setLoading(true);
    setError("");
    try {
      await editBooking(editingBooking._id, data);
      setEditingBooking(null);
      showToast("success", "Reservation updated successfully!");
      await fetchBookingsData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    setError("");
    try {
      await setBookingStatus(id, { bookingStatus: "Cancelled" });
      showToast("success", "Reservation cancelled and room released!");
      await fetchBookingsData();
    } catch (err) {
      showToast("error", err.message || "Failed to cancel booking.");
    }
  };

  const handleConvertToCheckIn = async (id) => {
    setError("");
    try {
      await convertBookingToCheckInApi(id);
      showToast("success", "Booking converted to Check-In! Room set to Occupied.");
      if (viewingBookingDetails && viewingBookingDetails._id === id) {
        setViewingBookingDetails(null);
      }
      await fetchBookingsData();
    } catch (err) {
      showToast("error", err.message || "Failed to convert booking to Check-In.");
    }
  };

  const handleDeleteBooking = async (id) => {
    setError("");
    try {
      await removeBooking(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      showToast("success", "Booking record deleted successfully!");
    } catch (err) {
      showToast("error", err.message || "Failed to delete booking.");
    }
  };

  // Dashboard Cards Metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalBookings = bookings.length;

  const todaysCheckins = bookings.filter((b) => {
    if (!b.checkInDate) return false;
    const cDate = new Date(b.checkInDate);
    cDate.setHours(0, 0, 0, 0);
    return cDate.getTime() === today.getTime() && ["Confirmed", "Checked-In"].includes(b.bookingStatus);
  }).length;

  const upcomingArrivals = bookings.filter((b) => {
    if (!b.checkInDate) return false;
    const cDate = new Date(b.checkInDate);
    cDate.setHours(0, 0, 0, 0);
    return cDate > today && b.bookingStatus === "Confirmed";
  }).length;

  const cancelledBookings = bookings.filter((b) => b.bookingStatus === "Cancelled").length;

  // Revenue from bookings: confirmed/checked-in/completed or paid
  const revenueFromBookings = bookings
    .filter((b) => ["Confirmed", "Checked-In", "Completed"].includes(b.bookingStatus) || b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const guestName = b.guest?.fullName?.toLowerCase() || "";
    const roomNum = String(b.room?.roomNumber || "").toLowerCase();
    const bkNum = b.bookingNumber?.toLowerCase() || "";

    const matchesSearch =
      searchTerm === "" || bkNum.includes(q) || guestName.includes(q) || roomNum.includes(q);

    const matchesBookingStatus =
      selectedBookingStatus === "all" || b.bookingStatus === selectedBookingStatus;

    const matchesPaymentStatus =
      selectedPaymentStatus === "all" || b.paymentStatus === selectedPaymentStatus;

    let matchesDate = true;
    if (startDateFilter) {
      const bIn = new Date(b.checkInDate).setHours(0, 0, 0, 0);
      const fStart = new Date(startDateFilter).setHours(0, 0, 0, 0);
      matchesDate = matchesDate && bIn >= fStart;
    }
    if (endDateFilter) {
      const bOut = new Date(b.checkOutDate).setHours(0, 0, 0, 0);
      const fEnd = new Date(endDateFilter).setHours(0, 0, 0, 0);
      matchesDate = matchesDate && bOut <= fEnd;
    }

    return matchesSearch && matchesBookingStatus && matchesPaymentStatus && matchesDate;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-10 relative">
        {/* Toast Notification Card */}
        {toast && (
          <div
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fadeIn transition-all ${
              toast.type === "success"
                ? "bg-[#17384F] border-[#D9B77A] text-white"
                : "bg-red-900 border-red-700 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#D9B77A]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-300" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E6F8E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Reservations & Room Scheduling
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Booking Management
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Manage room reservations, check-in conversions, view revenue analytics, and prevent double-booking conflicts.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowAddModal(true);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#D9B77A]" />
              New Booking
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-900 font-bold">✕</button>
          </div>
        )}

        {/* ── Dashboard Summary Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <GuestStatCard
            label="Total Bookings"
            value={totalBookings}
            subtext="All time reservations"
            icon={Calendar}
            color="text-[#17384F]/60"
            accent="#17384F"
          />
          <GuestStatCard
            label="Today's Check-ins"
            value={todaysCheckins}
            subtext="Scheduled for today"
            icon={CheckCircle}
            color="text-emerald-700"
            accent="#059669"
          />
          <GuestStatCard
            label="Upcoming Arrivals"
            value={upcomingArrivals}
            subtext="Future confirmed stays"
            icon={Clock}
            color="text-[#1E6F8E]"
            accent="#1E6F8E"
          />
          <GuestStatCard
            label="Cancelled"
            value={cancelledBookings}
            subtext="Released room bookings"
            icon={XCircle}
            color="text-rose-600"
            accent="#e11d48"
          />
          <GuestStatCard
            label="Booking Revenue"
            value={`$${revenueFromBookings.toLocaleString()}`}
            subtext="Confirmed & Paid revenue"
            icon={DollarSign}
            color="text-[#D9B77A]"
            accent="#D9B77A"
          />
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#17384F]/40" />
              <input
                type="text"
                placeholder="Search by Booking #, Guest Name, or Room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#17384F]/10 rounded-full pl-11 pr-5 py-3 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A] shadow-sm transition-all"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-4 h-4 text-[#17384F]/40 shrink-0 hidden sm:block" />

              {/* Status Filter */}
              <select
                value={selectedBookingStatus}
                onChange={(e) => setSelectedBookingStatus(e.target.value)}
                className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
              >
                <option value="all">All Booking Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Payment Filter */}
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Pending">Payment Pending</option>
                <option value="Partial">Partial Paid</option>
                <option value="Paid">Paid Fully</option>
              </select>
            </div>
          </div>

          {/* Date Range Filtering Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#17384F]/5 text-xs font-bold text-[#17384F]/70">
            <span className="uppercase tracking-widest text-[11px] text-[#D9B77A]">Filter Date Range:</span>
            <div className="flex items-center gap-2">
              <span>From:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-3 py-1.5 text-xs text-[#17384F] outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>To:</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-3 py-1.5 text-xs text-[#17384F] outline-none"
              />
            </div>
            {(startDateFilter || endDateFilter) && (
              <button
                onClick={() => {
                  setStartDateFilter("");
                  setEndDateFilter("");
                }}
                className="text-xs text-rose-600 font-bold underline ml-auto"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* ── Bookings Directory Table ── */}
        <BookingTable
          bookings={filteredBookings}
          fetching={fetching}
          onViewDetails={(b) => setViewingBookingDetails(b)}
          onEdit={(b) => {
            setEditingBooking(b);
            setError("");
          }}
          onCancel={handleCancelBooking}
          onConvertToCheckIn={handleConvertToCheckIn}
          onDelete={handleDeleteBooking}
        />

        {/* Modals */}
        {showAddModal && (
          <AddBookingModal
            onClose={() => {
              setShowAddModal(false);
              setError("");
            }}
            onSubmit={handleCreateBooking}
            loading={loading}
            error={error}
          />
        )}

        {editingBooking && (
          <EditBookingModal
            booking={editingBooking}
            onClose={() => {
              setEditingBooking(null);
              setError("");
            }}
            onSubmit={handleEditBooking}
            loading={loading}
            error={error}
          />
        )}

        {viewingBookingDetails && (
          <BookingDetailsModal
            booking={viewingBookingDetails}
            onClose={() => setViewingBookingDetails(null)}
            onConvertToCheckIn={handleConvertToCheckIn}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
