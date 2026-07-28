import { useState, useEffect } from "react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3.5 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all";

const ROOM_TYPES = ["single", "double", "deluxe", "suite", "presidential"];
const ROOM_STATUSES = ["available", "occupied", "reserved", "dirty", "maintenance"];
const COMMON_AMENITIES = [
  "WiFi", "AC", "TV", "Mini Bar", "Balcony", "Sea View", "Jacuzzi",
  "King Bed", "Twin Beds", "Safe", "Room Service", "Kitchenette",
];

export default function EditRoomModal({ room, onClose, onSubmit, loading, error }) {
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber || "");
  const [type, setType] = useState(room?.type || "single");
  const [floor, setFloor] = useState(room?.floor || "");
  const [capacity, setCapacity] = useState(room?.capacity || "");
  const [pricePerNight, setPricePerNight] = useState(room?.pricePerNight || "");
  const [status, setStatus] = useState(room?.status || "available");
  const [selectedAmenities, setSelectedAmenities] = useState(room?.amenities || []);
  const [customAmenity, setCustomAmenity] = useState("");
  const [description, setDescription] = useState(room?.description || "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber || "");
      setType(room.type || "single");
      setFloor(room.floor || "");
      setCapacity(room.capacity || "");
      setPricePerNight(room.pricePerNight || "");
      setStatus(room.status || "available");
      setSelectedAmenities(room.amenities || []);
      setDescription(room.description || "");
    }
  }, [room]);

  const toggleAmenity = (a) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenity("");
  };

  const removeAmenity = (a) =>
    setSelectedAmenities((prev) => prev.filter((x) => x !== a));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!roomNumber.trim()) { setFormError("Room number is required."); return; }
    const fl = Number(floor);
    const cap = Number(capacity);
    const price = Number(pricePerNight);
    if (!fl || fl < 1) { setFormError("Floor must be at least 1."); return; }
    if (!cap || cap < 1) { setFormError("Capacity must be at least 1."); return; }
    if (isNaN(price) || price < 0) { setFormError("Price per night must be a non-negative number."); return; }

    onSubmit({
      roomNumber: roomNumber.trim(),
      type,
      floor: fl,
      capacity: cap,
      pricePerNight: price,
      status,
      amenities: selectedAmenities,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-8 lg:p-10 max-w-3xl w-full shadow-[0_20px_50px_rgba(23,56,79,0.2)] border border-[#D9B77A]/20 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[24px] font-bold text-[#17384F] font-display">Edit Room</h3>
            <p className="text-[#17384F]/60 text-[14px] mt-1">
              Editing Room <span className="font-bold text-[#17384F]">{room?.roomNumber}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#17384F]/5 hover:bg-[#17384F]/10 text-[#17384F] flex items-center justify-center transition-all">✕</button>
        </div>

        {(formError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-[14px] font-medium mb-6">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Room Number</label>
              <input type="text" placeholder="e.g. 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Room Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>Floor</label>
              <input type="number" min="1" placeholder="e.g. 3" value={floor} onChange={(e) => setFloor(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Capacity (Guests)</label>
              <input type="number" min="1" placeholder="e.g. 2" value={capacity} onChange={(e) => setCapacity(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Price Per Night ($)</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 250" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required className={inputCls} />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {ROOM_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className={labelCls}>Amenities</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    selectedAmenities.includes(a)
                      ? "bg-[#17384F] text-white border-[#17384F]"
                      : "bg-[#F8F7F4] text-[#17384F]/70 border-[#17384F]/10 hover:border-[#D9B77A]"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom amenity..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                className="flex-1 bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-4 py-2.5 text-[14px] text-[#17384F] outline-none focus:border-[#D9B77A]"
              />
              <button type="button" onClick={addCustomAmenity} className="px-4 py-2.5 bg-[#17384F]/5 hover:bg-[#17384F]/10 rounded-xl text-[12px] font-bold text-[#17384F] transition-all">
                Add
              </button>
            </div>
            {selectedAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAmenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 bg-[#D9B77A]/20 text-[#17384F] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#D9B77A]/30">
                    {a}
                    <button type="button" onClick={() => removeAmenity(a)} className="ml-1 text-[#17384F]/50 hover:text-red-500 transition-colors font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={2}
              placeholder="Optional room description or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#17384F]/10">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest text-[#17384F]/60 hover:text-[#17384F] hover:bg-[#17384F]/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-[#1E6F8E] to-[#17384F] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
