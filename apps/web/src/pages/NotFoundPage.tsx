import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "rgba(239, 68, 68, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--danger)",
          marginBottom: "1.5rem",
        }}
      >
        <AlertTriangle size={28} />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Page Not Found
      </h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: "400px", marginBottom: "2rem" }}>
        The page you requested does not exist or has been relocated in the ProofHire architecture.
      </p>
      <Link to="/" className="btn btn-secondary">
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
};
