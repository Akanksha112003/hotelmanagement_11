import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import RoomTable from "../components/RoomTable";
import AddRoomModal from "../components/AddRoomModal";
import EditRoomModal from "../components/EditRoomModal";
import {
  listRooms,
  addNewRoom,
  editRoom,
  setRoomStatus,
  removeRoom,
} from "../api/room";

const ROOM_TYPES = ["single", "double", "deluxe", "suite", "presidential"];
const ROOM_STATUSES = ["available", "occupied", "reserved", "dirty", "maintenance"];

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null); // room object or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setFetching(true);
    setError("");
    try {
      const res = await listRooms();
      setRooms(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  const handleCreateRoom = async (data) => {
    setLoading(true);
    setError("");
    try {
      await addNewRoom(data);
      setShowAddModal(false);
      setSuccessMsg("Room added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = async (data) => {
    if (!editRoom) return;
    setLoading(true);
    setError("");
    try {
      await editRoom(editRoom._id, data);
      setEditRoom(null);
      setSuccessMsg("Room updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setError("");
    try {
      await setRoomStatus(id, status);
      setRooms((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      setSuccessMsg("Room status updated!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setError("");
    try {
      await removeRoom(id);
      setRooms((prev) => prev.filter((r) => r._id !== id));
      setSuccessMsg("Room deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  // Dashboard counts
  const counts = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    dirty: rooms.filter((r) => r.status === "dirty").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      searchTerm === "" ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* ── Page Header ── */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Inventory & Status
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Room Management
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Manage your room inventory, track availability, update statuses, and configure room details and amenities.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => { setShowAddModal(true); setError(""); }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Room
            </button>
          </div>
        </div>

        {/* ── Notifications ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {successMsg}
          </div>
        )}

        {/* ── Dashboard Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { label: "Total Rooms", value: counts.total, color: "text-[#17384F]/50", accent: "#17384F" },
            { label: "Available", value: counts.available, color: "text-emerald-600", accent: "#059669" },
            { label: "Occupied", value: counts.occupied, color: "text-[#1E6F8E]", accent: "#1E6F8E" },
            { label: "Dirty", value: counts.dirty, color: "text-amber-600", accent: "#d97706" },
            { label: "Maintenance", value: counts.maintenance, color: "text-red-600", accent: "#dc2626" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 flex flex-col gap-1.5"
              style={{ borderTop: `3px solid ${card.accent}20` }}
            >
              <span className={`text-[11px] font-bold uppercase tracking-widest ${card.color}`}>
                {card.label}
              </span>
              <span className="text-[36px] font-bold text-[#17384F] font-display leading-none">
                {card.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by Room Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A] shadow-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
            >
              <option value="all">All Types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-[#17384F]/10 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all shadow-sm"
            >
              <option value="all">All Statuses</option>
              {ROOM_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Room Table ── */}
        <RoomTable
          rooms={filteredRooms}
          fetching={fetching}
          onEdit={(room) => { setEditRoom(room); setError(""); }}
          onDelete={handleDeleteRoom}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* ── Add Room Modal ── */}
        {showAddModal && (
          <AddRoomModal
            onClose={() => { setShowAddModal(false); setError(""); }}
            onSubmit={handleCreateRoom}
            loading={loading}
            error={error}
          />
        )}

        {/* ── Edit Room Modal ── */}
        {editRoom && (
          <EditRoomModal
            room={editRoom}
            onClose={() => { setEditRoom(null); setError(""); }}
            onSubmit={handleEditRoom}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
