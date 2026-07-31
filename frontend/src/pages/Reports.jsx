import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ReportStatCard from "../components/ReportStatCard";
import DateRangeFilter from "../components/DateRangeFilter";
import RevenueChart from "../components/RevenueChart";
import OccupancyChart from "../components/OccupancyChart";
import BookingChart from "../components/BookingChart";
import FoodSalesChart from "../components/FoodSalesChart";
import PaymentChart from "../components/PaymentChart";
import HousekeepingChart from "../components/HousekeepingChart";
import {
  getReportDashboard,
  getReportRevenue,
  getReportOccupancy,
  getReportBookings,
  getReportGuests,
  getReportFood,
  getReportPayments,
  getReportHousekeeping,
} from "../api";
import { useHotelProfile } from "../context/HotelProfileContext";
import {
  DollarSign,
  Users,
  Home,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Download,
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
  Utensils,
  CreditCard,
  Building2,
} from "lucide-react";

export default function Reports() {
  const { profile } = useHotelProfile();
  const printRef = useRef(null);

  // Filter States
  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data States
  const [dashboardData, setDashboardData] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [occupancyData, setOccupancyData] = useState({});
  const [bookingData, setBookingData] = useState({});
  const [guestData, setGuestData] = useState({});
  const [foodData, setFoodData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [housekeepingData, setHousekeepingData] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchAllReports();
  }, [period, startDate, endDate]);

  async function fetchAllReports() {
    setLoading(true);
    setError("");

    const filterParams = {};
    if (startDate && endDate) {
      filterParams.start = startDate;
      filterParams.end = endDate;
    } else {
      filterParams.period = period;
    }

    try {
      const [
        dashRes,
        revRes,
        occRes,
        bookRes,
        guestRes,
        foodRes,
        payRes,
        houseRes,
      ] = await Promise.all([
        getReportDashboard().catch(() => ({ data: {} })),
        getReportRevenue(filterParams).catch(() => ({ data: {} })),
        getReportOccupancy().catch(() => ({ data: {} })),
        getReportBookings(filterParams).catch(() => ({ data: {} })),
        getReportGuests().catch(() => ({ data: {} })),
        getReportFood(filterParams).catch(() => ({ data: {} })),
        getReportPayments(filterParams).catch(() => ({ data: {} })),
        getReportHousekeeping().catch(() => ({ data: {} })),
      ]);

      setDashboardData(dashRes.data || {});
      setRevenueData(revRes.data || {});
      setOccupancyData(occRes.data || {});
      setBookingData(bookRes.data || {});
      setGuestData(guestRes.data || {});
      setFoodData(foodRes.data || {});
      setPaymentData(payRes.data || {});
      setHousekeepingData(houseRes.data || {});
    } catch (err) {
      setError(err.message || "Failed to load report analytics.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Export to CSV / Excel
  const handleExportCSV = () => {
    try {
      const csvRows = [];
      csvRows.push([`${(profile?.name || "AZURE COAST HOTEL & RESORT").toUpperCase()} - ANALYTICS REPORT SUMMARY`]);
      csvRows.push([`Generated On: ${new Date().toLocaleString()}`]);
      csvRows.push([`Filter Period: ${startDate && endDate ? `${startDate} to ${endDate}` : period.toUpperCase()}`]);
      csvRows.push([]);

      csvRows.push(["KEY PERFORMANCE INDICATORS"]);
      csvRows.push(["Metric", "Value"]);
      csvRows.push(["Total Revenue Collected", `$${(dashboardData.totalRevenue || 0).toLocaleString()}`]);
      csvRows.push(["Total Registered Guests", dashboardData.totalGuests || 0]);
      csvRows.push(["Occupancy Rate", `${dashboardData.occupancyRate || 0}%`]);
      csvRows.push(["Total Bookings", dashboardData.totalBookings || 0]);
      csvRows.push(["Available Rooms", dashboardData.availableRooms || 0]);
      csvRows.push(["Occupied Rooms", dashboardData.occupiedRooms || 0]);
      csvRows.push(["Outstanding Payments", `$${(dashboardData.outstandingPayments || 0).toLocaleString()}`]);
      csvRows.push(["Pending Housekeeping Tasks", dashboardData.pendingHousekeeping || 0]);
      csvRows.push(["Today Check-Ins", dashboardData.todaysCheckins || 0]);
      csvRows.push(["Today Check-Outs", dashboardData.todaysCheckouts || 0]);
      csvRows.push([]);

      csvRows.push(["REVENUE BREAKDOWN"]);
      csvRows.push(["Category", "Amount ($)"]);
      csvRows.push(["Room Charges", `$${(revenueData.roomRevenue || 0).toLocaleString()}`]);
      csvRows.push(["Food Orders", `$${(revenueData.foodRevenue || 0).toLocaleString()}`]);
      csvRows.push(["Extra Services", `$${(revenueData.extraRevenue || 0).toLocaleString()}`]);
      csvRows.push(["Tax Collected", `$${(revenueData.totalTax || 0).toLocaleString()}`]);
      csvRows.push(["Discounts Given", `$${(revenueData.totalDiscount || 0).toLocaleString()}`]);

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Hotel_Analytics_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("success", "Analytics report exported to CSV / Excel!");
    } catch {
      showToast("error", "Failed to export report CSV.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDateChange = (type, val) => {
    if (type === "start") setStartDate(val);
    if (type === "end") setEndDate(val);
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-10 relative">
        {/* Toast Notification */}
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
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6 print:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Executive Business Intelligence
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Reports & Analytics
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Live operational metrics, financial intelligence, occupancy breakdowns, guest demographics, and facility efficiency.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={fetchAllReports}
              disabled={loading}
              title="Refresh All Analytics"
              className="p-3 rounded-full bg-[#F8F7F4] hover:bg-[#17384F]/10 text-[#17384F] transition-all disabled:opacity-50 border border-[#17384F]/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="px-5 py-3 rounded-full bg-[#1E6F8E]/10 hover:bg-[#1E6F8E]/20 text-[#1E6F8E] text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-[#1E6F8E]/20 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
            </button>

            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-full bg-[#17384F] hover:bg-[#1E6F8E] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
            >
              <Printer className="w-4 h-4 text-[#D9B77A]" /> Print / Export PDF
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

        {/* ── Date Range Filter Controls ── */}
        <div className="print:hidden">
          <DateRangeFilter
            period={period}
            onPeriodChange={(p) => {
              setPeriod(p);
              handleClearDates();
            }}
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            onClear={handleClearDates}
          />
        </div>

        {/* ── Printable Header (Appears only during print/PDF) ── */}
        <div className="hidden print:flex items-center justify-between pb-6 border-b border-[#17384F]/20">
          <div className="flex items-center gap-4">
            {profile?.logo ? (
              <img src={profile.logo} alt={profile.name} className="w-12 h-12 object-contain" />
            ) : (
              <Building2 className="w-10 h-10 text-[#17384F]" />
            )}
            <div>
              <h1 className="text-2xl font-bold font-display text-[#17384F]">
                {profile?.name || "LUXURY HOTEL & RESORT"}
              </h1>
              <p className="text-xs text-[#17384F]/60">Executive Analytics & Performance Report</p>
            </div>
          </div>
          <div className="text-right text-xs text-[#17384F]/70">
            <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Filter Period:</strong> {startDate && endDate ? `${startDate} to ${endDate}` : period.toUpperCase()}</p>
          </div>
        </div>

        {/* ── 9 Master KPI Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <ReportStatCard
            label="Total Revenue Collected"
            value={`$${(dashboardData.totalRevenue || 0).toLocaleString()}`}
            subtext="Net payments received"
            icon={DollarSign}
            color="text-emerald-700"
            accent="#059669"
            trend={revenueData.revenueGrowth}
          />

          <ReportStatCard
            label="Total Registered Guests"
            value={dashboardData.totalGuests || 0}
            subtext={`${guestData.returningGuests || 0} returning • ${guestData.newGuests || 0} new`}
            icon={Users}
            color="text-[#17384F]"
            accent="#17384F"
          />

          <ReportStatCard
            label="Occupancy Rate"
            value={`${dashboardData.occupancyRate || 0}%`}
            subtext={`${dashboardData.occupiedRooms || 0} occupied / ${dashboardData.totalRooms || 0} rooms`}
            icon={Home}
            color="text-[#1E6F8E]"
            accent="#1E6F8E"
          />

          <ReportStatCard
            label="Total Bookings"
            value={dashboardData.totalBookings || 0}
            subtext={`${bookingData.confirmed || 0} confirmed • ${bookingData.completed || 0} completed`}
            icon={CalendarCheck}
            color="text-[#D9B77A]"
            accent="#D9B77A"
          />

          <ReportStatCard
            label="Available Rooms"
            value={dashboardData.availableRooms || 0}
            subtext={`${dashboardData.reservedRooms || 0} reserved • ${dashboardData.maintenanceRooms || 0} maintenance`}
            icon={Home}
            color="text-emerald-700"
            accent="#059669"
          />

          <ReportStatCard
            label="Outstanding Payments"
            value={`$${(dashboardData.outstandingPayments || 0).toLocaleString()}`}
            subtext={`${dashboardData.pendingInvoicesCount || 0} invoices balance due`}
            icon={DollarSign}
            color="text-rose-700"
            accent="#dc2626"
          />

          <ReportStatCard
            label="Pending Housekeeping"
            value={dashboardData.pendingHousekeeping || 0}
            subtext="Cleaning / inspection tasks"
            icon={Clock}
            color="text-amber-700"
            accent="#d97706"
          />

          <ReportStatCard
            label="Today's Check-Ins"
            value={dashboardData.todaysCheckins || 0}
            subtext="Checked-in today"
            icon={UserCheck}
            color="text-[#1E6F8E]"
            accent="#1E6F8E"
          />

          <ReportStatCard
            label="Today's Check-Outs"
            value={dashboardData.todaysCheckouts || 0}
            subtext="Checked-out today"
            icon={CalendarCheck}
            color="text-teal-700"
            accent="#0f766e"
          />
        </div>

        {/* ── Additional Analytics Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-[#17384F]/5 shadow-sm space-y-1">
            <span className="text-xs text-[#17384F]/50 block font-bold uppercase tracking-wider">Average Revenue / Booking</span>
            <span className="text-2xl font-bold font-display text-[#17384F]">
              ${(bookingData.avgBookingValue || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#17384F]/5 shadow-sm space-y-1">
            <span className="text-xs text-[#17384F]/50 block font-bold uppercase tracking-wider">Average Guest Stay Duration</span>
            <span className="text-2xl font-bold font-display text-[#17384F]">
              {occupancyData.avgStayDuration || guestData.avgStayDuration || 0} Days
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#17384F]/5 shadow-sm space-y-1">
            <span className="text-xs text-[#17384F]/50 block font-bold uppercase tracking-wider">Housekeeping Completion Rate</span>
            <span className="text-2xl font-bold font-display text-emerald-700">
              {housekeepingData.completionRate || 0}%
            </span>
          </div>
        </div>

        {/* ── 6 Interactive SVG Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart
            trend={revenueData.trend || []}
            totalRevenue={revenueData.totalRevenue || 0}
            avgRevenue={revenueData.avgRevenuePerInvoice || 0}
          />

          <OccupancyChart data={occupancyData} />

          <BookingChart data={bookingData} />

          <FoodSalesChart data={foodData} />

          <PaymentChart data={paymentData} />

          <HousekeepingChart data={housekeepingData} />
        </div>

        {/* ── Top VIP & Frequent Guests Table ── */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-[#17384F]/5 bg-[#F8F7F4]/30 flex justify-between items-center">
            <h3 className="text-xl font-bold font-display text-[#17384F]">Top Guests & Loyalty Analytics</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D9B77A]">Most Frequent Visitors</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#17384F]/10 bg-white">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#17384F]/50">Guest Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#17384F]/50">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#17384F]/50">Nationality</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#17384F]/50">Total Stays</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-[#17384F]/50 text-right">Total Spent ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17384F]/5">
                {(!guestData.topGuests || guestData.topGuests.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-8 text-center text-[#17384F]/50">
                      No guest loyalty records available.
                    </td>
                  </tr>
                ) : (
                  guestData.topGuests.map((g, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F7F4]/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#17384F]">{g.fullName}</td>
                      <td className="px-6 py-4 text-[#17384F]/70">{g.email}</td>
                      <td className="px-6 py-4 text-[#17384F]/70">{g.nationality || "—"}</td>
                      <td className="px-6 py-4 font-semibold text-[#17384F]">{g.totalVisits} visits</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 text-right">
                        ${(g.totalSpent || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
