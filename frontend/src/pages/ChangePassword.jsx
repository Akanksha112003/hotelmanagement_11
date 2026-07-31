import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { changePassword } from "../api/settings";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

const labelCls =
  "mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[#17384F]/70";
const inputCls =
  "w-full bg-[#F8F7F4] border border-[#17384F]/10 rounded-xl px-5 py-3 text-[#17384F] font-medium focus:border-[#D9B77A] focus:ring-1 focus:ring-[#D9B77A] outline-none transition-all text-sm pr-12";

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#17384F]/40 hover:text-[#17384F] transition-all"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrengthMeter({ password }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Contains number", pass: /\d/.test(password) },
    { label: "Contains special character", pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-[#1E6F8E]", "bg-emerald-600"];
  const textColors = ["text-red-600", "text-orange-600", "text-amber-600", "text-[#1E6F8E]", "text-emerald-600"];

  if (!password) return null;

  return (
    <div className="bg-[#F8F7F4] rounded-2xl p-4 border border-[#17384F]/5 space-y-3">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-[#17384F]/60 uppercase tracking-wider">Password Strength</span>
        <span className={textColors[score - 1] || "text-gray-400"}>
          {score > 0 ? levels[score - 1] : "Enter password"}
        </span>
      </div>
      {/* Segment Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              n <= score ? colors[score - 1] || "bg-gray-200" : "bg-[#17384F]/10"
            }`}
          />
        ))}
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {checks.map((c, i) => (
          <div key={i} className={`flex items-center gap-2 text-[11px] font-medium ${c.pass ? "text-emerald-700" : "text-[#17384F]/40"}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${c.pass ? "text-emerald-600" : "text-[#17384F]/20"}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("success", "Password changed successfully! Please use your new password to log in next time.");
    } catch (err) {
      setError(err.message || "Failed to change password.");
      showToast("error", err.message || "Failed to change password.");
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
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9B77A]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D9B77A]">Security Settings</p>
            <h2 className="text-[36px] md:text-[44px] font-light text-[#17384F] font-display tracking-tight leading-none">
              Change Password
            </h2>
            <p className="text-[16px] text-[#17384F]/60 font-medium max-w-2xl leading-relaxed mt-1">
              Keep your account secure with a strong, unique password. All sessions will remain active after the change.
            </p>
          </div>
        </div>

        {/* Security Tip Banner */}
        <div className="bg-[#1E6F8E]/10 border border-[#1E6F8E]/20 rounded-2xl px-6 py-4 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-[#1E6F8E] mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-[#17384F]/80 leading-relaxed">
            <strong>Security Tip:</strong> Use a minimum of 8 characters combining uppercase and lowercase letters, numbers, and special characters. Avoid using names, birthdays, or common words.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(23,56,79,0.04)] border border-[#17384F]/5 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#17384F]/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#17384F]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#17384F]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#17384F] font-display">Update Password</h3>
                <p className="text-xs text-[#17384F]/60">Enter your current password and choose a new secure password</p>
              </div>
            </div>

            <PasswordField
              label="Current Password *"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
            />

            <PasswordField
              label="New Password *"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="Enter a strong new password"
            />

            <PasswordStrengthMeter password={form.newPassword} />

            <PasswordField
              label="Confirm New Password *"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter your new password"
            />

            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4" /> Passwords do not match
              </div>
            )}

            {form.confirmPassword && form.newPassword === form.confirmPassword && form.confirmPassword.length >= 6 && (
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Passwords match
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || !form.currentPassword || !form.newPassword || form.newPassword !== form.confirmPassword}
                className="px-8 py-3 rounded-full bg-[#17384F] hover:bg-[#1E6F8E] text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#D9B77A]" />
                {saving ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
