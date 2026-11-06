import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "@proofhire/shared-contracts";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="pulse-indicator green" style={{ width: 12, height: 12, marginBottom: 8 }} />
          <div>Checking session authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--danger)",
              marginBottom: "1rem",
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Access Restricted
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
            This page is restricted to roles: [<strong>{allowedRoles.join(", ")}</strong>]. Your
            current account role is <strong>{user.role}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
