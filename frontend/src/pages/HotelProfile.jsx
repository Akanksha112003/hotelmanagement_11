import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import HotelProfileForm from "../components/HotelProfileForm";
import { saveHotelProfile } from "../api/hotelProfile";
import { useHotelProfile } from "../context/HotelProfileContext";
import { Building2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function HotelProfile() {
  const { profile, loading: fetchingProfile, refreshProfile, updateProfileState } = useHotelProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const res = await saveHotelProfile(formData);
      if (res.data) {
        updateProfileState(res.data);
      }
      showToast("success", res.message || "Hotel Profile updated successfully!");
      await refreshProfile();
    } catch (err) {
      setError(err.message || "Failed to save hotel profile.");
      showToast("error", err.message || "Failed to save hotel profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:gap-10 relative">
        {/* Toast Notification */}
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
              System Property Configuration
            </p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Hotel Profile Settings
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Configure hotel identity, brand logo, contact details, tax numbers, check-in schedules, and public channels.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={refreshProfile}
              disabled={fetchingProfile}
              className="p-3 rounded-full bg-[#F8F7F4] hover:bg-[#17384F]/10 text-[#17384F] transition-all disabled:opacity-50 border border-[#17384F]/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw className={`w-4 h-4 ${fetchingProfile ? "animate-spin" : ""}`} />
              Reload Profile
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

        {/* Form Body */}
        {fetchingProfile ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-[#17384F]/5">
            <div className="inline-flex items-center gap-3 text-[#17384F]/60 font-semibold text-sm">
              <div className="w-5 h-5 rounded-full border-2 border-[#1E6F8E] border-t-transparent animate-spin" />
              Loading property profile details...
            </div>
          </div>
        ) : (
          <HotelProfileForm
            profileData={profile}
            onSave={handleSaveProfile}
            saving={saving}
            error={error}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
