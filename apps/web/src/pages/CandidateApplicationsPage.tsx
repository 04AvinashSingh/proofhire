import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import {
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import type { ApplicationStatus, AntiGhostingSlaStatus } from "@proofhire/shared-contracts";

const STAGES: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

export const CandidateApplicationsPage: React.FC = () => {
  const appsQuery = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: api.fetchCandidateApplications,
  });

  const applicationsList = appsQuery.data || [];

  const getSlaBadge = (status: AntiGhostingSlaStatus, daysInStage: number) => {
    switch (status) {
      case "BREACHED":
        return (
          <span
            className="badge badge-danger"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <AlertTriangle size={12} /> SLA Breached ({daysInStage} days in stage)
          </span>
        );
      case "AT_RISK":
        return (
          <span
            className="badge badge-warning"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Clock size={12} /> SLA At Risk (&lt;48h remaining)
          </span>
        );
      case "ON_TRACK":
      default:
        return (
          <span
            className="badge badge-success"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <ShieldCheck size={12} /> Review SLA On Track (Day {daysInStage + 1} of 7)
          </span>
        );
    }
  };

  const getStageIndex = (status: ApplicationStatus) => {
    if (status === "REJECTED") return -1;
    return STAGES.indexOf(status);
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Top Banner */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-indigo">Candidate Applications</span>
          <span className="badge badge-success">7-Day SLA Protected</span>
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Anti-Ghosting Application Tracker
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "750px" }}>
          Every application you submit is protected by ProofHire's Anti-Ghosting SLA.
          Employers are held to a strict 7-day review SLA, ensuring zero silent rejections.
        </p>
      </div>

      {appsQuery.isLoading ? (
        <div style={{ textAlign: "center", padding: "5rem 0" }}>
          <div className="pulse-indicator green" style={{ width: "16px", height: "16px", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading your application statuses...</p>
        </div>
      ) : applicationsList.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3.5rem", textAlign: "center" }}>
          <FileCheck size={48} color="var(--text-tertiary)" style={{ margin: "0 auto 1.25rem" }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            No Applications Submitted Yet
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
            Browse open positions and apply with your code evidence and project portfolio.
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Explore Open Engineering Positions <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {applicationsList.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === "REJECTED";

            return (
              <div
                key={app.id}
                className="glass-panel"
                style={{
                  padding: "2rem",
                  borderLeft: `4px solid ${
                    isRejected
                      ? "var(--danger)"
                      : app.status === "HIRED"
                      ? "var(--success)"
                      : "var(--accent-primary)"
                  }`,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <span
                        className={`badge ${
                          isRejected
                            ? "badge-danger"
                            : app.status === "HIRED"
                            ? "badge-success"
                            : "badge-indigo"
                        }`}
                        style={{ fontSize: "0.82rem", padding: "0.3rem 0.75rem" }}
                      >
                        {app.status}
                      </span>
                      {getSlaBadge(app.slaStatus, app.daysInCurrentStage)}
                    </div>
                    <h2 style={{ fontSize: "1.45rem", fontWeight: 700 }}>
                      <Link to={`/jobs/${app.jobId}`} style={{ color: "var(--text-primary)" }}>
                        {app.jobTitle}
                      </Link>
                    </h2>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem" }}>
                      <Building2 size={15} color="var(--accent-primary)" />
                      {app.organisationName} &bull; Applied {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <Link
                      to={`/jobs/${app.jobId}`}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem" }}
                    >
                      View Job Criteria <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>

                {/* Pipeline Progression Stepper */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "relative",
                      alignItems: "center",
                    }}
                  >
                    {STAGES.map((stage, idx) => {
                      const isComplete = !isRejected && currentStageIdx >= idx;
                      const isCurrent = !isRejected && currentStageIdx === idx;

                      return (
                        <div
                          key={stage}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            zIndex: 2,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              background: isComplete
                                ? "var(--accent-gradient)"
                                : "var(--bg-tertiary)",
                              color: isComplete ? "#ffffff" : "var(--text-tertiary)",
                              border: isCurrent ? "2px solid var(--accent-primary)" : "none",
                              boxShadow: isCurrent ? "0 0 10px rgba(99, 102, 241, 0.5)" : "none",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {isComplete ? <CheckCircle2 size={16} /> : idx + 1}
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? "var(--text-primary)" : "var(--text-tertiary)",
                              textAlign: "center",
                            }}
                          >
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline History */}
                {app.history && app.history.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
                      Transparent Timeline Audit History
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {app.history.map((h) => (
                        <div
                          key={h.id}
                          style={{
                            fontSize: "0.84rem",
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <span style={{ color: "var(--text-tertiary)", fontSize: "0.78rem" }}>
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                          <span className="badge badge-indigo" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                            {h.toStatus}
                          </span>
                          <span>{h.reason || "Status transition recorded"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
