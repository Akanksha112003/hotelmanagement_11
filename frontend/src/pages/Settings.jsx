import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getHotelProfile,
  updateHotelProfile,
  getRooms,
  addRoom,
  deleteRoom,
  getUsers,
  addUser,
  updateUserRole,
  deleteUser,
  changePassword,
} from "../api";

const BuildingIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>;
const BedIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>;
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

const TABS = [
  { key: "hotel", label: "Hotel Profile", icon: <BuildingIcon />, subtitle: "Manage property details" },
  { key: "rooms", label: "Rooms & Pricing", icon: <BedIcon />, subtitle: "Configure accommodation" },
  { key: "users", label: "Staff Access", icon: <UsersIcon />, subtitle: "Manage employee accounts" },
  { key: "password", label: "Security", icon: <LockIcon />, subtitle: "Update your password" },
];

function HotelProfileTab() {
  const empty = { name: "", address: "", city: "", country: "", phone: "", email: "", website: "", description: "", starRating: 5, checkInTime: "15:00", checkOutTime: "11:00", currency: "USD", taxRate: 0 };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getHotelProfile()
      .then((res) => setForm({ ...empty, ...res.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateHotelProfile(form);
      setMsg({ ok: true, text: "Property profile updated successfully." });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-[#17384F]/60 text-[14px]">Loading property data...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[#17384F]/5 pb-4">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Property Profile</h3>
        <p className="text-[#17384F]/50 text-[13px] mt-1">Configure your hotel's public facing information and operational parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2"><label className={labelCls}>Property Name</label><input value={form.name} onChange={set("name")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Star Rating</label><input type="number" min={1} max={5} value={form.starRating} onChange={set("starRating")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Address</label><input value={form.address} onChange={set("address")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>City</label><input value={form.city} onChange={set("city")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Country</label><input value={form.country} onChange={set("country")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Phone</label><input value={form.phone} onChange={set("phone")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={set("email")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Website URL</label><input value={form.website} onChange={set("website")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Check-In Time</label><input type="time" value={form.checkInTime} onChange={set("checkInTime")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Check-Out Time</label><input type="time" value={form.checkOutTime} onChange={set("checkOutTime")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Currency</label><input value={form.currency} onChange={set("currency")} className={inputCls} /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Tax Rate (%)</label><input type="number" value={form.taxRate} onChange={set("taxRate")} className={inputCls} /></div>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Description</label>
          <textarea rows={4} value={form.description} onChange={set("description")} className={`${inputCls} resize-none`} />
        </div>
        
        {msg && (
          <div className={`p-4 rounded-xl text-[13px] font-bold uppercase tracking-wider ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="bg-gradient-to-r from-[#D9B77A] to-[#c4a162] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(217,183,122,0.3)] transition-all disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RoomsTab() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ roomNumber: "", type: "single", pricePerNight: "", capacity: 1, status: "available" });
  const [error, setError] = useState("");

  const load = () => getRooms().then(d => setRooms(d.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault(); setError("");
    try {
      await addRoom(form);
      setForm({ roomNumber: "", type: "single", pricePerNight: "", capacity: 1, status: "available" });
      load();
    } catch(err) { setError(err.message); }
  };

  const del = async (id) => {
    if(!confirm("Remove room?")) return;
    try { await deleteRoom(id); load(); } catch(err) { setError(err.message); }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-[#17384F]/5 pb-4">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Accommodation</h3>
        <p className="text-[#17384F]/50 text-[13px] mt-1">Manage rooms, pricing, and current availability status.</p>
      </div>

      <div className="bg-[#F8F7F4] p-6 rounded-2xl border border-[#17384F]/5">
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-2"><label className={labelCls}>Room No.</label><input required value={form.roomNumber} onChange={e=>setForm({...form, roomNumber: e.target.value})} className={inputCls} placeholder="101" /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Type</label><select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className={inputCls}><option value="single">Single</option><option value="double">Double</option><option value="suite">Suite</option></select></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Price/Night</label><input required type="number" value={form.pricePerNight} onChange={e=>setForm({...form, pricePerNight: e.target.value})} className={inputCls} placeholder="250" /></div>
          <div className="flex flex-col gap-2"><label className={labelCls}>Capacity</label><input required type="number" min={1} value={form.capacity} onChange={e=>setForm({...form, capacity: e.target.value})} className={inputCls} placeholder="2" /></div>
          <button type="submit" className="bg-[#17384F] text-white px-4 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#1E6F8E] transition-all">Add Room</button>
        </form>
        {error && <div className="mt-4 text-red-600 text-[13px]">{error}</div>}
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#17384F]/10">
            <th className={thCls}>Room</th>
            <th className={thCls}>Type</th>
            <th className={thCls}>Capacity</th>
            <th className={thCls}>Price</th>
            <th className={thCls}>Status</th>
            <th className={`${thCls} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#17384F]/5">
          {loading ? <tr><td colSpan="6" className="py-8 text-center text-[#17384F]/40">Loading...</td></tr> : 
           rooms.map(r => (
            <tr key={r._id} className="hover:bg-[#F8F7F4]/50">
              <td className="px-6 py-4 font-bold text-[#17384F]">{r.roomNumber}</td>
              <td className="px-6 py-4 capitalize text-[#17384F]/70">{r.type}</td>
              <td className="px-6 py-4 text-[#17384F]/70">{r.capacity} Guests</td>
              <td className="px-6 py-4 font-mono">${r.pricePerNight}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${r.status==='available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{r.status}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={()=>del(r._id)} className="text-red-500 hover:text-red-700 text-[12px] font-bold uppercase tracking-widest">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const load = () => getUsers().then(d => setUsers(d.data || [])).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if(!confirm("Remove user?")) return;
    await deleteUser(id); load();
  };

  const role = async (id, r) => {
    await updateUserRole(id, r); load();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-[#17384F]/5 pb-4">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Staff Directory</h3>
        <p className="text-[#17384F]/50 text-[13px] mt-1">Manage employee access levels and system privileges.</p>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#17384F]/10">
            <th className={thCls}>Name</th>
            <th className={thCls}>Email</th>
            <th className={thCls}>Role</th>
            <th className={`${thCls} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#17384F]/5">
          {loading ? <tr><td colSpan="4" className="py-8 text-center text-[#17384F]/40">Loading...</td></tr> : 
           users.map(u => (
            <tr key={u._id} className="hover:bg-[#F8F7F4]/50">
              <td className="px-6 py-4 font-bold text-[#17384F]">{u.name}</td>
              <td className="px-6 py-4 text-[#17384F]/70">{u.email}</td>
              <td className="px-6 py-4">
                <select value={u.role} onChange={(e)=>role(u._id, e.target.value)} className="bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none border border-[#17384F]/10 rounded-lg px-2 py-1">
                  <option value="user">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={()=>del(u._id)} className="text-red-500 hover:text-red-700 text-[12px] font-bold uppercase tracking-widest">Revoke Access</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChangePasswordTab() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      await changePassword(form);
      setMsg({ ok: true, text: "Password updated successfully." });
      setForm({ oldPassword: "", newPassword: "" });
    } catch(err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div className="border-b border-[#17384F]/5 pb-4">
        <h3 className="text-[20px] font-bold text-[#17384F] font-display">Security Settings</h3>
        <p className="text-[#17384F]/50 text-[13px] mt-1">Update your account password.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>Current Password</label>
          <input type="password" required value={form.oldPassword} onChange={e=>setForm({...form, oldPassword: e.target.value})} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>New Password</label>
          <input type="password" required value={form.newPassword} onChange={e=>setForm({...form, newPassword: e.target.value})} className={inputCls} />
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-[13px] font-bold uppercase tracking-wider ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <div>
          <button type="submit" disabled={loading} className="bg-[#17384F] text-white px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#1E6F8E] transition-all disabled:opacity-50 mt-4">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("hotel");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#17384F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              System Configuration
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Settings & Preferences
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Configure hotel parameters, manage rooms, control access permissions, and update security.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Vertical Tabs Navigation */}
          <div className="w-full lg:w-[280px] shrink-0 bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(23,56,79,0.02)] border border-[#17384F]/5 flex flex-col gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                  activeTab === t.key
                    ? "bg-[#17384F] shadow-[0_8px_20px_rgb(23,56,79,0.2)] scale-[1.02]"
                    : "hover:bg-[#F8F7F4] hover:scale-[1.01]"
                }`}
              >
                <div className={`shrink-0 transition-colors duration-300 ${activeTab === t.key ? "text-[#D9B77A]" : "text-[#17384F]/40"}`}>
                  {t.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[13px] font-bold uppercase tracking-widest transition-colors duration-300 ${activeTab === t.key ? "text-white" : "text-[#17384F]"}`}>
                    {t.label}
                  </span>
                  <span className={`text-[11px] transition-colors duration-300 ${activeTab === t.key ? "text-white/60" : "text-[#17384F]/40"}`}>
                    {t.subtitle}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 w-full bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.02)] border border-[#17384F]/5 min-h-[500px]">
            {activeTab === "hotel" && <HotelProfileTab />}
            {activeTab === "rooms" && <RoomsTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "password" && <ChangePasswordTab />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const labelCls = "text-[11px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls = "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all";
const thCls = "px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#17384F]/50";
