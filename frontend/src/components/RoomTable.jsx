import RoomStatusBadge from "./RoomStatusBadge";

const thCls =
  "px-5 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";

const ROOM_STATUSES = ["available", "occupied", "reserved", "dirty", "maintenance"];

const TYPE_LABELS = {
  single: "Single",
  double: "Double",
  deluxe: "Deluxe",
  suite: "Suite",
  presidential: "Presidential",
};

export default function RoomTable({
  rooms,
  fetching,
  onEdit,
  onDelete,
  onUpdateStatus,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 overflow-hidden">
      <div className="px-8 py-6 border-b border-[#17384F]/5 flex justify-between items-center bg-[#F8F7F4]/30">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Room Inventory</h3>
        <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-[#17384F]/40">
          {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#17384F]/10 bg-white">
              <th className={thCls}>Room</th>
              <th className={thCls}>Type</th>
              <th className={thCls}>Floor</th>
              <th className={thCls}>Capacity</th>
              <th className={thCls}>Price / Night</th>
              <th className={thCls}>Amenities</th>
              <th className={thCls}>Status</th>
              <th className={`${thCls} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17384F]/5">
            {fetching ? (
              <tr>
                <td colSpan="8" className="px-8 py-16 text-center">
                  <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-medium">
                    <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin"></div>
                    Loading rooms...
                  </div>
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-8 py-16 text-center">
                  <p className="text-[15px] text-[#17384F]/40 font-medium">
                    No rooms found. Add your first room to get started.
                  </p>
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr
                  key={room._id}
                  className="hover:bg-[#F8F7F4]/50 transition-colors group"
                >
                  {/* Room Number */}
                  <td className="px-5 py-5">
                    <div className="w-10 h-10 rounded-2xl bg-[#17384F] text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
                      {room.roomNumber}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-5">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-[#17384F]/5 text-[#17384F] border border-[#17384F]/10">
                      {TYPE_LABELS[room.type] || room.type}
                    </span>
                  </td>

                  {/* Floor */}
                  <td className="px-5 py-5">
                    <span className="text-[14px] font-semibold text-[#17384F]">
                      Floor {room.floor}
                    </span>
                  </td>

                  {/* Capacity */}
                  <td className="px-5 py-5">
                    <span className="text-[14px] font-semibold text-[#17384F]">
                      {room.capacity} {room.capacity === 1 ? "Guest" : "Guests"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-5">
                    <span className="text-[15px] font-bold text-[#17384F] font-display">
                      ${Number(room.pricePerNight).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#17384F]/40 font-medium ml-1">/night</span>
                  </td>

                  {/* Amenities */}
                  <td className="px-5 py-5">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {room.amenities && room.amenities.length > 0 ? (
                        <>
                          {room.amenities.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#D9B77A]/15 text-[#17384F] border border-[#D9B77A]/25"
                            >
                              {a}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#17384F]/5 text-[#17384F]/50">
                              +{room.amenities.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[12px] text-[#17384F]/30">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-5">
                    <div className="flex flex-col gap-2 items-start">
                      <RoomStatusBadge status={room.status} />
                      <select
                        value={room.status}
                        onChange={(e) => onUpdateStatus(room._id, e.target.value)}
                        className="bg-[#F8F7F4] border border-[#17384F]/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#17384F] outline-none cursor-pointer hover:border-[#D9B77A] transition-all"
                      >
                        {ROOM_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            Set: {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(room)}
                        className="text-[11px] font-bold uppercase tracking-wider text-[#1E6F8E] hover:text-white bg-[#1E6F8E]/10 hover:bg-[#1E6F8E] border border-[#1E6F8E]/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(room._id)}
                        className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
  );
}
