import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getCheckins,
  createCheckin,
  deleteCheckin,
  checkoutGuest,
  listRooms,
  setRoomStatus,
  listGuests,
  listBookings,
  convertBookingToCheckInApi,
} from "../api";
import {
  UserCheck,
  UserPlus,
  Calendar,
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";

const ID_PROOF_OPTIONS = [
  { value: "nationalId", label: "National ID / Aadhaar" },
  { value: "passport", label: "Passport" },
  { value: "driverLicense", label: "Driver's License" },
  { value: "voterId", label: "Voter ID" },
];

const ID_PROOF_LABELS = {
  nationalId: "National ID / Aadhaar",
  passport: "Passport",
  driverLicense: "Driver's License",
  voterId: "Voter ID",
  Aadhaar: "Aadhaar Card",
  Passport: "Passport",
  "Voter ID": "Voter ID",
  "Driving License": "Driving License",
  "PAN Card": "PAN Card",
};

const today = () => new Date().toISOString().slice(0, 10);

export default function CheckIn() {
  // ── Tab / Modal state ──────────────────────────────────────────────
  const [mode, setMode] = useState("reservation"); // 'reservation' | 'walkin'
  const [showForm, setShowForm] = useState(false);

  // ── Data from DB ───────────────────────────────────────────────────
  const [checkins, setCheckins] = useState([]);
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

  // ── Loading / Error / Success ──────────────────────────────────────
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Reservation mode selection ─────────────────────────────────────
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ── Walk-in mode: guest search + selection ─────────────────────────
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);

  // ── Walk-in extra fields ───────────────────────────────────────────
  const [walkinRoomId, setWalkinRoomId] = useState("");
  const [walkinCheckIn, setWalkinCheckIn] = useState(today());
  const [walkinCheckOut, setWalkinCheckOut] = useState("");
  const [walkinGuests, setWalkinGuests] = useState(1);
  const [walkinIdProof, setWalkinIdProof] = useState("nationalId");
  const [walkinIdNumber, setWalkinIdNumber] = useState("");

  // ── Directory filters ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Load all data on mount ─────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setFetching(true);
    setError("");
    const errors = [];

    const [ci, bk, gu, rm] = await Promise.allSettled([
      getCheckins(),
      listBookings(),
      listGuests(),
      listRooms(),
    ]);

    // Check-ins
    if (ci.status === "fulfilled") {
      setCheckins(ci.value.checkins || ci.value.data || []);
    } else {
      errors.push(`Check-ins: ${ci.reason?.message || "Load failed"}`);
    }

    // Bookings — filter to only Confirmed/Pending for check-in eligibility
    if (bk.status === "fulfilled") {
      const all = bk.value.data || bk.value.bookings || [];
      const eligible = all.filter((b) =>
        b.bookingStatus === "Confirmed" || b.bookingStatus === "Pending"
      );
      setBookings(eligible);
    } else {
      errors.push(`Bookings: ${bk.reason?.message || "Load failed"}`);
    }

    // Guests
    if (gu.status === "fulfilled") {
      setGuests(gu.value.data || gu.value.guests || []);
    } else {
      errors.push(`Guests: ${gu.reason?.message || "Load failed"}`);
    }

    // Rooms
    if (rm.status === "fulfilled") {
      setRooms(rm.value.data || []);
    } else {
      errors.push(`Rooms: ${rm.reason?.message || "Load failed"}`);
    }

    if (errors.length > 0) {
      setError(`Some data could not be loaded — ${errors.join(" | ")}`);
    }
    setFetching(false);
  }

  // ── Derived: available rooms only ─────────────────────────────────
  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === "available"),
    [rooms]
  );

  // ── Derived: filtered guest list for walk-in selector ─────────────
  const filteredGuests = useMemo(() => {
    if (!guestSearch.trim()) return guests;
    const q = guestSearch.toLowerCase();
    return guests.filter(
      (g) =>
        g.fullName?.toLowerCase().includes(q) ||
        g.email?.toLowerCase().includes(q) ||
        g.phone?.includes(q)
    );
  }, [guests, guestSearch]);

  // ── Booking selection → auto-populate read-only display ───────────
  function handleBookingSelect(e) {
    const id = e.target.value;
    setSelectedBookingId(id);
    if (!id) { setSelectedBooking(null); return; }
    const bk = bookings.find((b) => b._id === id);
    setSelectedBooking(bk || null);
  }

  // ── Guest selection (walk-in) ──────────────────────────────────────
  function handleGuestSelect(guestId) {
    setSelectedGuestId(guestId);
    const g = guests.find((x) => x._id === guestId);
    setSelectedGuest(g || null);
    if (g) {
      setWalkinIdProof(g.idProofType || "nationalId");
      setWalkinIdNumber(g.idProofNumber || "");
    }
  }

  // ── Reset form ─────────────────────────────────────────────────────
  function resetForm() {
    setMode("reservation");
    setSelectedBookingId("");
    setSelectedBooking(null);
    setGuestSearch("");
    setSelectedGuestId("");
    setSelectedGuest(null);
    setWalkinRoomId("");
    setWalkinCheckIn(today());
    setWalkinCheckOut("");
    setWalkinGuests(1);
    setWalkinIdProof("nationalId");
    setWalkinIdNumber("");
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function notify(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  // ── Submit: Reservation check-in ──────────────────────────────────
  async function handleReservationSubmit(e) {
    e.preventDefault();
    if (!selectedBookingId) { setError("Please select a booking."); return; }
    setError("");
    setSubmitting(true);
    try {
      await convertBookingToCheckInApi(selectedBookingId);
      notify(`Check-in completed for booking #${selectedBooking?.bookingNumber}.`);
      closeForm();
      await loadAll();
    } catch (err) {
      setError(err.message || "Check-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Submit: Walk-in check-in ───────────────────────────────────────
  async function handleWalkinSubmit(e) {
    e.preventDefault();

    if (!selectedGuestId) { setError("Please select an existing guest from Guest Management."); return; }
    if (!walkinRoomId)    { setError("Please select an available room."); return; }
    if (!walkinCheckIn)   { setError("Check-in date is required."); return; }
    if (!walkinCheckOut)  { setError("Check-out date is required."); return; }
    if (new Date(walkinCheckOut) <= new Date(walkinCheckIn)) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    if (!walkinIdNumber.trim()) { setError("ID proof number is required."); return; }

    setError("");
    setSubmitting(true);

    const room = rooms.find((r) => r._id === walkinRoomId);
    const guest = selectedGuest;

    try {
      // 1. Create check-in record using existing guest and room data
      await createCheckin({
        guestName: guest.fullName,
        email: guest.email,
        phone: guest.phone,
        roomNumber: room.roomNumber,
        checkInDate: walkinCheckIn,
        checkOutDate: walkinCheckOut,
        numberOfGuests: Number(walkinGuests),
        idProof: walkinIdProof,
        idProofNumber: walkinIdNumber.trim(),
        status: "checked-in",
      });

      // 2. Mark the room as occupied
      await setRoomStatus(walkinRoomId, "occupied");

      notify(`Walk-in check-in completed: ${guest.fullName} → Room ${room.roomNumber}.`);
      closeForm();
      await loadAll();
    } catch (err) {
      setError(err.message || "Walk-in check-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Checkout action ────────────────────────────────────────────────
  async function handleCheckout(id) {
    try {
      await checkoutGuest(id);
      notify("Guest checked out successfully.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  // ── Delete check-in record ─────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm("Delete this check-in record?")) return;
    try {
      await deleteCheckin(id);
      notify("Check-in record deleted.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function fmt(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  }

  // ── Filtered directory records ─────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return checkins.filter((c) => {
      const matchSearch =
        !q ||
        c.guestName?.toLowerCase().includes(q) ||
        String(c.roomNumber).includes(q) ||
        c.email?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [checkins, searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl p-8 border border-[#263B32]/10 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A38A5A] mb-1">Front Desk & Arrivals</p>
            <h2 className="text-3xl font-normal text-[#292824] font-display">Guest Check-In</h2>
            <p className="text-sm text-[#78806B] mt-1">
              Check in guests from confirmed reservations, or register a walk-in using existing guest data.
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            className="shrink-0 aurelia-btn-primary flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            {showForm ? "Close" : "New Check-In"}
          </button>
        </div>

        {/* ── Notifications ────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>
            <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />{successMsg}
          </div>
        )}

        {/* ── Check-In Form ─────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-xl border border-[#A38A5A]/30 shadow-md p-8 space-y-6">

            {/* Mode toggle */}
            <div className="flex items-center justify-between pb-5 border-b border-[#263B32]/10">
              <div>
                <h3 className="text-xl font-semibold text-[#263B32] font-display">Check-In Registration</h3>
                <p className="text-xs text-[#78806B] mt-0.5">Select source of check-in.</p>
              </div>
              <div className="flex items-center gap-1 bg-[#F5F1E8] p-1 rounded-lg border border-[#263B32]/10">
                <button
                  type="button"
                  onClick={() => { setMode("reservation"); resetForm(); setShowForm(true); }}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${
                    mode === "reservation" ? "bg-[#263B32] text-white shadow-sm" : "text-[#292824]/60 hover:text-[#263B32]"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  From Reservation ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("walkin"); resetForm(); setShowForm(true); }}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${
                    mode === "walkin" ? "bg-[#263B32] text-white shadow-sm" : "text-[#292824]/60 hover:text-[#263B32]"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Walk-In
                </button>
              </div>
            </div>

            {/* ── RESERVATION MODE ──────────────────────────────────── */}
            {mode === "reservation" && (
              <form onSubmit={handleReservationSubmit} className="space-y-6">

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">
                    Select Confirmed / Pending Booking *
                  </label>
                  {bookings.length === 0 ? (
                    <div className="bg-[#F5F1E8] border border-[#263B32]/10 rounded-xl px-5 py-4 text-sm text-[#78806B] italic">
                      No confirmed or pending bookings available. All bookings may already be checked in, or create a reservation first from the Reservations module.
                    </div>
                  ) : (
                    <select
                      value={selectedBookingId}
                      onChange={handleBookingSelect}
                      required
                      className="aurelia-input cursor-pointer"
                    >
                      <option value="">-- Choose a Booking --</option>
                      {bookings.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.bookingNumber} — {b.guest?.fullName || "Guest"} | Room {b.room?.roomNumber || "N/A"} | {fmt(b.checkInDate)} → {fmt(b.checkOutDate)} [{b.bookingStatus}]
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Auto-populated readonly details */}
                {selectedBooking && (
                  <div className="bg-[#F5F1E8] rounded-xl border border-[#A38A5A]/30 p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoField label="Guest Name" value={selectedBooking.guest?.fullName} />
                    <InfoField label="Email" value={selectedBooking.guest?.email} />
                    <InfoField label="Phone" value={selectedBooking.guest?.phone} />
                    <InfoField label="Room" value={`Room ${selectedBooking.room?.roomNumber} — ${selectedBooking.room?.type}`} />
                    <InfoField label="Check-In Date" value={fmt(selectedBooking.checkInDate)} />
                    <InfoField label="Check-Out Date" value={fmt(selectedBooking.checkOutDate)} />
                    <InfoField label="Guests" value={`${selectedBooking.adults || 1} Adults, ${selectedBooking.children || 0} Children`} />
                    <InfoField label="Booking Status" value={selectedBooking.bookingStatus} />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[#263B32]/10">
                  <button type="button" onClick={closeForm} className="aurelia-btn-outline">Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedBookingId}
                    className="aurelia-btn-primary disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : "Confirm Check-In"}
                  </button>
                </div>
              </form>
            )}

            {/* ── WALK-IN MODE ──────────────────────────────────────── */}
            {mode === "walkin" && (
              <form onSubmit={handleWalkinSubmit} className="space-y-6">

                {/* Guest selector from Guest Management */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">
                    Select Guest from Guest Management *
                  </label>
                  <p className="text-xs text-[#78806B]">
                    All guests are loaded from Guest Management. The check-in will be linked to the selected existing guest — no duplicate records are created.
                  </p>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#263B32]/40" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      className="aurelia-input pl-9"
                    />
                  </div>

                  {/* Guest list */}
                  {guests.length === 0 ? (
                    <div className="bg-[#F5F1E8] border border-[#263B32]/10 rounded-xl px-5 py-4 text-sm text-[#78806B] italic">
                      No guests found in Guest Management. Please add a guest first from the Guest Management module.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-[#263B32]/10 rounded-xl divide-y divide-[#263B32]/5 bg-white">
                      {filteredGuests.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-[#78806B] italic">No matching guests.</div>
                      ) : filteredGuests.map((g) => (
                        <button
                          key={g._id}
                          type="button"
                          onClick={() => handleGuestSelect(g._id)}
                          className={`w-full text-left px-4 py-3 text-sm transition-all hover:bg-[#F5F1E8] ${
                            selectedGuestId === g._id ? "bg-[#263B32]/5 border-l-4 border-[#A38A5A]" : ""
                          }`}
                        >
                          <span className="font-semibold text-[#292824]">{g.fullName}</span>
                          <span className="text-xs text-[#78806B] ml-3">{g.email} · {g.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto-filled guest details (read-only) */}
                {selectedGuest && (
                  <div className="bg-[#F5F1E8] rounded-xl border border-[#A38A5A]/30 p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoField label="Guest Name" value={selectedGuest.fullName} />
                    <InfoField label="Email" value={selectedGuest.email} />
                    <InfoField label="Phone" value={selectedGuest.phone} />
                    <InfoField label="Nationality" value={selectedGuest.nationality || "—"} />
                    <InfoField label="ID Type (pre-filled)" value={ID_PROOF_LABELS[selectedGuest.idProofType] || selectedGuest.idProofType || "—"} />
                    <InfoField label="ID Number (pre-filled)" value={selectedGuest.idProofNumber || "—"} />
                  </div>
                )}

                {/* Check-in-specific fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Available Room */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">
                      Available Room *
                    </label>
                    {availableRooms.length === 0 ? (
                      <div className="aurelia-input text-[#78806B] italic text-sm">No rooms currently available.</div>
                    ) : (
                      <select value={walkinRoomId} onChange={(e) => setWalkinRoomId(e.target.value)} required className="aurelia-input cursor-pointer">
                        <option value="">-- Select Room --</option>
                        {availableRooms.map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.roomNumber} — {r.type} (₹{r.pricePerNight}/night)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Number of Guests */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">Number of Guests *</label>
                    <input
                      type="number" min="1" required
                      value={walkinGuests}
                      onChange={(e) => setWalkinGuests(e.target.value)}
                      className="aurelia-input"
                    />
                  </div>

                  {/* Check-In Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">Check-In Date *</label>
                    <input type="date" required value={walkinCheckIn} onChange={(e) => setWalkinCheckIn(e.target.value)} className="aurelia-input" />
                  </div>

                  {/* Check-Out Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">Check-Out Date *</label>
                    <input type="date" required value={walkinCheckOut} onChange={(e) => setWalkinCheckOut(e.target.value)} className="aurelia-input" />
                  </div>

                  {/* ID Proof Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">ID Proof Type *</label>
                    <select value={walkinIdProof} onChange={(e) => setWalkinIdProof(e.target.value)} required className="aurelia-input cursor-pointer">
                      {ID_PROOF_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* ID Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#4A3529]">ID Document Number *</label>
                    <input
                      type="text" required
                      value={walkinIdNumber}
                      onChange={(e) => setWalkinIdNumber(e.target.value)}
                      placeholder="e.g. AADHAAR-1234-5678"
                      className="aurelia-input font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#263B32]/10">
                  <button type="button" onClick={closeForm} className="aurelia-btn-outline">Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedGuestId || !walkinRoomId}
                    className="aurelia-btn-primary disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : "Complete Walk-In Check-In"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── Directory / Ledger ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-[#263B32]/10 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-[#263B32]/10 bg-[#F5F1E8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[#263B32] font-display">Active Stays Ledger</h3>
              <p className="text-xs text-[#78806B]">{checkins.length} record(s) in database</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#263B32]/40" />
                <input
                  type="text"
                  placeholder="Search guest, room, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-[#263B32]/15 rounded-lg text-xs outline-none focus:border-[#A38A5A] w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#263B32]/15 rounded-lg px-3 py-2 text-xs font-semibold text-[#263B32] outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="checked-in">Checked-In</option>
                <option value="checked-out">Checked-Out</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-[#263B32]/60 border-b border-[#263B32]/10">
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Stay Period</th>
                  <th className="px-6 py-4">Guests</th>
                  <th className="px-6 py-4">ID Proof</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263B32]/5 text-sm">
                {fetching ? (
                  <tr><td colSpan="7" className="px-8 py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-[#263B32]/50 text-sm">
                      <div className="w-4 h-4 border-2 border-[#A38A5A] border-t-transparent rounded-full animate-spin" />
                      Loading check-in records...
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="px-8 py-14 text-center">
                    <div className="space-y-2 text-[#78806B]">
                      <BedDouble className="w-8 h-8 text-[#263B32]/20 mx-auto" />
                      <p className="text-sm font-medium">No check-in records found.</p>
                      <p className="text-xs">Use "New Check-In" above to register a guest arrival.</p>
                    </div>
                  </td></tr>
                ) : filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-[#F5F1E8]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#263B32] block">{c.guestName}</span>
                      <span className="text-xs text-[#78806B]">{c.email} · {c.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-xs bg-[#263B32]/5 border border-[#263B32]/10 text-[#263B32] px-2.5 py-1 rounded-md">
                        Rm {c.roomNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-medium text-[#292824] block">{fmt(c.checkInDate)}</span>
                      <span className="text-[#78806B]">→ {fmt(c.checkOutDate)}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#292824]">{c.numberOfGuests || 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-[#292824] block">
                        {ID_PROOF_LABELS[c.idProof] || c.idProof}
                      </span>
                      <span className="text-xs font-mono text-[#78806B]">{c.idProofNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === "checked-in"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : c.status === "checked-out"
                          ? "bg-gray-100 text-gray-600 border border-gray-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {c.status === "checked-in" && (
                          <button
                            onClick={() => handleCheckout(c._id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#263B32]/20 text-[#263B32] hover:bg-[#263B32] hover:text-white transition-all"
                          >
                            Check Out
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

/* ── Readonly info field ─────────────────────────────────────────────── */
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#78806B] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#292824]">{value || "—"}</p>
    </div>
  );
}
