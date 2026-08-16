import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, forgotPassword } from "../api";
import { saveAuth, isAuthenticated } from "../utils/auth";

// ─── Password strength helper ───────────────────────────────────────────────
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",   color: "#f97316" };
  if (score <= 3) return { score, label: "Good",   color: "#eab308" };
  if (score <= 4) return { score, label: "Strong", color: "#22c55e" };
  return              { score, label: "Very Strong", color: "#16a34a" };
}

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  // ── Login state ──
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Forgot-password modal state ──
  const [showForgot, setShowForgot] = useState(false);
  const [fpStep,        setFpStep]        = useState("email");
  const [fpEmail,       setFpEmail]       = useState("");
  const [fpNew,         setFpNew]         = useState("");
  const [fpConfirm,     setFpConfirm]     = useState("");
  const [showFpNew,     setShowFpNew]     = useState(false);
  const [showFpConfirm, setShowFpConfirm] = useState(false);
  const [fpError,       setFpError]       = useState("");
  const [fpLoading,     setFpLoading]     = useState(false);
  const [fpToast,       setFpToast]       = useState(null);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // ── Login submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim())           { setError("Email address is required."); return; }
    if (!validateEmail(email.trim())) { setError("Please enter a valid email address."); return; }
    if (!password)               { setError("Password is required."); return; }
    if (password.length < 6)    { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    login({ email: email.trim(), password })
      .then(data => {
        saveAuth({ token: data.token, user: data.user });
        setLoading(false);
        setShowSuccess(true);
        navigate("/dashboard", { replace: true });
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || "Login failed. Please check your credentials.");
      });
  };

  // ── Open / close modal helpers ──
  const openForgotModal = () => {
    setFpStep("email");
    setFpEmail("");
    setFpNew("");
    setFpConfirm("");
    setFpError("");
    setFpToast(null);
    setShowForgot(true);
  };
  const closeForgotModal = () => { setShowForgot(false); setFpError(""); };

  const showFpToast = (type, msg) => {
    setFpToast({ type, msg });
    setTimeout(() => setFpToast(null), 4000);
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setFpError("");
    if (!fpEmail.trim())            { setFpError("Email is required."); return; }
    if (!validateEmail(fpEmail.trim())) { setFpError("Enter a valid email address."); return; }
    setFpStep("reset");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFpError("");
    if (!fpNew)             { setFpError("New password is required."); return; }
    if (fpNew.length < 6)   { setFpError("Password must be at least 6 characters."); return; }
    if (fpNew !== fpConfirm){ setFpError("Passwords do not match."); return; }

    const strength = getPasswordStrength(fpNew);
    if (strength.score < 2) {
      setFpError("Password is too weak. Use at least 6 characters including uppercase and numbers.");
      return;
    }

    setFpLoading(true);
    try {
      await forgotPassword({ email: fpEmail.trim().toLowerCase(), newPassword: fpNew });
      setFpLoading(false);
      showFpToast("success", "Password reset successfully! You can now log in.");
      setTimeout(() => closeForgotModal(), 2200);
    } catch (err) {
      setFpLoading(false);
      const msg = err.message || "Password reset failed.";
      setFpError(msg);
    }
  };

  const pwdStrength = getPasswordStrength(fpNew);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-end overflow-hidden bg-[#263B32]">
      {/* Full-Page Background Luxury Coastal Image */}
      <img
        src="/aurelia_coastal_resort.png"
        alt="The Aurelia Grand Resort"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        draggable={false}
      />

      {/* Dark Forest Green Subtle Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#263B32]/90 via-[#263B32]/65 to-[#263B32]/45 z-10 pointer-events-none" />

      {/* ═══════════════════════════════════
          LEFT SIDE — Heritage Hero Text (Desktop)
      ═══════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-center absolute left-12 lg:left-24 top-0 bottom-0 max-w-xl z-20 space-y-6 text-white">
        <div className="inline-flex items-center gap-3 bg-[#263B32]/80 backdrop-blur-md border border-[#A38A5A]/40 px-4 py-1.5 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-[#A38A5A]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#F5F1E8]">
            THE AURELIA GRAND
          </span>
        </div>

        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-normal font-display tracking-tight leading-none text-[#F5F1E8]">
          Classic Hospitality.<br />
          <span className="italic font-light text-[#A38A5A]">Modern Excellence.</span>
        </h1>

        <p className="text-base text-[#F5F1E8]/80 font-sans leading-relaxed max-w-md">
          Executive hospitality management portal for luxury hotel operations, guest services, and real-time ledger controls.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 max-w-md">
          <div className="flex items-center gap-3 text-xs font-semibold text-[#F5F1E8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A38A5A]" />
            <span>Smart Reservations</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#F5F1E8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A38A5A]" />
            <span>Guest Services</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#F5F1E8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A38A5A]" />
            <span>Revenue Analytics</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#F5F1E8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A38A5A]" />
            <span>Housekeeping Ledger</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          RIGHT SIDE — Refined Ivory Login Panel
      ═══════════════════════════════════ */}
      <div className="relative z-20 w-full max-w-md mx-4 sm:mx-8 lg:mr-24 my-8">
        <div className="bg-[#F5F1E8]/95 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl border border-[#4A3529]/15 flex flex-col gap-6">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 bg-[#263B32] text-white px-4 py-1.5 rounded-full border border-[#A38A5A]/30 mb-2">
              <LogoIcon />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A38A5A]">THE AURELIA GRAND</span>
            </div>
            <h2 className="text-3xl font-normal font-display text-[#292824]">
              WELCOME BACK
            </h2>
            <p className="text-xs text-[#78806B] font-semibold uppercase tracking-wider">
              Access your management portal
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs font-medium flex items-center gap-2">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#4A3529]" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="manager@aureliagrand.com"
                className="w-full bg-white border border-[#263B32]/15 rounded-lg px-4 py-3 text-sm text-[#292824] placeholder-[#292824]/40 outline-none focus:border-[#A38A5A] focus:ring-1 focus:ring-[#A38A5A] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#4A3529]" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-trigger"
                  className="text-xs font-semibold text-[#A38A5A] hover:text-[#4A3529] underline transition-colors"
                  onClick={openForgotModal}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#263B32]/15 rounded-lg px-4 py-3 text-sm text-[#292824] placeholder-[#292824]/40 outline-none focus:border-[#A38A5A] focus:ring-1 focus:ring-[#A38A5A] transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#263B32]/50 hover:text-[#263B32]"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#A38A5A] hover:bg-[#8C7447] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "AUTHENTICATING..." : "SIGN IN TO PORTAL"}
              </button>
            </div>

          </form>

          {/* Register Link */}
          <div className="text-center pt-2 border-t border-[#4A3529]/10">
            <span className="text-xs text-[#78806B]">New to The Aurelia Grand? </span>
            <Link to="/register" className="text-xs font-bold text-[#263B32] hover:text-[#A38A5A] underline">
              Create workspace
            </Link>
          </div>

        </div>
      </div>

      {/* ── Login Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-[#263B32]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F5F1E8] rounded-2xl max-w-sm w-full p-8 text-center space-y-4 shadow-2xl border border-[#A38A5A]/30">
            <div className="w-14 h-14 rounded-full bg-[#263B32] text-[#A38A5A] flex items-center justify-center mx-auto">
              <CheckIcon />
            </div>
            <h2 className="text-2xl font-normal font-display text-[#292824]">Login Successful</h2>
            <p className="text-xs text-[#78806B]">Welcome back to The Aurelia Grand.</p>
            <button
              type="button"
              className="w-full bg-[#263B32] hover:bg-[#1c2c25] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
              onClick={() => { setShowSuccess(false); navigate("/dashboard", { replace: true }); }}
            >
              CONTINUE TO DASHBOARD
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          FORGOT PASSWORD MODAL
      ════════════════════════════════════════════════════ */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-[#263B32]/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeForgotModal(); }}>
          <div className="bg-[#F5F1E8] rounded-2xl max-w-md w-full p-8 shadow-2xl border border-[#A38A5A]/30 space-y-5 relative">

            {/* Toast */}
            {fpToast && (
              <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${fpToast.type === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-red-50 border-red-300 text-red-800"}`}>
                {fpToast.type === "success" ? <CheckIcon /> : <ErrorIcon />}
                <span>{fpToast.msg}</span>
              </div>
            )}

            {/* Close button */}
            <button type="button" className="absolute top-4 right-4 text-[#263B32]/60 hover:text-[#263B32]" onClick={closeForgotModal} aria-label="Close">
              <CloseIcon />
            </button>

            {/* Lock icon header */}
            <div className="w-14 h-14 rounded-full bg-[#263B32] text-[#A38A5A] flex items-center justify-center mx-auto">
              <LockIcon />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-normal font-display text-[#292824]">Reset Password</h2>
              <p className="text-xs text-[#78806B]">
                {fpStep === "email"
                  ? "Enter your registered email address to continue."
                  : `Set a new password for ${fpEmail}.`}
              </p>
            </div>

            {fpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-medium">
                {fpError}
              </div>
            )}

            {/* Step 1: Enter email */}
            {fpStep === "email" && (
              <form onSubmit={handleVerifyEmail} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#4A3529]" htmlFor="fp-email">Registered Email</label>
                  <input
                    id="fp-email"
                    type="email"
                    value={fpEmail}
                    onChange={(e) => { setFpEmail(e.target.value); setFpError(""); }}
                    placeholder="manager@aureliagrand.com"
                    className="w-full bg-white border border-[#263B32]/15 rounded-lg px-4 py-3 text-sm text-[#292824] outline-none"
                    autoFocus
                  />
                </div>
                <button id="fp-continue-btn" type="submit" className="w-full bg-[#A38A5A] hover:bg-[#8C7447] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm">
                  CONTINUE
                </button>
              </form>
            )}

            {/* Step 2: New password */}
            {fpStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#4A3529]" htmlFor="fp-new-pwd">New Password</label>
                  <div className="relative">
                    <input
                      id="fp-new-pwd"
                      type={showFpNew ? "text" : "password"}
                      value={fpNew}
                      onChange={(e) => { setFpNew(e.target.value); setFpError(""); }}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#263B32]/15 rounded-lg px-4 py-3 text-sm text-[#292824] outline-none pr-10"
                      autoFocus
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#263B32]/50" onClick={() => setShowFpNew(v => !v)}>
                      <EyeIcon open={showFpNew} />
                    </button>
                  </div>
                  {fpNew && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded ${i <= pwdStrength.score ? "bg-[#A38A5A]" : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-[#A38A5A]">{pwdStrength.label}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#4A3529]" htmlFor="fp-confirm-pwd">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="fp-confirm-pwd"
                      type={showFpConfirm ? "text" : "password"}
                      value={fpConfirm}
                      onChange={(e) => { setFpConfirm(e.target.value); setFpError(""); }}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#263B32]/15 rounded-lg px-4 py-3 text-sm text-[#292824] outline-none pr-10"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#263B32]/50" onClick={() => setShowFpConfirm(v => !v)}>
                      <EyeIcon open={showFpConfirm} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setFpStep("email"); setFpError(""); setFpNew(""); setFpConfirm(""); }}
                    className="px-5 py-3 rounded-lg border border-[#263B32]/20 text-[#263B32] text-xs font-bold uppercase"
                  >
                    Back
                  </button>
                  <button
                    id="fp-reset-btn"
                    type="submit"
                    disabled={fpLoading}
                    className="flex-1 bg-[#A38A5A] hover:bg-[#8C7447] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm"
                  >
                    {fpLoading ? "RESETTING..." : "RESET PASSWORD"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

/* ─── Icon Components ───────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.16 3.19M6.6 6.6A18 18 0 0 0 2 12s3.5 7 10 7a9.1 9.1 0 0 0 5.4-1.6" />
          <path d="m2 2 20 20" />
        </>
      )}
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
         className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
         className="shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
