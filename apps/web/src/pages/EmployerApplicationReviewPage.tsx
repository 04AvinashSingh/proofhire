import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import {
  ALLOWED_STATUS_TRANSITIONS,
  type ApplicationStatus,
} from "@proofhire/shared-contracts";
import {
  User,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Layers,
  MessageSquare,
  Sparkles,
  Send,
  Building2,
  FileText,
  Github,
} from "lucide-react";

export const EmployerApplicationReviewPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const { activeOrg, user } = useAuth();
  const orgId = activeOrg?.id || user?.organizations?.[0]?.id;
  const queryClient = useQueryClient();

  const [reopenReason, setReopenReason] = useState("");
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const applicationQuery = useQuery({
    queryKey: ["employer-application-detail", orgId, appId],
    queryFn: () => api.fetchEmployerApplicationDetail(orgId!, appId!),
    enabled: !!orgId && !!appId,
  });

  const transitionMutation = useMutation({
    mutationFn: (dto: { status: ApplicationStatus; reason?: string }) =>
      api.updateApplicationStatus(orgId!, appId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-application-detail", orgId, appId] });
      setShowReopenModal(false);
      setReopenReason("");
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to transition application status");
    },
  });

  const noteMutation = useMutation({
    mutationFn: (content: string) =>
      api.addEvaluationNote(orgId!, appId!, { content, isInternal: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-application-detail", orgId, appId] });
      setNewNoteContent("");
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to record evaluation note");
    },
  });

  const aiAssessmentsQuery = useQuery({
    queryKey: ["employer-ai-assessments", appId],
    queryFn: () => api.fetchAiAssessments(appId!),
    enabled: !!appId,
  });

  const aiAssessmentMutation = useMutation({
    mutationFn: (requirementId?: string) =>
      api.triggerAiAssessment(appId!, requirementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-ai-assessments", appId] });
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to generate AI evidence assessment");
    },
  });

  if (applicationQuery.isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="pulse-indicator green" style={{ width: "16px", height: "16px", margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading candidate evidence matrix and evaluation notes...</p>
      </div>
    );
  }

  if (applicationQuery.isError || !applicationQuery.data) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
          <AlertTriangle size={40} color="var(--warning)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>Application Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            The requested application could not be found in your organization workspace.
          </p>
          <Link to="/workspace/jobs" className="btn btn-secondary">
            <ArrowLeft size={16} /> Return to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const app = applicationQuery.data;
  const currentStatus = app.status;
  const validNextStates = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  const handleTransitionClick = (nextState: ApplicationStatus) => {
    setActionError(null);
    if (currentStatus === "REJECTED" && nextState === "SCREENING") {
      setShowReopenModal(true);
      return;
    }

    transitionMutation.mutate({ status: nextState });
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      setActionError("A formal justification reason is required when reopening a rejected application.");
      return;
    }
    transitionMutation.mutate({ status: "SCREENING", reason: reopenReason.trim() });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    noteMutation.mutate(newNoteContent.trim());
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to={`/workspace/jobs`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-secondary)",
            fontSize: "0.88rem",
          }}
        >
          <ArrowLeft size={15} /> Back to Job Management
        </Link>
      </div>

      {/* Candidate Overview Card */}
      <div
        className="glass-panel"
        style={{
          padding: "2rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <span
              className={`badge ${
                currentStatus === "REJECTED"
                  ? "badge-danger"
                  : currentStatus === "HIRED"
                  ? "badge-success"
                  : "badge-indigo"
              }`}
            >
              {currentStatus}
            </span>
            <span
              className={`badge ${
                app.slaStatus === "BREACHED"
                  ? "badge-danger"
                  : app.slaStatus === "AT_RISK"
                  ? "badge-warning"
                  : "badge-success"
              }`}
            >
              <ShieldCheck size={12} /> SLA: {app.slaStatus.replace("_", " ")} (Day {app.daysInCurrentStage + 1} of 7)
            </span>
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
            {app.candidateName}
          </h1>

          <div style={{ color: "var(--text-secondary)", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>{app.candidateEmail}</span>
            <span>&bull;</span>
            <span>Applying for <strong>{app.job.title}</strong></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            to={`/portfolio/${app.candidateProfileId}`}
            target="_blank"
            className="btn btn-primary"
            style={{ fontSize: "0.88rem", padding: "0.55rem 1rem" }}
          >
            <ExternalLink size={15} /> View Full Portfolio
          </Link>
        </div>
      </div>

      {actionError && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.5rem",
            color: "var(--danger)",
            fontSize: "0.9rem",
          }}
        >
          {actionError}
        </div>
      )}

      {/* Main Grid: Evidence Matrix vs Sidebar State Machine & Notes */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.9fr) minmax(0, 1.1fr)", gap: "2rem", alignItems: "flex-start" }}>
        {/* Left Column: Evidence-to-Requirement Matrix */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Cover Note */}
          {app.coverNote && (
            <div className="glass-panel" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Candidate Cover Note
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {app.coverNote}
              </p>
            </div>
          )}

          {/* Evidence-to-Requirement Matrix */}
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Layers size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                Requirement-to-Evidence Matrix
              </h3>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0, maxWidth: "65%" }}>
                Each job requirement is paired with the candidate's submitted project artifacts and personal contribution disclosures.
              </p>
              <button
                type="button"
                onClick={() => aiAssessmentMutation.mutate(undefined)}
                disabled={aiAssessmentMutation.isPending}
                className="btn btn-primary"
                style={{ fontSize: "0.82rem", padding: "0.45rem 0.85rem" }}
              >
                <Sparkles size={14} />
                {aiAssessmentMutation.isPending ? "Analyzing Evidence..." : "Analyze All via ProofHire AI"}
              </button>
            </div>

            {app.job.requirements.length === 0 ? (
              <p style={{ color: "var(--text-tertiary)" }}>No specific criteria defined for this job.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {app.job.requirements.map((req, idx) => {
                  const matched = app.evidenceMappings.filter(
                    (m) => m.jobRequirementId === req.id
                  );
                  const assessment = aiAssessmentsQuery.data?.find(
                    (a: any) => a.requirementId === req.id
                  );

                  return (
                    <div
                      key={req.id}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "1.25rem",
                      }}
                    >
                      {/* Requirement Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          {idx + 1}. {req.requirementText}
                        </span>
                        <span className={`badge ${req.importance === "REQUIRED" ? "badge-danger" : "badge-indigo"}`}>
                          {req.importance}
                        </span>
                      </div>

                      {req.evidenceTypeHint && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "0.75rem" }}>
                          Expected Evidence: <em>{req.evidenceTypeHint}</em>
                        </div>
                      )}

                      {/* Linked Evidence Artifacts */}
                      {matched.length === 0 ? (
                        <div
                          style={{
                            background: "rgba(239, 68, 68, 0.05)",
                            border: "1px dashed rgba(239, 68, 68, 0.25)",
                            borderRadius: "var(--radius-sm)",
                            padding: "0.75rem 1rem",
                            color: "var(--text-secondary)",
                            fontSize: "0.84rem",
                          }}
                        >
                          <span style={{ color: "var(--danger)", fontWeight: 600 }}>Missing Evidence:</span> No candidate code artifact linked to this requirement.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {matched.map((m) => (
                            <div
                              key={m.id}
                              style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-medium)",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.85rem 1rem",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                    {m.evidence?.title || "Project Evidence"}
                                  </span>
                                  <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>
                                    Self-Reported
                                  </span>
                                  {m.evidence?.evidenceType && (
                                    <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>
                                      {m.evidence.evidenceType}
                                    </span>
                                  )}
                                </div>

                                {m.evidence?.url && (
                                  <a
                                    href={m.evidence.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.55rem" }}
                                  >
                                    <ExternalLink size={12} /> Inspect Artifact
                                  </a>
                                )}
                              </div>

                              {m.evidence?.personalContribution && (
                                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: 0 }}>
                                  <strong style={{ color: "var(--text-primary)" }}>Personal Contribution:</strong>{" "}
                                  {m.evidence.personalContribution}
                                </p>
                              )}

                              {m.relevanceReason && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.35rem" }}>
                                  Match note: {m.relevanceReason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ProofHire AI Evidence Assistant Panel */}
                      {assessment ? (
                        <div
                          style={{
                            marginTop: "1rem",
                            background: "rgba(99, 102, 241, 0.04)",
                            border: "1px solid rgba(99, 102, 241, 0.25)",
                            borderRadius: "var(--radius-md)",
                            padding: "1rem",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--accent-primary)" }}>
                              <Sparkles size={16} /> ProofHire AI Semantic Analysis
                            </div>
                            <span
                              className={`badge ${
                                assessment.supportLevel === "SUPPORTED"
                                  ? "badge-success"
                                  : assessment.supportLevel === "PARTIALLY_SUPPORTED"
                                  ? "badge-warning"
                                  : assessment.supportLevel === "CONTRADICTED"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                              style={{ fontSize: "0.75rem" }}
                            >
                              {assessment.supportLevel} ({Math.round(assessment.confidence * 100)}% confidence)
                            </span>
                          </div>

                          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                            {assessment.advisoryNotes}
                          </p>

                          {assessment.citations && assessment.citations.length > 0 && (
                            <div style={{ marginBottom: "0.75rem" }}>
                              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                                Grounded Citations from Evidence:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                                {assessment.citations.map((c: string, cIdx: number) => (
                                  <li key={cIdx} style={{ marginBottom: "0.2rem" }}>
                                    &ldquo;{c}&rdquo;
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {assessment.limitations && assessment.limitations.length > 0 && (
                            <div style={{ marginBottom: "0.75rem" }}>
                              <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                                Identified Gaps / Limitations:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.82rem", color: "var(--warning)" }}>
                                {assessment.limitations.map((lim: string, lIdx: number) => (
                                  <li key={lIdx} style={{ marginBottom: "0.2rem" }}>
                                    {lim}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div
                            style={{
                              background: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              padding: "0.45rem 0.65rem",
                              fontSize: "0.72rem",
                              color: "var(--text-tertiary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <ShieldCheck size={14} color="var(--accent-primary)" />
                            <span>Rule #7 Invariant: {assessment.rule7Disclaimer || "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers."}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: "0.85rem", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => aiAssessmentMutation.mutate(req.id)}
                            disabled={aiAssessmentMutation.isPending}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                          >
                            <Sparkles size={13} color="var(--accent-primary)" /> Analyze via ProofHire AI
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: State Machine Controller & Private Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* State Machine Transition Controller */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Application Lifecycle
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Server-enforced state transitions ensure pipeline integrity and anti-ghosting accountability.
            </p>

            <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Current Stage</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-primary)" }}>{currentStatus}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                Active in stage for {app.daysInCurrentStage} days
              </div>
            </div>

            {validNextStates.length === 0 ? (
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                Application has reached terminal state (<strong>{currentStatus}</strong>).
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  Available Transitions:
                </div>
                {validNextStates.map((nextState) => (
                  <button
                    key={nextState}
                    onClick={() => handleTransitionClick(nextState)}
                    disabled={transitionMutation.isPending}
                    className={`btn ${nextState === "REJECTED" ? "btn-outline" : "btn-primary"}`}
                    style={{
                      width: "100%",
                      fontSize: "0.88rem",
                      borderColor: nextState === "REJECTED" ? "rgba(239, 68, 68, 0.4)" : undefined,
                      color: nextState === "REJECTED" ? "var(--danger)" : undefined,
                    }}
                  >
                    Advance to {nextState}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reopen Modal / Card if triggered */}
          {showReopenModal && (
            <div className="glass-panel" style={{ padding: "1.5rem", border: "1px solid var(--warning)" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--warning)" }}>
                Reopen Application
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                Reopening a rejected application back to SCREENING requires a documented justification reason.
              </p>
              <form onSubmit={handleReopenSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <textarea
                  rows={2}
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Reason for reopening (e.g. Candidate provided new verification evidence)..."
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                  }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" disabled={transitionMutation.isPending} className="btn btn-primary" style={{ flex: 1, fontSize: "0.82rem" }}>
                    Confirm Reopen
                  </button>
                  <button type="button" onClick={() => setShowReopenModal(false)} className="btn btn-secondary" style={{ fontSize: "0.82rem" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Private Evaluation Notes Studio (Strictly isolated from candidate) */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Lock size={16} color="var(--warning)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Internal Evaluation Notes</h3>
            </div>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", marginBottom: "1rem" }}>
              Private to your hiring team. These notes are strictly isolated and never visible to the candidate.
            </p>

            {/* Existing Notes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem", maxHeight: "250px", overflowY: "auto" }}>
              {app.evaluationNotes.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>No internal notes recorded yet.</p>
              ) : (
                app.evaluationNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.75rem",
                      fontSize: "0.84rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)", fontSize: "0.75rem", marginBottom: "0.3rem" }}>
                      <strong>{note.authorName}</strong>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: "var(--text-primary)", margin: 0 }}>{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleNoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <textarea
                rows={3}
                required
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Record technical evaluation feedback, code review observations, or screening notes..."
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  resize: "vertical",
                }}
              />
              <button
                type="submit"
                disabled={noteMutation.isPending}
                className="btn btn-secondary"
                style={{ fontSize: "0.84rem", alignSelf: "flex-end" }}
              >
                <Send size={13} /> {noteMutation.isPending ? "Saving..." : "Add Internal Note"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
