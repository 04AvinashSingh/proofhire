import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import {
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  FileText,
  Send,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [coverNote, setCoverNote] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<Record<string, string>>({}); // reqId -> evidenceId
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch Job Details
  const jobQuery = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: () => api.fetchJob(jobId!),
    enabled: !!jobId,
  });

  // Fetch Candidate's Projects & Evidence to enable mapping
  const candidateProjectsQuery = useQuery({
    queryKey: ["candidate-projects"],
    queryFn: api.fetchProjects,
    enabled: !!user && user.role === "CANDIDATE",
  });

  // Check if candidate already applied
  const candidateAppsQuery = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: api.fetchCandidateApplications,
    enabled: !!user && user.role === "CANDIDATE",
  });

  const applyMutation = useMutation({
    mutationFn: (dto: any) => api.applyToJob(jobId!, dto),
    onSuccess: () => {
      navigate("/applications");
    },
    onError: (err: any) => {
      setSubmitError(err.message || "Failed to submit application");
    },
  });

  if (jobQuery.isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="pulse-indicator green" style={{ width: "16px", height: "16px", margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading position details and rubric criteria...</p>
      </div>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
          <AlertCircle size={40} color="var(--warning)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>Job Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            This position may have been closed or is not currently open to new applications.
          </p>
          <Link to="/jobs" className="btn btn-secondary">
            <ArrowLeft size={16} /> Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const job = jobQuery.data;
  const isCandidate = user?.role === "CANDIDATE";
  const existingApp = candidateAppsQuery.data?.find((app) => app.jobId === jobId);

  // Flatten candidate evidence items
  const allCandidateEvidence = (candidateProjectsQuery.data || []).flatMap((p) =>
    (p.evidence || []).map((e) => ({
      ...e,
      projectName: p.name,
    }))
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const mappings = Object.entries(selectedEvidence)
      .filter(([_, evId]) => Boolean(evId))
      .map(([jobRequirementId, projectEvidenceId]) => ({
        jobRequirementId,
        projectEvidenceId,
      }));

    applyMutation.mutate({
      coverNote: coverNote.trim() || null,
      evidenceMappings: mappings,
    });
  };

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/jobs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-secondary)",
            fontSize: "0.88rem",
          }}
        >
          <ArrowLeft size={15} /> Back to Job Search
        </Link>
      </div>

      {/* Job Header Card */}
      <div className="glass-panel" style={{ padding: "2.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <span className="badge badge-indigo">{job.employmentType.replace("_", " ")}</span>
          <span className="badge badge-success">{job.remoteType}</span>
          <span
            className="badge"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--success)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <ShieldCheck size={12} /> 7-Day Anti-Ghosting SLA
          </span>
        </div>

        <h1 style={{ fontSize: "2.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{job.title}</h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Building2 size={16} color="var(--accent-primary)" />
            {job.organisationName || "Partner Employer"}
          </span>
          {(job.locationCity || job.locationCountry) && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <MapPin size={16} color="var(--text-tertiary)" />
              {[job.locationCity, job.locationCountry].filter(Boolean).join(", ")}
            </span>
          )}
          {job.salaryMin && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-primary)" }}>
              <DollarSign size={16} color="var(--success)" />
              ₹{(job.salaryMin / 100000).toFixed(1)}L &mdash; ₹{((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)", gap: "2rem", alignItems: "flex-start" }}>
        {/* Left Column: Description & Rubrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Role Description */}
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Role Overview</h3>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, whiteSpace: "pre-line" }}>
              {job.description}
            </div>
          </div>

          {/* Structured Evaluation Rubrics */}
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <Sparkles size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Evaluation Rubrics & Code Criteria</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              ProofHire employers define explicit technical criteria. Candidates are evaluated against these criteria using tangible code artifacts rather than résumé keywords.
            </p>

            {job.requirements.length === 0 ? (
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>No specific rubric requirements specified.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {job.requirements.map((req, idx) => (
                  <div
                    key={req.id}
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {idx + 1}. {req.requirementText}
                      </span>
                      <span className={`badge ${req.importance === "REQUIRED" ? "badge-danger" : "badge-indigo"}`}>
                        {req.importance}
                      </span>
                    </div>

                    {req.evidenceTypeHint && (
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--accent-primary)",
                          background: "var(--accent-subtle)",
                          padding: "0.4rem 0.65rem",
                          borderRadius: "var(--radius-sm)",
                          display: "inline-block",
                        }}
                      >
                        <strong>Competency Hint:</strong> {req.evidenceTypeHint}
                      </div>
                    )}

                    {req.skillTags && req.skillTags.length > 0 && (
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                        {req.skillTags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-secondary)",
                              background: "var(--bg-tertiary)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "var(--radius-full)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Application Box */}
        <div>
          {existingApp ? (
            <div className="glass-panel" style={{ padding: "2rem", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Application Submitted
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
                You applied for this position. Your application is currently in <strong>{existingApp.status}</strong> stage.
              </p>
              <Link to="/applications" className="btn btn-primary" style={{ width: "100%" }}>
                View in Application Tracker
              </Link>
            </div>
          ) : isCandidate ? (
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Apply with Code Evidence
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Map your projects and artifacts to the employer's evaluation rubrics.
              </p>

              {/* Anti-Ghosting Guarantee Callout */}
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.25rem" }}>
                  <ShieldCheck size={14} /> 7-Day Anti-Ghosting SLA
                </div>
                Employers are held to a strict 7-day review SLA. You are guaranteed timeline transparency at every stage.
              </div>

              {submitError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    color: "var(--danger)",
                    fontSize: "0.85rem",
                  }}
                >
                  {submitError}
                </div>
              )}

              <form onSubmit={handleApply} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                    Cover Note (Optional, max 1000 chars)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Highlight your relevant engineering contributions..."
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Evidence Selectors for each requirement */}
                {job.requirements.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                      Link Evidence to Rubrics (Optional but Recommended)
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {job.requirements.map((req) => (
                        <div key={req.id} style={{ background: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                            {req.requirementText}
                          </div>
                          <select
                            value={selectedEvidence[req.id] || ""}
                            onChange={(e) =>
                              setSelectedEvidence((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                            style={{
                              width: "100%",
                              padding: "0.45rem 0.65rem",
                              background: "var(--bg-tertiary)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--text-primary)",
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            <option value="">-- Select matching project evidence --</option>
                            {allCandidateEvidence.map((ev) => (
                              <option key={ev.id} value={ev.id}>
                                [{ev.projectName}] {ev.title} ({ev.evidenceType})
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.75rem" }}
                >
                  <Send size={16} /> {applyMutation.isPending ? "Submitting..." : "Submit Application with Evidence"}
                </button>
              </form>
            </div>
          ) : user ? (
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
              <ShieldCheck size={36} color="var(--accent-primary)" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Employer Preview Mode
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                You are viewing this listing with an Employer session. Candidates view this page with the interactive evidence mapper.
              </p>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
              <Sparkles size={36} color="var(--accent-primary)" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Sign In to Apply
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                Create a verified candidate profile to apply with your projects, code evidence, and architecture designs.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: "100%" }}>
                Sign In / Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
