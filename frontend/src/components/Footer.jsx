export default function Footer() {
  return (
    <footer className="w-full bg-[#17384F] text-white/60 py-10 mt-16 border-t-[4px] border-[#D9B77A]">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-0 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[14px] font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Azure Coast Collection. All rights reserved.
        </div>
        <div className="flex items-center gap-8 text-[13px] font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-[#D9B77A] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#D9B77A] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#D9B77A] transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
