import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { getUser } from "../utils/auth";
import { getDashboardStats } from "../api";
import { getReportDashboard, getReportRevenue } from "../api/report";
import {
  Users, CalendarCheck, Home, DollarSign, Activity, AlertCircle,
  Briefcase, PenTool, CheckCircle, Clock, ArrowRight, TrendingUp,
  BedDouble, ChefHat, CreditCard, BarChart2, RefreshCcw,
} from "lucide-react";

export default function Dashboard() {
  const user = getUser();
  const displayName = user?.name ? user.name.split(" ")[0] : "Manager";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [liveKPIs, setLiveKPIs] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all data in parallel
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [opsResult, kpiResult, revResult] = await Promise.allSettled([
        getDashboardStats(),
        getReportDashboard(),
        getReportRevenue({ period: "monthly" }),
      ]);

      if (opsResult.status === "fulfilled") {
        setStats(opsResult.value.data);
      } else {
        setStats({
          kpis: { todaysCheckins: 0, todaysCheckouts: 0, occupancyRate: 0, todaysRevenue: 0, pendingHousekeeping: 0, vipGuests: 0, maintenanceRooms: 0, staffAvailable: 0 },
          housekeepingProgress: { cleaning: 0, laundry: 0, inspection: 0 },
          recentActivity: [],
          activeAlerts: ["Cannot connect to operations center."],
          staffBreakdown: {
            reception: { online: 0, busy: 0, offDuty: 0 },
            housekeeping: { online: 0, busy: 0, offDuty: 0 },
            managers: { online: 0, busy: 0, offDuty: 0 },
            maintenance: { online: 0, busy: 0, offDuty: 0 },
          },
        });
      }

      if (kpiResult.status === "fulfilled") setLiveKPIs(kpiResult.value.data);
      if (revResult.status === "fulfilled") setRevenueData(revResult.value.data);
      setLoading(false);
    };
    fetchAll();
  }, [refreshKey]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = currentTime.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#17384F]/20 border-t-[#D9B77A] rounded-full animate-spin" />
            <p className="text-[#17384F]/60 font-semibold tracking-widest uppercase text-sm">Loading Operations Center...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = liveKPIs?.totalRevenue ?? 0;
  const outstandingPayments = liveKPIs?.outstandingPayments ?? 0;
  const totalGuests = liveKPIs?.totalGuests ?? 0;
  const totalBookings = liveKPIs?.totalBookings ?? 0;
  const occupancyRate = liveKPIs?.occupancyRate ?? stats?.kpis?.occupancyRate ?? 0;
  const availableRooms = liveKPIs?.availableRooms ?? 0;
  const todayCheckins = liveKPIs?.todaysCheckins ?? stats?.kpis?.todaysCheckins ?? 0;
  const todayCheckouts = liveKPIs?.todaysCheckouts ?? stats?.kpis?.todaysCheckouts ?? 0;
  const pendingHousekeeping = liveKPIs?.pendingHousekeeping ?? stats?.kpis?.pendingHousekeeping ?? 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">

        {/* ─── HERO HEADER ─────────────────────────────────────────────── */}
        <div className="bg-[#17384F] rounded-3xl p-10 lg:p-14 shadow-[0_8px_40px_rgb(23,56,79,0.15)] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-[#1E6F8E]/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Azure Coast Grand Hotel
            </p>
            <h1 className="text-[36px] md:text-[48px] font-light text-white font-display tracking-tight leading-tight">
              {getGreeting()}, <span className="font-semibold">{displayName}</span>
            </h1>
            <p className="text-[17px] text-white/60 font-medium max-w-xl leading-relaxed">
              Operations Center is online. Here's a snapshot of today's activities.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-end text-right bg-white/5 backdrop-blur-sm px-8 py-6 rounded-2xl border border-white/10">
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#D9B77A] mb-2">{formattedDate}</span>
            <span className="text-[32px] md:text-[42px] font-bold text-white tracking-tighter leading-none font-display">
              {formattedTime}
            </span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="mt-4 flex items-center gap-2 text-white/50 hover:text-[#D9B77A] text-xs font-bold uppercase tracking-widest transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh Data
            </button>
          </div>
        </div>

        {/* ─── ALERTS ──────────────────────────────────────────────────── */}
        {stats?.activeAlerts?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {stats.activeAlerts.map((alert, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-[15px] font-bold text-red-800">{alert}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[15px] font-bold text-emerald-800">All systems operational — no active alerts.</span>
          </div>
        )}

        {/* ─── LIVE KPI CARDS (Row 1) ───────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#17384F]/50 mb-5">Live KPIs</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <KPICard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} sub="All-time collected" color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
            <KPICard title="Total Guests" value={totalGuests.toLocaleString()} icon={<Users className="w-6 h-6" />} sub="Registered in system" color="text-[#1E6F8E]" bg="bg-[#1E6F8E]/10" border="border-[#1E6F8E]/20" />
            <KPICard title="Total Bookings" value={totalBookings.toLocaleString()} icon={<CalendarCheck className="w-6 h-6" />} sub="All reservations" color="text-[#D9B77A]" bg="bg-[#D9B77A]/10" border="border-[#D9B77A]/20" />
            <KPICard title="Occupancy Rate" value={`${occupancyRate}%`} icon={<BedDouble className="w-6 h-6" />} sub="Current utilization" color="text-purple-600" bg="bg-purple-50" border="border-purple-100" />
          </div>
        </div>

        {/* ─── TODAY'S STATS (Row 2) ────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#17384F]/50 mb-5">Today's Operations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <KPICard title="Available Rooms" value={availableRooms} icon={<Home className="w-6 h-6" />} sub="Ready for guests" color="text-[#17384F]" bg="bg-[#17384F]/10" border="border-[#17384F]/10" />
            <KPICard title="Today's Check-ins" value={todayCheckins} icon={<Activity className="w-6 h-6" />} sub="Arrivals today" color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
            <KPICard title="Today's Check-outs" value={todayCheckouts} icon={<CheckCircle className="w-6 h-6" />} sub="Departures today" color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
            <KPICard title="Pending Payments" value={`₹${outstandingPayments.toLocaleString()}`} icon={<CreditCard className="w-6 h-6" />} sub="Outstanding balance" color="text-red-600" bg="bg-red-50" border="border-red-100" />
          </div>
        </div>

        {/* ─── MAIN GRID ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Column: Housekeeping + Activity */}
          <div className="xl:col-span-2 flex flex-col gap-8">

            {/* Operational Progress */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[20px] font-bold text-[#17384F] font-display">Operational Progress</h3>
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-amber-600">
                  <Briefcase className="w-4 h-4" /> {pendingHousekeeping} pending
                </span>
              </div>
              <div className="flex flex-col gap-6">
                <ProgressBar label="Room Cleaning" percentage={stats?.housekeepingProgress?.cleaning ?? 0} color="bg-[#1E6F8E]" />
                <ProgressBar label="Laundry Services" percentage={stats?.housekeepingProgress?.laundry ?? 0} color="bg-[#D9B77A]" />
                <ProgressBar label="Room Inspections" percentage={stats?.housekeepingProgress?.inspection ?? 0} color="bg-emerald-500" />
              </div>
            </div>

            {/* Revenue Mini Chart */}
            {revenueData && <RevenueWidget data={revenueData} />}

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[20px] font-bold text-[#17384F] font-display">Live Activity Feed</h3>
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-[#17384F]/5">
                {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-6 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#17384F]/10 flex items-center justify-center shrink-0 shadow-sm">
                      <Clock className="w-4 h-4 text-[#17384F]/40" />
                    </div>
                    <div className="flex flex-col flex-1 pb-6 border-b border-[#17384F]/5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[15px] font-bold text-[#17384F]">{activity.title}</span>
                        <span className="text-[13px] font-semibold text-[#17384F]/40">{activity.timeAgo}</span>
                      </div>
                      <span className="text-[14px] text-[#17384F]/70">Room {activity.room}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-[#17384F]/50 pl-14">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">

            {/* Quick Actions */}
            <div className="bg-[#17384F] rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.10)] border border-white/5">
              <h3 className="text-[18px] font-bold text-white font-display mb-6">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                {QUICK_ACTIONS.map((qa) => (
                  <Link
                    key={qa.href}
                    to={qa.href}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#D9B77A]/40 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#D9B77A]/20 transition-all">
                      <qa.icon className="w-5 h-5 text-[#D9B77A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{qa.label}</p>
                      <p className="text-xs text-white/50">{qa.sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-[#D9B77A] transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Mini Calendar */}
            <MiniCalendar today={currentTime} />

            {/* Staff Availability */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
              <h3 className="text-[20px] font-bold text-[#17384F] font-display mb-6">Staff Availability</h3>
              <div className="flex flex-col gap-5">
                <StaffRow title="Reception" data={stats?.staffBreakdown?.reception ?? { online: 0, busy: 0, offDuty: 0 }} />
                <StaffRow title="Housekeeping" data={stats?.staffBreakdown?.housekeeping ?? { online: 0, busy: 0, offDuty: 0 }} />
                <StaffRow title="Management" data={stats?.staffBreakdown?.managers ?? { online: 0, busy: 0, offDuty: 0 }} />
                <StaffRow title="Maintenance" data={stats?.staffBreakdown?.maintenance ?? { online: 0, busy: 0, offDuty: 0 }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Quick Action Items ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "New Check-In", sub: "Register guest arrival", href: "/check-ins", icon: Activity },
  { label: "New Booking", sub: "Create a reservation", href: "/bookings", icon: CalendarCheck },
  { label: "Food Order", sub: "Place a room service order", href: "/food-orders", icon: ChefHat },
  { label: "Generate Invoice", sub: "Billing & payments", href: "/billing", icon: CreditCard },
  { label: "View Reports", sub: "Analytics & insights", href: "/reports", icon: BarChart2 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, icon, sub, color, bg, border }) {
  return (
    <div className={`bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border ${border || "border-[#17384F]/5"} flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300 group cursor-default`}>
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-[#17384F]/20 group-hover:text-emerald-500 transition-all" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50 mb-1">{title}</p>
        <p className="text-[28px] font-bold text-[#17384F] tracking-tight leading-none font-display">{value}</p>
        {sub && <p className="text-xs text-[#17384F]/40 mt-1.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Revenue Widget ───────────────────────────────────────────────────────────
function RevenueWidget({ data }) {
  const entries = data?.entries ?? [];
  if (entries.length === 0) return null;

  const values = entries.map((e) => e.revenue || 0);
  const maxVal = Math.max(...values, 1);
  const totalRev = values.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[20px] font-bold text-[#17384F] font-display">Revenue Trend</h3>
          <p className="text-xs text-[#17384F]/50 mt-0.5">Monthly overview</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#D9B77A]">Period Total</p>
          <p className="text-[22px] font-bold text-[#17384F] font-display">₹{totalRev.toLocaleString()}</p>
        </div>
      </div>
      {/* SVG Bar Chart */}
      <div className="flex items-end gap-1.5 h-[90px]">
        {entries.slice(-12).map((e, i) => {
          const pct = maxVal > 0 ? (e.revenue / maxVal) * 100 : 0;
          const isLast = i === entries.slice(-12).length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? "bg-[#D9B77A]" : "bg-[#17384F]/20 group-hover:bg-[#1E6F8E]/60"}`}
                style={{ height: `${Math.max(pct, 3)}%`, minHeight: "4px" }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#17384F] text-white text-[9px] font-bold rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none">
                ₹{(e.revenue || 0).toLocaleString()}
              </div>
              <span className="text-[8px] text-[#17384F]/30 font-semibold truncate w-full text-center">{e.label ?? ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ today }) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  // Pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#17384F] font-display">Calendar</h3>
        <span className="text-xs font-bold text-[#17384F]/50 uppercase tracking-wider">{monthName}</span>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-[#17384F]/40 py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          const isToday = d === day;
          return (
            <div
              key={i}
              className={`flex items-center justify-center h-8 w-8 mx-auto rounded-xl text-[12px] font-semibold transition-all ${
                !d ? "" : isToday
                  ? "bg-[#17384F] text-[#D9B77A] font-bold shadow-md"
                  : "text-[#17384F]/60 hover:bg-[#17384F]/10 cursor-default"
              }`}
            >
              {d || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ label, percentage, color }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-[14px] font-bold text-[#17384F]">{label}</span>
        <span className="text-[14px] font-bold text-[#17384F]">{percentage}%</span>
      </div>
      <div className="h-3 w-full bg-[#17384F]/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// ─── Staff Row ────────────────────────────────────────────────────────────────
function StaffRow({ title, data }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-bold text-[#17384F]/60 uppercase tracking-widest">{title}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[14px] font-bold text-[#17384F]">{data.online}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-[14px] font-bold text-[#17384F]">{data.busy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="text-[14px] font-bold text-[#17384F]">{data.offDuty}</span>
        </div>
      </div>
    </div>
  );
}
