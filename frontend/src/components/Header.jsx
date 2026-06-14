import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();
  const displayName = user?.name ? user.name.split(" ")[0] : "Akanksha";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#17384F] border-b-[3px] border-[#D9B77A] shadow-xl">
      <div className="max-w-[1920px] mx-auto h-[88px] flex items-center justify-between px-8 lg:px-16">
        
        {/* Brand */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[26px] font-bold font-display text-white tracking-wide leading-none">
            Hotel Management
          </h1>
          <span className="text-[11px] font-semibold text-[#D9B77A] uppercase tracking-[0.2em] mt-1.5 leading-none">
            Azure Coast Collection
          </span>
        </div>

        {/* User & Actions */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-4 border-r border-[#D9B77A]/20 pr-8">
            <div className="w-10 h-10 rounded-full bg-[#D9B77A]/15 flex items-center justify-center border border-[#D9B77A]/40 shadow-inner">
              <span className="text-[#D9B77A] font-bold text-lg">{displayName.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Welcome Back</span>
              <span className="text-[15px] font-semibold text-white leading-tight">{displayName}</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 bg-transparent border-2 border-[#D9B77A] text-[#D9B77A] px-7 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-widest hover:bg-[#D9B77A] hover:text-[#17384F] transition-all duration-300 ease-out cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
}

