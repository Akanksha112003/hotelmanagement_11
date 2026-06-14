import DashboardLayout from "../layouts/DashboardLayout";
import { getUser } from "../utils/auth";

export default function Dashboard() {
  const user = getUser();
  const displayName = user?.name ? user.name.split(" ")[0] : "Akanksha";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-12">
        
        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-10 lg:p-14 shadow-[0_8px_30px_rgb(23,56,79,0.06)] border border-[#17384F]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <h2 className="text-[40px] md:text-[52px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Good day, <span className="font-semibold">{displayName}</span>
            </h2>
            <p className="text-[18px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed">
              Welcome to the Azure Coast Collection control center. Here is your operational overview for today.
            </p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300">
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#1E6F8E]">Available Rooms</span>
            <div className="flex items-end gap-3">
              <span className="text-[48px] font-bold text-[#17384F] leading-none tracking-tighter">42</span>
              <span className="text-[14px] font-semibold text-[#17384F]/40 mb-1">/ 68</span>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300">
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#D9B77A]">Today's Arrivals</span>
            <div className="flex items-end gap-3">
              <span className="text-[48px] font-bold text-[#17384F] leading-none tracking-tighter">18</span>
              <span className="text-[14px] font-semibold text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded">+3 pending</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300">
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#1E6F8E]">Current Occupancy</span>
            <div className="flex items-end gap-3">
              <span className="text-[48px] font-bold text-[#17384F] leading-none tracking-tighter">76%</span>
              <span className="text-[14px] font-semibold text-[#17384F]/40 mb-1">Optimal</span>
            </div>
          </div>

          <div className="bg-[#17384F] rounded-3xl p-8 shadow-[0_12px_40px_rgb(23,56,79,0.15)] border border-[#17384F] flex flex-col gap-4 transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#D9B77A] relative z-10">Daily Revenue</span>
            <div className="flex items-end gap-3 relative z-10">
              <span className="text-[48px] font-bold text-white leading-none tracking-tighter">$12.4k</span>
              <span className="text-[14px] font-semibold text-emerald-400 mb-1">↑ 12%</span>
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Recent Reservations */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-bold text-[#17384F] font-display">Recent Reservations</h3>
              <button className="text-[12px] font-bold uppercase tracking-widest text-[#D9B77A] hover:text-[#c4a162] cursor-pointer">View All</button>
            </div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[#17384F]/5 last:border-0 gap-4 hover:bg-[#F8F7F4]/50 transition-colors rounded-2xl">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#1E6F8E]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#1E6F8E] font-bold text-lg">R{i}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[16px] font-bold text-[#17384F]">Ocean View Suite</span>
                      <span className="text-[13px] text-[#17384F]/60 font-medium">Guest Name {i} • 3 Nights</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col sm:text-right">
                      <span className="text-[15px] font-bold text-[#17384F]">$850.00</span>
                      <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider mt-1 inline-block text-center sm:text-right">Confirmed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Check-Ins */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-bold text-[#17384F] font-display">Pending Check-Ins</h3>
              <button className="text-[12px] font-bold uppercase tracking-widest text-[#D9B77A] hover:text-[#c4a162] cursor-pointer">View All</button>
            </div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[#17384F]/5 last:border-0 gap-4 hover:bg-[#F8F7F4]/50 transition-colors rounded-2xl">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[16px] font-bold text-[#17384F]">Guest Name {i}</span>
                      <span className="text-[13px] text-[#17384F]/60 font-medium">Room {100 + i} • ETA: 14:00 PM</span>
                    </div>
                  </div>
                  <button className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-6 py-3 rounded-xl text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#17384F]/20 sm:w-auto w-full text-center cursor-pointer">
                    Check In
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

