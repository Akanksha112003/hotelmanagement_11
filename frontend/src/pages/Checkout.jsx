import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CheckoutTable from "../components/CheckoutTable";
import CheckoutModal from "../components/CheckoutModal";
import {
  getCheckouts,
  createCheckout,
  updateCheckoutPayment,
  deleteCheckout,
} from "../api/checkout";

export default function Checkout() {
  const [checkouts, setCheckouts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");

  useEffect(() => {
    fetchCheckouts();
  }, []);

  async function fetchCheckouts() {
    setFetching(true);
    setError("");
    try {
      const res = await getCheckouts();
      setCheckouts(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  const handleCreateCheckout = async (data) => {
    setLoading(true);
    setError("");
    try {
      await createCheckout(data);
      setShowModal(false);
      setSuccessMsg("Checkout processed successfully! Room status updated to dirty and cleaning task created.");
      setTimeout(() => setSuccessMsg(""), 4000);
      await fetchCheckouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (id, paymentStatus) => {
    setError("");
    try {
      await updateCheckoutPayment(id, paymentStatus);
      setCheckouts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, paymentStatus } : c))
      );
      setSuccessMsg("Payment status updated!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCheckout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this checkout record?")) return;
    setError("");
    try {
      await deleteCheckout(id);
      setCheckouts((prev) => prev.filter((c) => c._id !== id));
      setSuccessMsg("Checkout record deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Dashboard card counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = {
    total: checkouts.length,
    pendingPayment: checkouts.filter((c) => c.paymentStatus === "Pending").length,
    paidBills: checkouts.filter((c) => c.paymentStatus === "Paid").length,
    todaysCheckouts: checkouts.filter((c) => {
      const d = new Date(c.checkOutDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length,
  };

  // Revenue summary — total paid bills
  const totalRevenue = checkouts
    .filter((c) => c.paymentStatus === "Paid")
    .reduce((sum, c) => sum + Number(c.totalAmount || 0), 0);

  // Filtered checkout records
  const filteredCheckouts = checkouts.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.guestName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      filterPayment === "all" || c.paymentStatus === filterPayment;

    return matchesSearch && matchesPayment;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Billing & Departures
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Checkout
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Process guest departures, generate invoices, and manage final billing. Rooms are automatically queued for cleaning.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowModal(true);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Checkout
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {successMsg}
          </div>
        )}

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#17384F]/50">
              Total Checkouts
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.total}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">All recorded departures</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
              Pending Payments
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.pendingPayment}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">Awaiting settlement</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
              Paid Bills
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.paidBills}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">
              ${totalRevenue.toFixed(2)} collected
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E6F8E]">
              Today's Checkouts
            </span>
            <span className="text-[36px] font-bold text-[#17384F] font-display">
              {counts.todaysCheckouts}
            </span>
            <span className="text-[12px] text-[#17384F]/40 font-medium">Departures today</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by Room Number or Guest Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A] shadow-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Pending">Payment Pending</option>
              <option value="Paid">Payment Paid</option>
            </select>
          </div>
        </div>

        {/* Checkout Table */}
        <CheckoutTable
          checkouts={filteredCheckouts}
          fetching={fetching}
          onUpdatePayment={handleUpdatePayment}
          onDeleteCheckout={handleDeleteCheckout}
        />

        {/* Checkout Modal */}
        {showModal && (
          <CheckoutModal
            onClose={() => {
              setShowModal(false);
              setError("");
            }}
            onSubmit={handleCreateCheckout}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
