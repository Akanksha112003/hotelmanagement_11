import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import GuestStatCard from "../components/GuestStatCard";
import InvoiceTable from "../components/InvoiceTable";
import CreateInvoiceModal from "../components/CreateInvoiceModal";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import PaymentModal from "../components/PaymentModal";
import {
  listInvoices,
  addNewInvoice,
  editInvoice,
  recordInvoicePayment,
  removeInvoice,
} from "../api";
import { DollarSign, FileText, Clock, CheckCircle2, AlertCircle, Plus, Search, Filter, Calendar } from "lucide-react";

export default function BillingManagement() {
  const [invoices, setInvoices] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  async function fetchInvoicesData() {
    setFetching(true);
    setError("");
    try {
      const res = await listInvoices();
      setInvoices(res.data || res.invoices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  // Create Invoice
  const handleCreateInvoice = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await addNewInvoice(data);
      setShowCreateModal(false);
      showToast("success", res.message || "Invoice generated successfully!");
      await fetchInvoicesData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Invoice
  const handleEditInvoice = async (data) => {
    if (!editingInvoice) return;
    setLoading(true);
    setError("");
    try {
      await editInvoice(editingInvoice._id, data);
      setEditingInvoice(null);
      showToast("success", "Invoice updated successfully!");
      await fetchInvoicesData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Record Payment
  const handleRecordPayment = async (paymentData) => {
    if (!paymentTargetInvoice) return;
    setLoading(true);
    setError("");
    try {
      const res = await recordInvoicePayment(paymentTargetInvoice._id, paymentData);
      setPaymentTargetInvoice(null);
      showToast("success", res.message || "Payment recorded successfully!");
      await fetchInvoicesData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id) => {
    setError("");
    try {
      await removeInvoice(id);
      setInvoices((prev) => prev.filter((i) => i._id !== id));
      showToast("success", "Invoice deleted successfully!");
    } catch (err) {
      showToast("error", err.message || "Failed to delete invoice.");
    }
  };

  // Revenue Dashboard Metrics
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalInvoices = invoices.length;

  // Paid Invoices revenue (only Paid or Issued with payments, excluding Cancelled & Draft)
  const paidInvoices = invoices.filter(
    (i) => i.invoiceStatus !== "Cancelled" && i.invoiceStatus !== "Draft"
  );

  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  const pendingPaymentsCount = invoices.filter(
    (i) => i.paymentStatus !== "Paid" && i.invoiceStatus !== "Cancelled"
  ).length;

  const monthlyRevenue = paidInvoices
    .filter((i) => {
      const d = new Date(i.issuedAt || i.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  const todaysRevenue = paidInvoices
    .filter((i) => {
      const d = new Date(i.issuedAt || i.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === todayStart.getTime();
    })
    .reduce((sum, i) => sum + (i.amountPaid || 0), 0);

  // Filtered Invoices
  const filteredInvoices = invoices.filter((i) => {
    const q = searchTerm.toLowerCase();
    const invNum = i.invoiceNumber?.toLowerCase() || "";
    const guestName = i.guest?.fullName?.toLowerCase() || "";
    const roomNum = String(i.room?.roomNumber || "").toLowerCase();

    const matchesSearch =
      searchTerm === "" || invNum.includes(q) || guestName.includes(q) || roomNum.includes(q);

    const matchesPaymentStatus =
      selectedPaymentStatus === "all" || i.paymentStatus === selectedPaymentStatus;

    const matchesInvoiceStatus =
      selectedInvoiceStatus === "all" || i.invoiceStatus === selectedInvoiceStatus;

    let matchesDate = true;
    if (startDateFilter) {
      const iDate = new Date(i.issuedAt || i.createdAt).setHours(0, 0, 0, 0);
      const fStart = new Date(startDateFilter).setHours(0, 0, 0, 0);
      matchesDate = matchesDate && iDate >= fStart;
    }
    if (endDateFilter) {
      const iDate = new Date(i.issuedAt || i.createdAt).setHours(0, 0, 0, 0);
      const fEnd = new Date(endDateFilter).setHours(0, 0, 0, 0);
      matchesDate = matchesDate && iDate <= fEnd;
    }

    return matchesSearch && matchesPaymentStatus && matchesInvoiceStatus && matchesDate;
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Financial Management & Invoices
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Billing & Invoices
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Generate tax invoices, record full & partial payments, view revenue analytics, and manage payment transaction history.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowCreateModal(true);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#D9B77A]" />
              Generate Invoice
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

        {/* ── Revenue Dashboard Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <GuestStatCard
            label="Total Invoices"
            value={totalInvoices}
            subtext="All time generated bills"
            icon={FileText}
            color="text-[#17384F]/60"
            accent="#17384F"
          />
          <GuestStatCard
            label="Total Revenue Collected"
            value={`$${totalRevenue.toLocaleString()}`}
            subtext="Net payments received"
            icon={DollarSign}
            color="text-emerald-700"
            accent="#059669"
          />
          <GuestStatCard
            label="Pending Invoices"
            value={pendingPaymentsCount}
            subtext="Invoices with balance due"
            icon={Clock}
            color="text-amber-700"
            accent="#d97706"
          />
          <GuestStatCard
            label="Monthly Revenue"
            value={`$${monthlyRevenue.toLocaleString()}`}
            subtext="Current month earnings"
            icon={Calendar}
            color="text-[#1E6F8E]"
            accent="#1E6F8E"
          />
          <GuestStatCard
            label="Today's Revenue"
            value={`$${todaysRevenue.toLocaleString()}`}
            subtext="Collected today"
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
                placeholder="Search by Invoice #, Guest Name, or Room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#17384F]/10 rounded-full pl-11 pr-5 py-3 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A] shadow-sm transition-all"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-4 h-4 text-[#17384F]/40 shrink-0 hidden sm:block" />

              {/* Payment Filter */}
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>

              {/* Invoice Filter */}
              <select
                value={selectedInvoiceStatus}
                onChange={(e) => setSelectedInvoiceStatus(e.target.value)}
                className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
              >
                <option value="all">All Invoice Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Issued">Issued</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Date Range Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#17384F]/5 text-xs font-bold text-[#17384F]/70">
            <span className="uppercase tracking-widest text-[11px] text-[#D9B77A]">Filter Issued Date Range:</span>
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

        {/* ── Invoices Directory Table ── */}
        <InvoiceTable
          invoices={filteredInvoices}
          fetching={fetching}
          onViewDetails={(inv) => setViewingInvoice(inv)}
          onRecordPayment={(inv) => setPaymentTargetInvoice(inv)}
          onEdit={(inv) => {
            setEditingInvoice(inv);
            setError("");
          }}
          onDelete={handleDeleteInvoice}
        />

        {/* Modals */}
        {showCreateModal && (
          <CreateInvoiceModal
            onClose={() => {
              setShowCreateModal(false);
              setError("");
            }}
            onSubmit={handleCreateInvoice}
            loading={loading}
            error={error}
          />
        )}

        {paymentTargetInvoice && (
          <PaymentModal
            invoice={paymentTargetInvoice}
            onClose={() => setPaymentTargetInvoice(null)}
            onSubmit={handleRecordPayment}
            loading={loading}
            error={error}
          />
        )}

        {viewingInvoice && (
          <InvoiceDetailsModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            onRecordPayment={(inv) => {
              setViewingInvoice(null);
              setPaymentTargetInvoice(inv);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
