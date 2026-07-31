import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getMyProfile, updateMyProfile } from "../api/settings";
import { saveAuth, getUser } from "../utils/auth";
import {
  User,
  Mail,
  Phone,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Bell,
  Smartphone,
  Moon,
} from "lucide-react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

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

export default function UserProfile() {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profilePicture: "",
    preferences: {
      emailNotifications: true,
      smsAlerts: false,
      darkMode: false,
    },
  });
  const [original, setOriginal] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await getMyProfile();
      const data = res.data || {};
      const loaded = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || "",
        preferences: {
          emailNotifications: data.preferences?.emailNotifications ?? true,
          smsAlerts: data.preferences?.smsAlerts ?? false,
          darkMode: data.preferences?.darkMode ?? false,
        },
      };
      setForm(loaded);
      setOriginal(loaded);
    } catch {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setIsDirty(true);
  };

  const handlePrefChange = (key, value) => {
    setForm((f) => ({
      ...f,
      preferences: { ...f.preferences, [key]: value },
    }));
    setIsDirty(true);
  };

  const handlePhotoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("profilePicture", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (original) {
      setForm(original);
      setIsDirty(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await updateMyProfile(form);
      const updatedUser = res.data || {};
      // Sync localStorage so Header reflects name changes
      const currentUser = getUser() || {};
      saveAuth({ user: { ...currentUser, ...updatedUser } });
      setOriginal(form);
      setIsDirty(false);
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to save profile.");
      showToast("error", err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

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
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">
              Account Management
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              My Profile
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Update your personal information, upload a profile photo, and configure account preferences.
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
            <span>⚠ You have unsaved changes in your profile.</span>
            <button onClick={handleReset} className="underline font-bold">Discard</button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#17384F]/5 shadow-sm">
            <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-semibold text-sm">
              <div className="w-5 h-5 border-2 border-[#1E6F8E] border-t-transparent rounded-full animate-spin" />
              Loading profile…
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Avatar + Basic Info */}
            <SectionCard icon={User} title="Identity & Photo" subtitle="Your public profile displayed across the system">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-[#F8F7F4] p-5 rounded-2xl border border-[#17384F]/10">
                {/* Avatar Preview */}
                <div className="w-24 h-24 rounded-2xl bg-[#17384F] border-2 border-[#D9B77A]/40 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                  {form.profilePicture ? (
                    <img
                      src={form.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-bold text-[#D9B77A] font-display">
                      {initials}
                    </span>
                  )}
                </div>
                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#17384F]">Profile Photo</h4>
                    <p className="text-xs text-[#17384F]/60">Upload a PNG, JPG (recommended 400×400px)</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input type="file" ref={fileRef} onChange={handlePhotoFile} accept="image/*" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#17384F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#1E6F8E] transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D9B77A]" /> Upload Photo
                    </button>
                    {form.profilePicture && (
                      <button
                        type="button"
                        onClick={() => handleChange("profilePicture", "")}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-red-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Akanksha Gupta"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. akanksha@hotel.com"
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Preferences */}
            <SectionCard icon={Bell} title="Notification Preferences" subtitle="Manage how you receive system alerts and updates">
              <div className="space-y-4">
                {[
                  { key: "emailNotifications", icon: Mail, label: "Email Notifications", desc: "Receive important system alerts and updates via email" },
                  { key: "smsAlerts", icon: Smartphone, label: "SMS Alerts", desc: "Get critical booking and guest alerts via SMS" },
                  { key: "darkMode", icon: Moon, label: "Dark Mode Preference", desc: "Preference saved to your profile (theme applied where supported)" },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F7F4] border border-[#17384F]/5">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#17384F]/60" />
                      <div>
                        <p className="text-sm font-bold text-[#17384F]">{label}</p>
                        <p className="text-xs text-[#17384F]/50">{desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrefChange(key, !form.preferences[key])}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${
                        form.preferences[key] ? "bg-[#17384F]" : "bg-[#17384F]/20"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          form.preferences[key] ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
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
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
