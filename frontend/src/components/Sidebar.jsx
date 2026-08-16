import { useLocation, Link } from "react-router-dom";

const NAV = [
  { label: "Dashboard Overview", href: "/dashboard" },
  { label: "Room Management", href: "/rooms" },
  { label: "Guest Management", href: "/guests" },
  { label: "Reservations", href: "/bookings" },
  { label: "Check-Ins", href: "/check-ins" },
  { label: "Housekeeping", href: "/housekeeping" },
  { label: "Food Orders", href: "/food-orders" },
  { label: "Checkout", href: "/checkout" },
  { label: "Billing & Invoices", href: "/billing" },
  { label: "Reports & Analytics", href: "/reports" },
  { label: "Hotel Profile", href: "/hotel-profile" },
  { label: "Room Settings", href: "/room-settings" },
  { label: "My Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[280px] hidden lg:block shrink-0 bg-[#263B32] border-r border-[#263B32]/80 relative z-40">
      <div className="sticky top-[80px] h-[calc(100vh-80px)] flex flex-col pt-8 pb-6 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A38A5A] mb-6 px-8">
          Main Navigation
        </p>
        <nav className="flex flex-col gap-1.5 px-5">
          {NAV.map((item) => {
            const isActive = location.pathname === item.href || (item.href === "/dashboard" && location.pathname === "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-5 py-3 rounded-md text-[13px] font-medium tracking-wide transition-all duration-200 flex items-center group ${
                  isActive
                    ? "bg-[#A38A5A] text-white font-semibold shadow-sm"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-3.5 transition-colors ${isActive ? "bg-white" : "bg-transparent group-hover:bg-[#A38A5A]"}`}></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-5 pt-8">
          <div className="bg-[#FFFFFF]/5 border border-[#A38A5A]/20 rounded-lg p-5 text-center">
            <p className="text-[#A38A5A] font-semibold text-[11px] uppercase tracking-widest mb-1.5">Grand Concierge</p>
            <p className="text-white/60 text-[11px] leading-relaxed">The Aurelia Grand Management System v2.5</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
