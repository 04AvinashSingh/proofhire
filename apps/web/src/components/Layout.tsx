import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Activity,
  User,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  Building2,
  Search,
  Bell,
  Briefcase,
  Layers,
  FileCheck,
} from "lucide-react";

export const Layout: React.FC = () => {
  const { user, activeOrg, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
      {/* Top Navbar — Sleek Clean Pill & Telemetry Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "0.65rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          {/* Brand & Workspace Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontWeight: 700,
                fontSize: "1.2rem",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0284c7 0%, #10b981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontWeight: 800 }}>
                Proof<span style={{ color: "var(--accent-primary)" }}>Hire</span>
              </span>
            </Link>

            <div
              style={{
                display: "none",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.2rem 0.65rem",
                background: "#f1f5f9",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
              className="lg-flex"
            >
              <span>Workspace 1</span>
              <span style={{ color: "var(--text-tertiary)" }}>&bull;</span>
              <span style={{ color: "#059669", fontWeight: 600 }}>Active Hub</span>
            </div>
          </div>

          {/* Center Pill Segmented Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              background: "#eef2f6",
              padding: "3px",
              borderRadius: "var(--radius-full)",
              gap: "2px",
            }}
          >
            <NavLink
              to="/"
              style={({ isActive }) => ({
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                transition: "all var(--transition-fast)",
              })}
            >
              Platform
            </NavLink>

            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                transition: "all var(--transition-fast)",
              })}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/jobs"
              style={({ isActive }) => ({
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                transition: "all var(--transition-fast)",
              })}
            >
              Jobs & Rubrics
            </NavLink>

            {isAuthenticated && user?.role === "CANDIDATE" && (
              <NavLink
                to="/applications"
                style={({ isActive }) => ({
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                  transition: "all var(--transition-fast)",
                })}
              >
                Applications
              </NavLink>
            )}

            {isAuthenticated && user?.role === "EMPLOYER" && (
              <NavLink
                to="/workspace/jobs"
                style={({ isActive }) => ({
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive ? "0 2px 6px rgba(0, 0, 0, 0.06)" : "none",
                  transition: "all var(--transition-fast)",
                })}
              >
                Manage Rubrics
              </NavLink>
            )}
          </nav>

          {/* Right Area: KPI Stats & User Controls (Like in reference picture) */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {/* KPI Counter Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {/* Stat 1: 72 Candidates */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>72</span>
                    <span className="pulse-indicator green" style={{ width: "6px", height: "6px" }} />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", textTransform: "capitalize" }}>Candidates</div>
                </div>
                {/* Mini sparkline SVG */}
                <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                  <path d="M1 12L6 8L11 11L16 5L23 2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Stat 2: 30 Verified Proofs */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>30</span>
                    <span className="pulse-indicator green" style={{ width: "6px", height: "6px" }} />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", textTransform: "capitalize" }}>Verified</div>
                </div>
                {/* Mini bar sparkline */}
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <rect x="1" y="8" width="3" height="6" rx="1" fill="#cbd5e1" />
                  <rect x="6" y="5" width="3" height="9" rx="1" fill="#cbd5e1" />
                  <rect x="11" y="3" width="3" height="11" rx="1" fill="#10b981" />
                  <rect x="16" y="1" width="3" height="13" rx="1" fill="#10b981" />
                </svg>
              </div>

              {/* Stat 3: 345 SLA Active */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>345</span>
                    <span className="pulse-indicator red" style={{ width: "6px", height: "6px" }} />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", textTransform: "capitalize" }}>Throughput</div>
                </div>
              </div>
            </div>

            {/* Icon Buttons: Search & Notification */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn-icon"
                title="Search rubrics, candidates, and jobs"
                style={{ width: "32px", height: "32px" }}
              >
                <Search size={14} />
              </button>
              <button
                type="button"
                className="btn-icon"
                title="Notifications"
                style={{ width: "32px", height: "32px", position: "relative" }}
              >
                <Bell size={14} />
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />
              </button>
            </div>

            {/* User Profile Pill or Auth Links */}
            {isAuthenticated && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#ffffff",
                    padding: "3px 10px 3px 4px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: user.role === "CANDIDATE" ? "#0284c7" : "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {user.fullName.charAt(0)}
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {user.fullName}
                  </span>
                  <span
                    className={`badge ${
                      user.role === "CANDIDATE" ? "badge-blue" : "badge-success"
                    }`}
                    style={{ fontSize: "0.65rem", padding: "1px 6px" }}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
                  title="Sign out"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link
                  to="/login"
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register/candidate"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    background: "#0f172a",
                    color: "#ffffff",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.15)",
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, position: "relative" }}>
        <Outlet />
      </main>

      {/* Sleek Minimalist Light Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          padding: "2rem 1.5rem 1.5rem",
          marginTop: "auto",
        }}
      >
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.5rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <ShieldCheck size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>ProofHire Verified Framework</span>
              <span style={{ color: "var(--text-tertiary)" }}>&bull;</span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Objective, evidence-based software hiring with cryptographic audit integrity.
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} color="#10b981" /> Argon2id Password Hashing
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} color="#10b981" /> HttpOnly Secure Sessions
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} color="#10b981" /> Cross-Tenant Isolation
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} color="#10b981" /> 7-Day Anti-Ghosting SLA
              </span>
            </div>
          </div>

          <div
            style={{
              paddingTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "var(--text-tertiary)",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <span>&copy; {new Date().getFullYear()} ProofHire. Evidence-Based Developer Hiring.</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Link to="/status" style={{ color: "var(--text-tertiary)" }}>
                System Health
              </Link>
              <span>Argon2id &bull; HttpOnly Strict &bull; SHA-256 Hash Chain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
