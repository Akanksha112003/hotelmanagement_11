import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getRoomSettings, updateRoomSettings } from "../api/settings";
import {
  Home,
  DollarSign,
  Wifi,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Settings,
} from "lucide-react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-4 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] outline-none transition-all text-sm";

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 space-y-6">
    <div className="flex items-center gap-3 border-b border-[#17384F]/5 pb-4">
      <div className="w-10 h-10 rounded-2xl bg-[#17384F]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#17384F]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#17384F] font-display">{title}</h3>
        {subtitle && <p className="text-xs text-[#17384F]/60">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

export default function RoomSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState(null);

  const defaultSettings = {
    roomTypes: [],
    amenities: [],
    defaultTaxRate: 12,
    occupancyLimits: { min: 1, max: 10 },
    roomPolicies: {
      checkInPolicy: "",
      cancellationPolicy: "",
      smokingPolicy: "",
      petPolicy: "",
    },
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [original, setOriginal] = useState(null);
  const [newAmenity, setNewAmenity] = useState("");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await getRoomSettings();
      const data = res.data || defaultSettings;
      setSettings(data);
      setOriginal(data);
    } catch {
      setError("Failed to load room settings.");
    } finally {
      setLoading(false);
    }
  }

  const markDirty = () => setIsDirty(true);

  const handleTypeChange = (idx, field, val) => {
    const types = [...settings.roomTypes];
    types[idx] = { ...types[idx], [field]: val };
    setSettings((s) => ({ ...s, roomTypes: types }));
    markDirty();
  };

  const addRoomType = () => {
    setSettings((s) => ({
      ...s,
      roomTypes: [
        ...s.roomTypes,
        { type: "", displayName: "", defaultPrice: 100, capacity: 2, description: "" },
      ],
    }));
    markDirty();
  };

  const removeRoomType = (idx) => {
    setSettings((s) => ({
      ...s,
      roomTypes: s.roomTypes.filter((_, i) => i !== idx),
    }));
    markDirty();
  };

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    setSettings((s) => ({
      ...s,
      amenities: [...(s.amenities || []), newAmenity.trim()],
    }));
    setNewAmenity("");
    markDirty();
  };

  const removeAmenity = (idx) => {
    setSettings((s) => ({
      ...s,
      amenities: s.amenities.filter((_, i) => i !== idx),
    }));
    markDirty();
  };

  const handlePolicyChange = (key, val) => {
    setSettings((s) => ({
      ...s,
      roomPolicies: { ...s.roomPolicies, [key]: val },
    }));
    markDirty();
  };

  const handleReset = () => {
    if (original) {
      setSettings(original);
      setIsDirty(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await updateRoomSettings(settings);
      setOriginal(res.data || settings);
      setIsDirty(false);
      showToast("success", "Room settings saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save room settings.");
      showToast("error", err.message || "Failed to save room settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-10 relative">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fadeIn ${
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
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Accommodation Configuration</p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Room Settings
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Manage room type definitions, default pricing, amenities, occupancy limits, and room policies.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold">✕</button>
          </div>
        )}

        {isDirty && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>⚠ You have unsaved changes in room settings.</span>
            <button onClick={handleReset} className="underline font-bold">Discard Changes</button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#17384F]/5 shadow-sm">
            <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-semibold text-sm">
              <div className="w-5 h-5 border-2 border-[#1E6F8E] border-t-transparent rounded-full animate-spin" />
              Loading room settings…
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Room Types */}
            <SectionCard icon={Home} title="Room Types & Pricing" subtitle="Define room categories, display names, default prices, and capacity">
              <div className="space-y-4">
                {(settings.roomTypes || []).map((rt, idx) => (
                  <div key={idx} className="bg-[#F8F7F4] p-5 rounded-2xl border border-[#17384F]/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17384F]/60 uppercase tracking-widest">Room Type #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeRoomType(idx)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-xs font-bold uppercase"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className={labelCls}>Type ID</label>
                        <input type="text" value={rt.type} onChange={(e) => handleTypeChange(idx, "type", e.target.value)} className={inputCls} placeholder="e.g. suite" />
                      </div>
                      <div>
                        <label className={labelCls}>Display Name</label>
                        <input type="text" value={rt.displayName} onChange={(e) => handleTypeChange(idx, "displayName", e.target.value)} className={inputCls} placeholder="e.g. Executive Suite" />
                      </div>
                      <div>
                        <label className={labelCls}>Default Price ($)</label>
                        <input type="number" min="0" value={rt.defaultPrice} onChange={(e) => handleTypeChange(idx, "defaultPrice", Number(e.target.value))} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Max Capacity</label>
                        <input type="number" min="1" value={rt.capacity} onChange={(e) => handleTypeChange(idx, "capacity", Number(e.target.value))} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <input type="text" value={rt.description} onChange={(e) => handleTypeChange(idx, "description", e.target.value)} className={inputCls} placeholder="Brief room description" />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRoomType}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-[#17384F]/20 text-[#17384F]/50 hover:border-[#D9B77A] hover:text-[#D9B77A] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Room Type
                </button>
              </div>
            </SectionCard>

            {/* Tax & Occupancy */}
            <SectionCard icon={DollarSign} title="Tax & Occupancy Limits" subtitle="Configure default tax rate and guest occupancy boundaries">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Default Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.defaultTaxRate || 12}
                    onChange={(e) => { setSettings((s) => ({ ...s, defaultTaxRate: Number(e.target.value) })); markDirty(); }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Min Occupancy</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.occupancyLimits?.min || 1}
                    onChange={(e) => { setSettings((s) => ({ ...s, occupancyLimits: { ...s.occupancyLimits, min: Number(e.target.value) } })); markDirty(); }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Occupancy</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.occupancyLimits?.max || 10}
                    onChange={(e) => { setSettings((s) => ({ ...s, occupancyLimits: { ...s.occupancyLimits, max: Number(e.target.value) } })); markDirty(); }}
                    className={inputCls}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Amenities */}
            <SectionCard icon={Wifi} title="Property Amenities" subtitle="Manage the list of available room and property amenities">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                  placeholder="Type an amenity and press Enter or click Add"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-5 py-3 rounded-xl bg-[#17384F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E6F8E] transition-all flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(settings.amenities || []).map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#F8F7F4] border border-[#17384F]/10 px-3 py-2 rounded-xl text-xs font-semibold text-[#17384F]">
                    {a}
                    <button type="button" onClick={() => removeAmenity(idx)} className="text-red-400 hover:text-red-600 ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!settings.amenities || settings.amenities.length === 0) && (
                  <p className="text-xs text-[#17384F]/40 py-2">No amenities listed yet. Add some above.</p>
                )}
              </div>
            </SectionCard>

            {/* Room Policies */}
            <SectionCard icon={FileText} title="Room Policies" subtitle="Define check-in, cancellation, smoking, and pet policies displayed to guests">
              <div className="space-y-4">
                {[
                  { key: "checkInPolicy", label: "Check-In Policy" },
                  { key: "cancellationPolicy", label: "Cancellation Policy" },
                  { key: "smokingPolicy", label: "Smoking Policy" },
                  { key: "petPolicy", label: "Pet Policy" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <textarea
                      rows={2}
                      value={settings.roomPolicies?.[key] || ""}
                      onChange={(e) => handlePolicyChange(key, e.target.value)}
                      className={`${inputCls} resize-none`}
                      placeholder={`Enter ${label.toLowerCase()}…`}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Actions */}
            <div className="bg-white p-6 rounded-3xl border border-[#17384F]/5 shadow-sm flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || saving}
                className="px-6 py-3 rounded-full border border-[#17384F]/20 text-[#17384F] text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-full bg-[#17384F] hover:bg-[#1E6F8E] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#D9B77A]" />
                {saving ? "Saving..." : "Save Room Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
