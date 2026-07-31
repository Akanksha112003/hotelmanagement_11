import { useState } from "react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm";

const ID_TYPES = [
  { value: "nationalId", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "driverLicense", label: "Driver License" },
  { value: "other", label: "Other" },
];

export default function AddGuestModal({ onClose, onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    nationality: "",
    gender: "",
    dateOfBirth: "",
    idProofType: "nationalId",
    idProofNumber: "",
    emergencyContact: "",
    notes: "",
  });

  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (!form.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!form.idProofNumber.trim()) {
      setFormError("ID proof number is required.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17384F]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#17384F]/10 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#17384F] text-white p-6 md:p-8 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Guest Profile</span>
            <h3 className="text-2xl font-light font-display">Add New Guest</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-xs font-medium">
              {formError || error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
                className={inputCls}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={labelCls}>Phone Number *</label>
              <input
                type="text"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555-0192"
                className={inputCls}
              />
            </div>

            {/* Nationality */}
            <div>
              <label className={labelCls}>Nationality</label>
              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                placeholder="e.g. Canadian"
                className={inputCls}
              />
            </div>

            {/* ID Proof Type */}
            <div>
              <label className={labelCls}>ID Proof Type *</label>
              <select
                name="idProofType"
                value={form.idProofType}
                onChange={handleChange}
                className={inputCls}
              >
                {ID_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Proof Number */}
            <div>
              <label className={labelCls}>ID Proof Number *</label>
              <input
                type="text"
                name="idProofNumber"
                required
                value={form.idProofNumber}
                onChange={handleChange}
                placeholder="A12345678"
                className={inputCls}
              />
            </div>

            {/* Gender */}
            <div>
              <label className={labelCls}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <label className={labelCls}>Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              placeholder="Name & Phone (e.g. Mark Jenkins - +1 555-0193)"
              className={inputCls}
            />
          </div>

          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <textarea
              name="address"
              rows="2"
              value={form.address}
              onChange={handleChange}
              placeholder="Full physical address..."
              className={inputCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes & Special Preferences</label>
            <textarea
              name="notes"
              rows="2"
              value={form.notes}
              onChange={handleChange}
              placeholder="Allergies, high floor request, VIP notes..."
              className={inputCls}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#17384F]/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-[#17384F]/20 text-[#17384F] text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-full bg-[#17384F] hover:bg-[#1E6F8E] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Saving Guest..." : "Add Guest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
