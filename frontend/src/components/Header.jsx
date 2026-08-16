import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";
import { useHotelProfile } from "../context/HotelProfileContext";

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();
  const { profile } = useHotelProfile();
  const displayName = user?.name ? user.name.split(" ")[0] : "Manager";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#263B32] border-b border-[#A38A5A]/30 shadow-md">
      <div className="max-w-[1920px] mx-auto h-[80px] flex items-center justify-between px-8 lg:px-12">
        {/* Brand with Hotel Profile Name & Logo */}
        <div className="flex items-center gap-4">
          {profile?.logo ? (
            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-[#A38A5A]/40 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={profile.logo}
                alt={profile.name || "The Aurelia Grand"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : null}

          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] sm:text-[22px] font-semibold font-display text-white tracking-wide leading-none">
              {profile?.name || "THE AURELIA GRAND"}
            </h1>
            <span className="text-[10px] font-medium text-[#A38A5A] uppercase tracking-[0.25em] mt-1.5 leading-none">
              Classic Hospitality. Modern Excellence.
            </span>
          </div>
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 border-r border-[#A38A5A]/20 pr-6">
            <div className="w-9 h-9 rounded-md bg-[#A38A5A]/20 flex items-center justify-center border border-[#A38A5A]/40">
              <span className="text-[#A38A5A] font-bold text-sm">{displayName.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Manager</span>
              <span className="text-[14px] font-medium text-white leading-tight">{displayName}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent border border-[#A38A5A]/50 text-[#A38A5A] px-5 py-2 rounded-md text-[12px] font-semibold uppercase tracking-wider hover:bg-[#A38A5A] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
