import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Building2, Mail, Lock, User, AlertCircle, ArrowRight, Shield } from "lucide-react";

export const RegisterEmployerPage: React.FC = () => {
  const { registerEmployer } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await registerEmployer({
        fullName,
        email,
        password,
        organizationName,
      });
      navigate("/login", {
        state: {
          registeredMessage: "Organization and employer account registered! Please sign in.",
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "3.5rem auto", padding: "0 1.5rem" }}>
      <div className="glass-panel" style={{ padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--success)",
              marginBottom: "1rem",
            }}
          >
            <Building2 size={26} />
          </div>
          <span className="badge badge-success" style={{ marginBottom: "0.5rem" }}>
            Employer Workspace
          </span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
            Register Your Engineering Team
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Evaluate candidates against explicit criteria with dedicated tenant isolation.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--danger-subtle)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              fontSize: "0.85rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              htmlFor="organizationName"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              Organization / Company Name
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="organizationName"
                type="text"
                required
                minLength={2}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Engineering"
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.4rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  outline: "none",
                }}
              />
              <Building2
                size={16}
                color="var(--text-tertiary)"
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              Your Full Name
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="fullName"
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Lead"
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.4rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  outline: "none",
                }}
              />
              <User
                size={16}
                color="var(--text-tertiary)"
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              Work Email Address
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@acme.com"
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.4rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  outline: "none",
                }}
              />
              <Mail
                size={16}
                color="var(--text-tertiary)"
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              Password (min 8 characters)
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.4rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  outline: "none",
                }}
              />
              <Lock
                size={16}
                color="var(--text-tertiary)"
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div
            style={{
              background: "rgba(16, 185, 129, 0.06)",
              padding: "0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Shield size={18} color="var(--success)" style={{ flexShrink: 0 }} />
            <span>
              Your team will be registered with <strong>OWNER</strong> privileges and guaranteed
              multi-tenant isolation.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
          >
            {isSubmitting ? "Registering Workspace..." : "Create Employer Workspace"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
