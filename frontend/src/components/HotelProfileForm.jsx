import React, { useState, useEffect } from "react";
import LogoUploader from "./LogoUploader";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Clock,
  DollarSign,
  Share2,
  Save,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

export default function HotelProfileForm({ profileData, onSave, saving, error }) {
  const [form, setForm] = useState(profileData);
  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(profileData);
    setIsDirty(false);
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("social_")) {
      const field = name.replace("social_", "");
      setForm((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setIsDirty(true);
  };

  const handleLogoChange = (newLogoUrl) => {
    setForm((prev) => ({ ...prev, logo: newLogoUrl }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setForm(profileData);
    setIsDirty(false);
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name || !form.name.trim()) {
      setFormError("Hotel Name is required.");
      return;
    }

    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Unsaved Changes Warning Banner */}
      {isDirty && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved changes in your hotel profile. Remember to click "Save Changes".</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-amber-900 font-bold underline hover:text-amber-950 ml-4"
          >
            Discard Changes
          </button>
        </div>
      )}

      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-xs font-medium">
          {formError || error}
        </div>
      )}

      {/* ── Section 1: Logo & General Branding ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#17384F]/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#17384F]/10 text-[#17384F] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#17384F] font-display">General & Branding</h3>
            <p className="text-xs text-[#17384F]/60">Hotel name, logo, and public description</p>
          </div>
        </div>

        {/* Logo Uploader */}
        <LogoUploader logoUrl={form.logo || ""} onChange={handleLogoChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Hotel Name */}
          <div className="md:col-span-2">
            <label className={labelCls}>Hotel / Resort Name *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name || ""}
              onChange={handleChange}
              placeholder="e.g. THE AURELIA GRAND"
              className={inputCls}
            />
          </div>

          {/* Hotel Description */}
          <div className="md:col-span-2">
            <label className={labelCls}>Public Description & Overview</label>
            <textarea
              name="description"
              rows="3"
              value={form.description || ""}
              onChange={handleChange}
              placeholder="Describe your property, guest experience, luxury amenities..."
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Contact & Location ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#17384F]/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#17384F]/10 text-[#17384F] flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#17384F] font-display">Contact & Location</h3>
            <p className="text-xs text-[#17384F]/60">Physical address, email, phone number, and website</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Address */}
          <div className="md:col-span-2">
            <label className={labelCls}>Street Address</label>
            <input
              type="text"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="e.g. 100 Hospitality Blvd, Ocean View Drive"
              className={inputCls}
            />
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text"
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              placeholder="e.g. Miami"
              className={inputCls}
            />
          </div>

          {/* State */}
          <div>
            <label className={labelCls}>State / Province</label>
            <input
              type="text"
              name="state"
              value={form.state || ""}
              onChange={handleChange}
              placeholder="e.g. Florida"
              className={inputCls}
            />
          </div>

          {/* Country */}
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text"
              name="country"
              value={form.country || ""}
              onChange={handleChange}
              placeholder="e.g. United States"
              className={inputCls}
            />
          </div>

          {/* ZIP Code */}
          <div>
            <label className={labelCls}>ZIP / PIN Code</label>
            <input
              type="text"
              name="zipCode"
              value={form.zipCode || ""}
              onChange={handleChange}
              placeholder="e.g. 33139"
              className={inputCls}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="e.g. +1 (800) 555-HOTEL"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Official Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="e.g. contact@azurecoastresort.com"
              className={inputCls}
            />
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label className={labelCls}>Website URL</label>
            <input
              type="url"
              name="website"
              value={form.website || ""}
              onChange={handleChange}
              placeholder="e.g. https://azurecoastresort.com"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Operations & Tax ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#17384F]/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#17384F]/10 text-[#17384F] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#17384F] font-display">Operational & Tax Configuration</h3>
            <p className="text-xs text-[#17384F]/60">GST/Tax ID, default currency, time zone, check-in/out schedules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tax Number */}
          <div>
            <label className={labelCls}>GST / Tax Registration ID</label>
            <input
              type="text"
              name="taxNumber"
              value={form.taxNumber || ""}
              onChange={handleChange}
              placeholder="e.g. TX-882901 / GSTIN 22AAAAA0000A1Z5"
              className={inputCls}
            />
          </div>

          {/* Currency */}
          <div>
            <label className={labelCls}>Default Currency</label>
            <select
              name="currency"
              value={form.currency || "USD"}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="CAD">CAD ($ - Canadian Dollar)</option>
              <option value="AUD">AUD ($ - Australian Dollar)</option>
              <option value="AED">AED (Dh - UAE Dirham)</option>
            </select>
          </div>

          {/* Time Zone */}
          <div>
            <label className={labelCls}>Property Time Zone</label>
            <select
              name="timeZone"
              value={form.timeZone || "America/New_York"}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Central European Time (CET)</option>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
            </select>
          </div>

          {/* Check-In Time */}
          <div>
            <label className={labelCls}>Standard Check-In Time</label>
            <input
              type="time"
              name="checkInTime"
              value={form.checkInTime || "14:00"}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Check-Out Time */}
          <div>
            <label className={labelCls}>Standard Check-Out Time</label>
            <input
              type="time"
              name="checkOutTime"
              value={form.checkOutTime || "12:00"}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Social Media Links ── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#17384F]/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#17384F]/10 text-[#17384F] flex items-center justify-center font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#17384F] font-display">Social Media & Public Channels</h3>
            <p className="text-xs text-[#17384F]/60">Social handles and official links</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Facebook */}
          <div>
            <label className={labelCls}>Facebook Page URL</label>
            <input
              type="url"
              name="social_facebook"
              value={form.socialMedia?.facebook || ""}
              onChange={handleChange}
              placeholder="https://facebook.com/azurecoast"
              className={inputCls}
            />
          </div>

          {/* Instagram */}
          <div>
            <label className={labelCls}>Instagram Profile URL</label>
            <input
              type="url"
              name="social_instagram"
              value={form.socialMedia?.instagram || ""}
              onChange={handleChange}
              placeholder="https://instagram.com/azurecoast"
              className={inputCls}
            />
          </div>

          {/* X / Twitter */}
          <div>
            <label className={labelCls}>X / Twitter Handle</label>
            <input
              type="url"
              name="social_twitter"
              value={form.socialMedia?.twitter || ""}
              onChange={handleChange}
              placeholder="https://x.com/azurecoast"
              className={inputCls}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className={labelCls}>LinkedIn Company Page</label>
            <input
              type="url"
              name="social_linkedin"
              value={form.socialMedia?.linkedin || ""}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/azurecoast"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#17384F]/5 shadow-sm flex items-center justify-end gap-3 sticky bottom-6 z-30">
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
          {saving ? "Saving Changes..." : "Save Hotel Profile"}
        </button>
      </div>
    </form>
  );
}
