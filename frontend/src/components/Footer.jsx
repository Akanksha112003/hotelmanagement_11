import { useHotelProfile } from "../context/HotelProfileContext";

export default function Footer() {
  const { profile } = useHotelProfile();
  const hotelName = profile?.name || "THE AURELIA GRAND";

  return (
    <footer className="w-full bg-[#263B32] text-white/70 py-8 mt-12 border-t border-[#A38A5A]/30">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[13px] font-medium tracking-wide">
          &copy; {new Date().getFullYear()} {hotelName}. Classic Hospitality. Modern Excellence.
        </div>
        <div className="flex items-center gap-6 text-[12px] font-semibold uppercase tracking-wider text-[#A38A5A]">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <span className="text-white/20">•</span>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <span className="text-white/20">•</span>
          <a href="#" className="hover:text-white transition-colors">Concierge Support</a>
        </div>
      </div>
    </footer>
  );
}
