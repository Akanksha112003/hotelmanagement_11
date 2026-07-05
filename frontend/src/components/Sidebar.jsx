import { useLocation, Link } from "react-router-dom";

const NAV = [
  { label: "Dashboard Overview", href: "/dashboard" },
  { label: "Reservations", href: "/reservations" },
  { label: "Check-Ins", href: "/check-ins" },
  { label: "Guest Requests", href: "/requests" },
  { label: "Housekeeping", href: "/housekeeping" },
  { label: "Financial Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[320px] hidden lg:block shrink-0 bg-[#17384F] border-r border-white/5 relative z-40 shadow-[4px_0_24px_rgba(23,56,79,0.05)]">
      <div className="sticky top-[88px] h-[calc(100vh-88px)] flex flex-col pt-12 pb-8 overflow-y-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A] mb-8 px-12">
          Main Navigation
        </p>
        <nav className="flex flex-col gap-3 px-8">
          {NAV.map((item) => {
            const isActive = location.pathname === item.href || (item.href === "/dashboard" && location.pathname === "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-6 py-4 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-300 ease-out flex items-center group ${
                  isActive
                    ? "bg-[#D9B77A] text-[#17384F] shadow-lg shadow-[#D9B77A]/20 translate-x-2"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-4 transition-colors ${isActive ? "bg-[#17384F]" : "bg-transparent group-hover:bg-[#D9B77A]"}`}></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-8 pt-12">
          <div className="bg-[#1E6F8E]/20 border border-[#1E6F8E]/30 rounded-2xl p-6 text-center">
            <p className="text-[#D9B77A] font-bold text-xs uppercase tracking-widest mb-2">Need Help?</p>
            <p className="text-white/70 text-xs leading-relaxed">Contact IT support for dashboard assistance.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

