import React, { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getUser } from "../utils/auth";
import { getDashboardStats } from "../api";
import { 
  Users, CalendarCheck, Home, DollarSign, Activity, AlertCircle, 
  Briefcase, PenTool, CheckCircle, Clock
} from "lucide-react";

export default function Dashboard() {
  const user = getUser();
  const displayName = user?.name ? user.name.split(" ")[0] : "Akanksha";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
        // Provide graceful defaults on failure
        setStats({
          kpis: {
            todaysCheckins: 0, todaysCheckouts: 0, occupancyRate: 0, todaysRevenue: 0,
            pendingHousekeeping: 0, vipGuests: 0, maintenanceRooms: 0, staffAvailable: 0
          },
          housekeepingProgress: { cleaning: 0, laundry: 0, inspection: 0 },
          recentActivity: [],
          activeAlerts: ["Cannot connect to operations center. Displaying offline data."],
          staffBreakdown: {
            reception: { online: 0, busy: 0, offDuty: 0 },
            housekeeping: { online: 0, busy: 0, offDuty: 0 },
            managers: { online: 0, busy: 0, offDuty: 0 },
            maintenance: { online: 0, busy: 0, offDuty: 0 },
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#17384F]/20 border-t-[#D9B77A] rounded-full animate-spin"></div>
            <p className="text-[#17384F]/60 font-semibold tracking-widest uppercase text-sm">Loading Operations Center...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 pb-10">
        
        {/* 1. PREMIUM HERO SECTION with Live Date & Clock */}
        <div className="bg-white rounded-3xl p-10 lg:p-14 shadow-[0_8px_30px_rgb(23,56,79,0.06)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#D9B77A]/10 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-4">
            <h2 className="text-[36px] md:text-[48px] font-light text-[#17384F] font-display tracking-tight leading-tight">
              {getGreeting()}, <span className="font-semibold">{displayName}</span>
            </h2>
            <p className="text-[18px] text-[#17384F]/70 font-medium max-w-xl leading-relaxed">
              Welcome to the Azure Coast Grand Operations Center. All systems are online and running smoothly.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-end md:text-right bg-[#17384F]/5 px-8 py-6 rounded-2xl border border-[#17384F]/10">
            <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#D9B77A] mb-2">{formattedDate}</span>
            <span className="text-[32px] md:text-[42px] font-bold text-[#17384F] tracking-tighter leading-none font-display">
              {formattedTime}
            </span>
          </div>
        </div>

        {/* 5. FLOATING ALERTS PANEL */}
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
             <span className="text-[15px] font-bold text-emerald-800">No active operational alerts.</span>
          </div>
        )}

        {/* 2 & 7. EXPANDED KPI SECTION with Mini Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Row 1 */}
          <KPICard 
            title="Today's Check-ins" 
            value={stats.kpis.todaysCheckins} 
            icon={<Users className="w-6 h-6" />}
            trend="↑ 12%" trendUp={true} 
            color="text-[#1E6F8E]" bg="bg-[#1E6F8E]/10" 
          />
          <KPICard 
            title="Today's Check-outs" 
            value={stats.kpis.todaysCheckouts} 
            icon={<CalendarCheck className="w-6 h-6" />}
            trend="↑ 4%" trendUp={true} 
            color="text-[#D9B77A]" bg="bg-[#D9B77A]/10" 
          />
          <KPICard 
            title="Current Occupancy" 
            value={`${stats.kpis.occupancyRate}%`} 
            icon={<Home className="w-6 h-6" />}
            trend="↓ 2%" trendUp={false} 
            color="text-[#17384F]" bg="bg-[#17384F]/10" 
          />
          <KPICard 
            title="Today's Revenue" 
            value={`$${stats.kpis.todaysRevenue.toLocaleString()}`} 
            icon={<DollarSign className="w-6 h-6" />}
            trend="↑ 18%" trendUp={true} 
            color="text-emerald-600" bg="bg-emerald-600/10" 
            isDark={true}
          />

          {/* Row 2 */}
          <KPICard 
            title="Pending Housekeeping" 
            value={stats.kpis.pendingHousekeeping} 
            icon={<Briefcase className="w-6 h-6" />}
            trend="↓ 5%" trendUp={true} // fewer tasks is good
            color="text-amber-600" bg="bg-amber-600/10" 
          />
          <KPICard 
            title="VIP Guests" 
            value={stats.kpis.vipGuests} 
            icon={<Users className="w-6 h-6" />}
            trend="Stable" trendUp={true} 
            color="text-purple-600" bg="bg-purple-600/10" 
          />
          <KPICard 
            title="Under Maintenance" 
            value={stats.kpis.maintenanceRooms} 
            icon={<PenTool className="w-6 h-6" />}
            trend="↑ 1" trendUp={false} 
            color="text-red-500" bg="bg-red-500/10" 
          />
          <KPICard 
            title="Staff Available" 
            value={stats.kpis.staffAvailable} 
            icon={<Activity className="w-6 h-6" />}
            trend="Optimal" trendUp={true} 
            color="text-blue-600" bg="bg-blue-600/10" 
          />
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column (2 spans): Activity & Housekeeping */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            
            {/* 3. HOUSEKEEPING PROGRESS */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
              <h3 className="text-[20px] font-bold text-[#17384F] font-display mb-8">Operational Progress</h3>
              <div className="flex flex-col gap-6">
                <ProgressBar label="Room Cleaning" percentage={stats.housekeepingProgress.cleaning} color="bg-[#1E6F8E]" />
                <ProgressBar label="Laundry Services" percentage={stats.housekeepingProgress.laundry} color="bg-[#D9B77A]" />
                <ProgressBar label="Room Inspections" percentage={stats.housekeepingProgress.inspection} color="bg-emerald-500" />
              </div>
            </div>

            {/* 4. RECENT ACTIVITY FEED */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[20px] font-bold text-[#17384F] font-display">Live Activity Feed</h3>
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live
                </span>
              </div>
              <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-[#17384F]/5">
                {stats.recentActivity.length > 0 ? stats.recentActivity.map((activity, i) => (
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
                  <p className="text-[#17384F]/50 pl-14">No recent activity.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Staff Availability */}
          <div className="flex flex-col">
            {/* 6. STAFF AVAILABILITY CARD */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 sticky top-8">
              <h3 className="text-[20px] font-bold text-[#17384F] font-display mb-8">Staff Availability</h3>
              
              <div className="flex flex-col gap-6">
                <StaffRow title="Reception Staff" data={stats.staffBreakdown.reception} />
                <StaffRow title="Housekeeping" data={stats.staffBreakdown.housekeeping} />
                <StaffRow title="Managers" data={stats.staffBreakdown.managers} />
                <StaffRow title="Maintenance" data={stats.staffBreakdown.maintenance} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

// Subcomponents
function KPICard({ title, value, icon, trend, trendUp, color, bg, isDark }) {
  const cardClasses = isDark 
    ? "bg-[#17384F] border-[#17384F] text-white" 
    : "bg-white border-[#17384F]/5 text-[#17384F]";
    
  const titleColor = isDark ? "text-[#D9B77A]" : "text-[#17384F]/60";
  const trendColor = trendUp ? "text-emerald-500" : "text-red-500";

  return (
    <div className={`rounded-3xl p-7 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group ${cardClasses}`}>
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${bg} ${color}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 bg-[#17384F]/5 px-2 py-1 rounded-lg">
          <span className={`text-[12px] font-bold ${trendColor}`}>{trend}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <span className={`text-[12px] font-bold uppercase tracking-[0.1em] ${titleColor}`}>{title}</span>
        <span className="text-[32px] font-bold tracking-tighter leading-none font-display">{value}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, percentage, color }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-[14px] font-bold text-[#17384F]">{label}</span>
        <span className="text-[14px] font-bold text-[#17384F]">{percentage}%</span>
      </div>
      <div className="h-3 w-full bg-[#17384F]/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function StaffRow({ title, data }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-bold text-[#17384F]/60 uppercase tracking-widest">{title}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="text-[14px] font-bold text-[#17384F]">{data.online}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <span className="text-[14px] font-bold text-[#17384F]">{data.busy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          <span className="text-[14px] font-bold text-[#17384F]">{data.offDuty}</span>
        </div>
      </div>
    </div>
  );
}

