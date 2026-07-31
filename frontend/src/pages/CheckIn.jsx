import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getCheckins,
  createCheckin,
  deleteCheckin,
  checkoutGuest,
  getRooms,
  listGuests,
  addNewGuest,
} from "../api";

const EMPTY_FORM = {
  guestName: "",
  email: "",
  phone: "",
  roomNumber: "",
  checkInDate: "",
  checkOutDate: "",
  numberOfGuests: "",
  idProof: "nationalId",
  idProofNumber: "",
  status: "checked-in",
};

const ID_PROOF_LABELS = {
  passport: "Passport",
  nationalId: "National ID",
  driverLicense: "Driver License",
};

export default function CheckIn() {
  const [checkins, setCheckins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [existingGuests, setExistingGuests] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCheckins();
    fetchAvailableRooms();
    fetchGuests();
  }, []);

  async function fetchGuests() {
    try {
      const res = await listGuests();
      setExistingGuests(res.data || res.guests || []);
    } catch (gErr) {
      console.warn("Could not load guests list for check-in dropdown:", gErr.message);
    }
  }

  async function fetchCheckins() {
    setFetching(true);
    try {
      const data = await getCheckins();
      setCheckins(data.checkins || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }

  async function fetchAvailableRooms() {
    try {
      const data = await getRooms();
      const rooms = data.data || [];
      const available = rooms.filter((room) => room.status === "available");
      setAvailableRooms(available);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleGuestSelect(e) {
    const guestId = e.target.value;
    setSelectedGuestId(guestId);
    if (!guestId) return;

    const guest = existingGuests.find((g) => g._id === guestId);
    if (guest) {
      setForm((prev) => ({
        ...prev,
        guestName: guest.fullName || "",
        email: guest.email || "",
        phone: guest.phone || "",
        idProof: guest.idProofType || "nationalId",
        idProofNumber: guest.idProofNumber || "",
      }));
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Auto create guest if new guest
      try {
        await addNewGuest({
          fullName: form.guestName,
          email: form.email,
          phone: String(form.phone),
          idProofType: form.idProof || "nationalId",
          idProofNumber: form.idProofNumber,
        });
      } catch {
        // If guest already exists with this email/phone, ignore duplicate error
      }

      await createCheckin({
        ...form,
        numberOfGuests: Number(form.numberOfGuests),
        status: "checked-in"
      });
      setForm(EMPTY_FORM);
      setSelectedGuestId("");
      setShowForm(false);
      await fetchCheckins();
      await fetchAvailableRooms();
      await fetchGuests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteCheckin(id);
      await fetchCheckins();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCheckout(id) {
    try {
      await checkoutGuest(id);
      await fetchCheckins();
      await fetchAvailableRooms();
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-12">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E6F8E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Front Desk Operations
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Guest Check-In
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Manage arrivals, register new guests, and oversee active stays in the property.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
              }}
              className="bg-[#17384F] hover:bg-[#1E6F8E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgb(23,56,79,0.2)] hover:-translate-y-1"
            >
              {showForm ? "Cancel Registration" : "New Check-In"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-[14px] font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* Check-in Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.06)] border border-[#D9B77A]/20 transition-all duration-500 ease-out animate-[acg-fade-up_0.5s_ease_forwards]">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-[24px] font-bold text-[#17384F] font-display">Registration Details</h3>
                <p className="text-[#17384F]/60 text-[14px] mt-1">Please fill in all required guest information accurately.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Select Existing Guest Dropdown */}
                {existingGuests.length > 0 && (
                  <div className="bg-[#F8F7F4]/80 p-5 rounded-2xl border border-[#17384F]/10 flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#D9B77A]">
                      Select Existing Guest (Auto-Fill Profile)
                    </label>
                    <select
                      value={selectedGuestId}
                      onChange={handleGuestSelect}
                      className="w-full bg-white border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium outline-none focus:border-[#D9B77A]"
                    >
                      <option value="">-- Create New Guest or Choose Existing --</option>
                      {existingGuests.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.fullName} ({g.email} • {g.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Guest Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Guest Name</label>
                    <input
                      type="text"
                      name="guestName"
                      value={form.guestName}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                      placeholder="e.g. Eleanor Vance"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                      placeholder="eleanor@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Contact Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  {/* Room Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Assigned Room</label>
                    {availableRooms.length > 0 ? (
                      <select
                        name="roomNumber"
                        value={form.roomNumber}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select an available room</option>
                        {availableRooms.map((room) => (
                          <option key={room._id} value={room.roomNumber}>
                            Room {room.roomNumber} • {room.type} (${room.pricePerNight}/nt)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="roomNumber"
                        value={form.roomNumber}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                        placeholder="Room No."
                      />
                    )}
                  </div>

                  {/* Number of Guests */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Total Guests</label>
                    <input
                      type="number"
                      name="numberOfGuests"
                      value={form.numberOfGuests}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                      placeholder="1"
                    />
                  </div>

                  {/* ID Proof Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Identification</label>
                    <select
                      name="idProof"
                      value={form.idProof}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="nationalId">National ID</option>
                      <option value="passport">Passport</option>
                      <option value="driverLicense">Driver's License</option>
                    </select>
                  </div>

                  {/* ID Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">ID Number</label>
                    <input
                      type="text"
                      name="idProofNumber"
                      value={form.idProofNumber}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                      placeholder="Document ID"
                    />
                  </div>

                  {/* Check-in Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Arrival Date</label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={form.checkInDate}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                    />
                  </div>

                  {/* Check-out Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70">Departure Date</label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={form.checkOutDate}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-4 mt-4 pt-8 border-t border-[#17384F]/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm(EMPTY_FORM);
                      setError("");
                    }}
                    className="px-8 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest text-[#17384F]/60 hover:text-[#17384F] hover:bg-[#17384F]/5 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#D9B77A] to-[#c4a162] text-white px-10 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(217,183,122,0.3)] transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5"
                  >
                    {loading ? "Processing..." : "Complete Check-In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Guest Records Table */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
            <h3 className="text-[20px] font-bold text-[#17384F] font-display">Active Stays & History</h3>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#17384F]/10 bg-white">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50">Guest Profile</th>
                  <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50">Room</th>
                  <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50">Stay Dates</th>
                  <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50">Document</th>
                  <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17384F]/5">
                {fetching ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                        <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin"></div>
                        Loading records...
                      </div>
                    </td>
                  </tr>
                ) : checkins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <p className="text-[15px] text-[#17384F]/40 font-medium">No check-in records available at the moment.</p>
                    </td>
                  </tr>
                ) : (
                  checkins.map((c) => (
                    <tr key={c._id} className="hover:bg-[#F8F7F4]/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[#17384F] text-[15px]">{c.guestName}</span>
                          <span className="text-[13px] text-[#17384F]/50 font-medium">{c.email} • {c.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center justify-center bg-[#17384F]/5 border border-[#17384F]/10 rounded-lg px-3 py-1.5">
                          <span className="font-bold text-[#17384F] text-[13px] tracking-wide">Rm {c.roomNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] text-[#17384F] font-medium">{formatDate(c.checkInDate)}</span>
                          <span className="text-[12px] text-[#17384F]/50 font-semibold uppercase tracking-wider">To {formatDate(c.checkOutDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] text-[#17384F] font-medium">{ID_PROOF_LABELS[c.idProof] || c.idProof}</span>
                          <span className="text-[12px] text-[#17384F]/50 font-mono tracking-wider">{c.idProofNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${
                          c.status === "checked-in" || c.status === "booked"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {(c.status === "checked-in" || c.status === "booked") && (
                            <button
                              onClick={() => handleCheckout(c._id)}
                              className="text-[11px] font-bold uppercase tracking-widest text-[#1E6F8E] border border-[#1E6F8E]/20 bg-[#1E6F8E]/5 hover:bg-[#1E6F8E] hover:text-white px-4 py-2 rounded-lg transition-all"
                            >
                              Check Out
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
