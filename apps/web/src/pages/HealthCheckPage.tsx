import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHealth, fetchReadiness } from "../lib/api";
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Clock,
  Radio,
} from "lucide-react";

export const HealthCheckPage: React.FC = () => {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 10000,
  });

  const readinessQuery = useQuery({
    queryKey: ["readiness"],
    queryFn: fetchReadiness,
    refetchInterval: 10000,
  });

  const isLoading = healthQuery.isLoading || readinessQuery.isLoading;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <Activity size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>System Diagnostics</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            Live status probes connecting web client to Express core API and PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            healthQuery.refetch();
            readinessQuery.refetch();
          }}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? "spin" : ""} />
          <span>Refresh Probes</span>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* Liveness Card */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-primary)",
                }}
              >
                <Server size={18} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>API Liveness</h3>
            </div>

            {healthQuery.isSuccess && healthQuery.data.status === "ok" ? (
              <span className="badge badge-success">
                <span className="pulse-indicator green" /> Healthy
              </span>
            ) : healthQuery.isLoading ? (
              <span className="badge badge-warning">Probing...</span>
            ) : (
              <span className="badge badge-danger">Unreachable</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.88rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Endpoint:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>GET /health</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Version:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {healthQuery.data?.version || "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Environment:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {healthQuery.data?.environment || "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Uptime:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {healthQuery.data?.uptime !== undefined ? `${healthQuery.data.uptime}s` : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Timestamp:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                {healthQuery.data?.timestamp ? new Date(healthQuery.data.timestamp).toLocaleTimeString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Readiness Card */}
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--success)",
                }}
              >
                <Database size={18} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Database Readiness</h3>
            </div>

            {readinessQuery.isSuccess && readinessQuery.data.status === "ready" ? (
              <span className="badge badge-success">
                <span className="pulse-indicator green" /> Ready
              </span>
            ) : readinessQuery.isLoading ? (
              <span className="badge badge-warning">Probing...</span>
            ) : (
              <span className="badge badge-danger">
                <span className="pulse-indicator amber" /> Not Ready
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.88rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Endpoint:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>GET /ready</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>PostgreSQL Connection:</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color:
                    readinessQuery.data?.checks.database === "healthy"
                      ? "var(--success)"
                      : "var(--warning)",
                  fontWeight: 600,
                }}
              >
                {readinessQuery.data?.checks.database || "pending"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Connection Pool:</span>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                Max 20 clients
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Timestamp:</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                {readinessQuery.data?.timestamp ? new Date(readinessQuery.data.timestamp).toLocaleTimeString() : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Payload Inspector */}
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-secondary)" }}>
          Raw Diagnostic Response Payload
        </h3>
        <pre
          style={{
            background: "rgba(0, 0, 0, 0.35)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.82rem",
            color: "#a5b4fc",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(
            {
              health: healthQuery.data || { error: healthQuery.error?.message },
              readiness: readinessQuery.data || { error: readinessQuery.error?.message },
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};
