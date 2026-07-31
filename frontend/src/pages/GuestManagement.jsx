import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import GuestStatCard from "../components/GuestStatCard";
import GuestTable from "../components/GuestTable";
import AddGuestModal from "../components/AddGuestModal";
import EditGuestModal from "../components/EditGuestModal";
import GuestProfileModal from "../components/GuestProfileModal";
import {
  listGuests,
  addNewGuest,
  editGuest,
  removeGuest,
  getCheckins,
} from "../api";
import { Users, UserCheck, UserPlus, Repeat, Plus, Search, Filter, CheckCircle2, AlertCircle } from "lucide-react";

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [activeCheckinsCount, setActiveCheckinsCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [viewingGuestProfile, setViewingGuestProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("all");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchGuestData();
  }, []);

  async function fetchGuestData() {
    setFetching(true);
    setError("");
    try {
      const [resGuests, resCheckins] = await Promise.all([
        listGuests().catch(() => ({ data: [] })),
        getCheckins().catch(() => ({ checkins: [] })),
      ]);

      setGuests(resGuests.data || resGuests.guests || []);

      const checkins = resCheckins.checkins || [];
      const currentStaying = checkins.filter(
        (c) => c.status === "checked-in"
      ).length;
      setActiveCheckinsCount(currentStaying);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  // Create Guest Handler
  const handleCreateGuest = async (data) => {
    setLoading(true);
    setError("");
    try {
      await addNewGuest(data);
      setShowAddModal(false);
      showToast("success", "New guest registered successfully!");
      await fetchGuestData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Guest Handler
  const handleEditGuest = async (data) => {
    if (!editingGuest) return;
    setLoading(true);
    setError("");
    try {
      await editGuest(editingGuest._id, data);
      setEditingGuest(null);
      showToast("success", "Guest profile updated successfully!");
      await fetchGuestData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Guest Handler
  const handleDeleteGuest = async (id) => {
    setError("");
    try {
      await removeGuest(id);
      setGuests((prev) => prev.filter((g) => g._id !== id));
      showToast("success", "Guest deleted successfully!");
    } catch (err) {
      showToast("error", err.message || "Failed to delete guest.");
    }
  };

  // Dashboard Stats Calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalGuests = guests.length;
  const returningGuests = guests.filter((g) => (g.totalVisits || 0) > 1).length;
  const newGuestsThisMonth = guests.filter((g) => {
    if (!g.createdAt) return false;
    const d = new Date(g.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Dynamic list of nationalities for filter
  const nationalities = Array.from(
    new Set(guests.map((g) => g.nationality).filter(Boolean))
  ).sort();

  // Filtered Guests
  const filteredGuests = guests.filter((g) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      (g.fullName && g.fullName.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q)) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.idProofNumber && g.idProofNumber.toLowerCase().includes(q));

    const matchesNationality =
      selectedNationality === "all" || g.nationality === selectedNationality;

    return matchesSearch && matchesNationality;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-10 relative">
        {/* Toast Notification Floating Card */}
        {toast && (
          <div
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fadeIn transition-all ${
              toast.type === "success"
                ? "bg-[#17384F] border-[#D9B77A] text-white"
                : "bg-red-900 border-red-700 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[#D9B77A]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-300" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Guest Relations & CRM
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Guest Management
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              View and manage complete guest profiles, track stay metrics, search guest directory, and manage identity verification details.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowAddModal(true);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#D9B77A]" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-900 font-bold">✕</button>
          </div>
        )}

        {/* ── Summary Dashboard Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GuestStatCard
            label="Total Guests"
            value={totalGuests}
            subtext="All registered guest records"
            icon={Users}
            color="text-[#17384F]/60"
            accent="#17384F"
          />
          <GuestStatCard
            label="Currently Staying"
            value={activeCheckinsCount}
            subtext="Active in room reservations"
            icon={UserCheck}
            color="text-emerald-700"
            accent="#059669"
          />
          <GuestStatCard
            label="Returning Guests"
            value={returningGuests}
            subtext="Guests with > 1 completed stay"
            icon={Repeat}
            color="text-[#1E6F8E]"
            accent="#1E6F8E"
          />
          <GuestStatCard
            label="New Guests This Month"
            value={newGuestsThisMonth}
            subtext="Registered in current month"
            icon={UserPlus}
            color="text-[#D9B77A]"
            accent="#D9B77A"
          />
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#17384F]/40" />
            <input
              type="text"
              placeholder="Search by Name, Phone, Email, or ID Proof..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#17384F]/10 rounded-full pl-11 pr-5 py-3 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A] shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-[#17384F]/40 shrink-0" />
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
            >
              <option value="all">All Nationalities</option>
              {nationalities.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Guest Directory Table ── */}
        <GuestTable
          guests={filteredGuests}
          fetching={fetching}
          onViewProfile={(g) => setViewingGuestProfile(g)}
          onEdit={(g) => {
            setEditingGuest(g);
            setError("");
          }}
          onDelete={handleDeleteGuest}
        />

        {/* Modals */}
        {showAddModal && (
          <AddGuestModal
            onClose={() => {
              setShowAddModal(false);
              setError("");
            }}
            onSubmit={handleCreateGuest}
            loading={loading}
            error={error}
          />
        )}

        {editingGuest && (
          <EditGuestModal
            guest={editingGuest}
            onClose={() => {
              setEditingGuest(null);
              setError("");
            }}
            onSubmit={handleEditGuest}
            loading={loading}
            error={error}
          />
        )}

        {viewingGuestProfile && (
          <GuestProfileModal
            guest={viewingGuestProfile}
            onClose={() => setViewingGuestProfile(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
