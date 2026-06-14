import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] font-sans text-[#17384F]">
      <Header />
      <div className="flex flex-1 max-w-[1920px] w-full mx-auto">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 md:p-10 lg:p-16">
            <div className="max-w-[1400px] mx-auto w-full">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

