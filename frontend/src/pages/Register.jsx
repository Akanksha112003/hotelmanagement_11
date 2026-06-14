import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { saveAuth } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd,         setShowPwd]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [showSuccess,     setShowSuccess]     = useState(false);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (!name.trim()) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      setLoading(false);
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (!confirmPassword) {
      setError("Please confirm your password.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      setLoading(false);
      return;
    }

    register({ name: name.trim(), email: email.trim(), password })
      .then(data => {
        saveAuth({ token: data.token, user: data.user });
        setLoading(false);
        setShowSuccess(true);
        // Automatically redirect to dashboard immediately
        navigate("/dashboard", { replace: true });
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || "Registration failed. Please try again.");
      });
  };

  return (
    <div style={S.root}>
      {/* Background Image */}
      <img
        src="/azure_coast.png"
        alt="Azure Coast Resort"
        style={S.bgImage}
        draggable={false}
      />
      {/* Strong Dark Left-Side Overlay */}
      <div className="acg-left-overlay" />

      {/* ═══════════════════════════════════
          LEFT — Premium Hero (60%)
      ═══════════════════════════════════ */}
      <div style={S.leftSection}>
        
        {/* Minimal Hero Header */}
        <div className="acg-anim-fade-up acg-d-100" style={S.heroHeader}>
          <div style={S.collectionBadge}>AZURE COAST COLLECTION</div>
          <h1 style={S.editorialHeading}>
            Stay Beyond<br />
            Expectations
          </h1>
          <p style={S.editorialSubtitle}>
            Luxury hospitality management platform for hotels, resorts, and premium guest experiences.
          </p>
        </div>

        {/* 4 Floating Glass Feature Cards */}
        <div className="acg-feature-grid acg-anim-fade-up acg-d-300">
          
          <div className="acg-feature-card acg-float-1">
            <SmartReservationsIcon />
            <span>Smart Reservations</span>
          </div>

          <div className="acg-feature-card acg-float-2">
            <GuestExperienceIcon />
            <span>Guest Experience</span>
          </div>

          <div className="acg-feature-card acg-float-3">
            <RevenueAnalyticsIcon />
            <span>Revenue Analytics</span>
          </div>

          <div className="acg-feature-card acg-float-4">
            <HousekeepingControlIcon />
            <span>Housekeeping Control</span>
          </div>

        </div>

      </div>

      {/* ═══════════════════════════════════
          RIGHT — Premium Glass Panel (40%)
      ═══════════════════════════════════ */}
      <div style={S.rightSection}>
        <div className="acg-glass-card acg-anim-fade-in acg-d-200" style={S.card}>
          
          {/* Card Header */}
          <div style={S.cardHeader}>
            <div style={S.brandLogo}>
              <div style={S.brandIcon}><LogoIcon /></div>
              <span style={S.brandName}>Azure Coast</span>
            </div>
            <h2 className="acg-anim-fade-up acg-d-300" style={S.cardTitle}>
              Get Started
            </h2>
            <p className="acg-anim-fade-up acg-d-400" style={S.cardSubtitle}>
              Register to create your account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorBox}>
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={S.form} noValidate>
            
            <div className="acg-anim-fade-up acg-d-400" style={S.rowTwo}>
              <div style={S.field}>
                <label style={S.label} htmlFor="register-name">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  placeholder="John Doe"
                  className="acg-input"
                />
              </div>

              <div style={S.field}>
                <label style={S.label} htmlFor="register-email">Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="acg-input"
                />
              </div>
            </div>

            <div className="acg-anim-fade-up acg-d-500" style={S.rowTwo}>
              <div style={S.field}>
                <label style={S.label} htmlFor="register-password">Password</label>
                <div style={S.pwdWrap}>
                  <input
                    id="register-password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="acg-input"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    style={S.pwdToggle}
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
              </div>

              <div style={S.field}>
                <label style={S.label} htmlFor="register-confirm">Confirm Password</label>
                <div style={S.pwdWrap}>
                  <input
                    id="register-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="acg-input"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    style={S.pwdToggle}
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            <div className="acg-anim-fade-up acg-d-600" style={{ marginTop: 12 }}>
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="acg-btn"
              >
                {loading ? "Creating…" : "Create Workspace"}
              </button>
            </div>

          </form>

          {/* Login Link */}
          <div className="acg-anim-fade-in acg-d-700" style={S.switchWrap}>
            <span style={S.switchText}>Already have an account?</span>
            <Link to="/login" style={S.switchLink}>
              Sign In
            </Link>
          </div>

        </div>
      </div>

      {showSuccess && (
        <div className="acg-modal-overlay">
          <div className="acg-modal">
            <div style={S.modalIconContainer}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D9B77A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={S.modalTitle}>Registration Successful</h2>
            <p style={S.modalMessage}>Your Azure Coast account has been created successfully.</p>
            <button
              type="button"
              className="acg-btn"
              style={{ marginTop: 24 }}
              onClick={() => {
                setShowSuccess(false);
                navigate("/dashboard", { replace: true });
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── Styles ───────────────────────────────────────────────────── */
const S = {
  root: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
  },
  bgImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    zIndex: 0,
  },

  /* ── Left Section ── */
  leftSection: {
    position: "relative",
    flex: "0 0 60%",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: "8vw",
    paddingRight: "4vw",
    gap: 40,
  },
  heroHeader: {
    display: "flex",
    flexDirection: "column",
    maxWidth: 580,
    zIndex: 15,
  },
  collectionBadge: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#D9B77A",
    marginBottom: 16,
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  editorialHeading: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2.8rem, 4.8vw, 4.5rem)",
    fontWeight: 400,
    lineHeight: 1.12,
    color: "#FFFFFF",
    marginBottom: 20,
    textShadow: "0 4px 24px rgba(0,0,0,0.5)",
  },
  editorialSubtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: 400,
    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },

  /* Feature card inner elements */
  cardIcon: {
    color: "#D9B77A",
    flexShrink: 0,
  },

  /* ── Right Section ── */
  rightSection: {
    position: "relative",
    flex: "0 0 40%",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: "5vw",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 500,
    padding: "40px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 25px 80px rgba(0,0,0,0.15)",
    borderRadius: 32,
  },
  cardHeader: {
    marginBottom: 28,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  brandLogo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "8px 16px",
    borderRadius: 100,
  },
  brandIcon: {
    color: "#D9B77A",
    display: "flex",
    alignItems: "center",
  },
  brandName: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 600,
    color: "#FFFFFF",
    letterSpacing: "0.05em",
  },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "2rem",
    fontWeight: 400,
    color: "#FFFFFF",
    marginBottom: 8,
    textShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  cardSubtitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: 400,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 20,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "#ef4444",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  rowTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  pwdWrap: {
    position: "relative",
  },
  pwdToggle: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    alignItems: "center",
  },
  switchWrap: {
    marginTop: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  switchText: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  switchLink: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "#D9B77A",
    textDecoration: "none",
  },
  modalIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "rgba(217, 183, 122, 0.1)",
    border: "2px solid rgba(217, 183, 122, 0.3)",
    marginBottom: 24,
    animation: "acg-fade-up 0.5s ease both",
  },
  modalTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "2rem",
    fontWeight: 400,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  modalMessage: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    lineHeight: 1.5,
    marginBottom: 8,
  },
};

/* ─── Icon Components ───────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
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
         style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SmartReservationsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={S.cardIcon}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function GuestExperienceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={S.cardIcon}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function RevenueAnalyticsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={S.cardIcon}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <path d="M2 20h20" />
    </svg>
  );
}

function HousekeepingControlIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={S.cardIcon}>
      <path d="M12 3v18M3 12h18M12 3l4 4M12 3L8 7M12 21l4-4M12 21l-4-4" />
    </svg>
  );
}
