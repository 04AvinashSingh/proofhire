import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type {
  EmploymentType,
  RemoteType,
  RequirementImportance,
  JobStatus,
  JobRequirementInput,
} from "@proofhire/shared-contracts";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";

export const EmployerJobEditorPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const isEditing = Boolean(jobId);
  const { activeOrg, user } = useAuth();
  const orgId = activeOrg?.id || user?.organizations?.[0]?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [remoteType, setRemoteType] = useState<RemoteType>("REMOTE");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("India");
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<JobStatus>("DRAFT");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rubric Requirements State
  const [requirements, setRequirements] = useState<
    Array<{
      id: string;
      requirementText: string;
      importance: RequirementImportance;
      evidenceTypeHint: string;
      skillTags: string;
    }>
  >([
    {
      id: "init-1",
      requirementText: "Relational schema design and query optimization",
      importance: "REQUIRED",
      evidenceTypeHint: "Link to schema migration, index plan, or PR",
      skillTags: "PostgreSQL, SQL",
    },
  ]);

  // Load existing job if in edit mode
  const jobQuery = useQuery({
    queryKey: ["job-edit", jobId],
    queryFn: () => api.fetchJob(jobId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (jobQuery.data) {
      const j = jobQuery.data;
      setTitle(j.title);
      setDescription(j.description);
      setEmploymentType(j.employmentType);
      setRemoteType(j.remoteType);
      setLocationCity(j.locationCity || "");
      setLocationCountry(j.locationCountry || "");
      setSalaryMin(j.salaryMin || undefined);
      setSalaryMax(j.salaryMax || undefined);
      setStatus(j.status);
      if (j.requirements && j.requirements.length > 0) {
        setRequirements(
          j.requirements.map((r) => ({
            id: r.id,
            requirementText: r.requirementText,
            importance: r.importance,
            evidenceTypeHint: r.evidenceTypeHint || "",
            skillTags: (r.skillTags || []).join(", "),
          }))
        );
      }
    }
  }, [jobQuery.data]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: any) => api.createOrgJob(orgId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-jobs"] });
      navigate("/workspace/jobs");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create job");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: any) => api.updateOrgJob(orgId!, jobId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-edit", jobId] });
      navigate("/workspace/jobs");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to update job");
    },
  });

  const addRequirementRow = () => {
    setRequirements((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        requirementText: "",
        importance: "REQUIRED",
        evidenceTypeHint: "",
        skillTags: "",
      },
    ]);
  };

  const removeRequirementRow = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRequirementRow = (id: string, field: string, value: any) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formattedRequirements: JobRequirementInput[] = requirements
      .filter((r) => r.requirementText.trim().length > 0)
      .map((r, idx) => ({
        requirementText: r.requirementText.trim(),
        importance: r.importance,
        evidenceTypeHint: r.evidenceTypeHint.trim() || null,
        skillTags: r.skillTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        sortOrder: idx,
      }));

    const payload = {
      title,
      description,
      employmentType,
      remoteType,
      locationCity: locationCity.trim() || null,
      locationCountry: locationCountry.trim() || null,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      status,
      requirements: formattedRequirements,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Top Back Link */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/workspace/jobs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-secondary)",
            fontSize: "0.88rem",
          }}
        >
          <ArrowLeft size={15} /> Back to Job Listings
        </Link>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-indigo">Rubric Studio</span>
          <span className="badge badge-success">Structured Rubrics</span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
          {isEditing ? "Edit Job & Evaluation Rubrics" : "Create New Engineering Position"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Define the role and link candidate evaluation directly to technical skill competencies.
        </p>
      </div>

      {errorMsg && (
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
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Core Job Details */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            Position Overview
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Role Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Junior Backend Engineer (Distributed Systems)"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
                <option value="PART_TIME">Part-Time</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Workplace Remote Options
              </label>
              <select
                value={remoteType}
                onChange={(e) => setRemoteType(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Location (City)
              </label>
              <input
                type="text"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Annual Salary Range (INR)
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  placeholder="Min (e.g. 800000)"
                  value={salaryMin || ""}
                  onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                  style={{
                    width: "50%",
                    padding: "0.65rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  type="number"
                  placeholder="Max (e.g. 1400000)"
                  value={salaryMax || ""}
                  onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
                  style={{
                    width: "50%",
                    padding: "0.65rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Role Description *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe team mission, system responsibilities, and expected technical challenges..."
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Listing Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                <option value="DRAFT">DRAFT (Internal review only)</option>
                <option value="PUBLISHED">PUBLISHED (Discoverable by candidates)</option>
                <option value="CLOSED">CLOSED (Stop new applications)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Structured Rubric Criteria Builder */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Structured Evaluation Rubrics</h3>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                Define explicit criteria and what code evidence candidates must supply to demonstrate competency.
              </p>
            </div>

            <button
              type="button"
              onClick={addRequirementRow}
              className="btn btn-secondary"
              style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}
            >
              <Plus size={14} /> Add Criterion
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {requirements.map((req, index) => (
              <div
                key={req.id}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 40px",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-tertiary)", marginBottom: "0.25rem" }}>
                      Requirement Criterion #{index + 1} *
                    </label>
                    <input
                      type="text"
                      required
                      value={req.requirementText}
                      onChange={(e) => updateRequirementRow(req.id, "requirementText", e.target.value)}
                      placeholder="e.g. Distributed message queues and consensus protocols"
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.75rem",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-tertiary)", marginBottom: "0.25rem" }}>
                        Evidence Type Hint (What should they show?)
                      </label>
                      <input
                        type="text"
                        value={req.evidenceTypeHint}
                        onChange={(e) => updateRequirementRow(req.id, "evidenceTypeHint", e.target.value)}
                        placeholder="e.g. Link to Raft algorithm implementation in repo"
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          background: "var(--bg-tertiary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-tertiary)", marginBottom: "0.25rem" }}>
                        Skill Tags (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={req.skillTags}
                        onChange={(e) => updateRequirementRow(req.id, "skillTags", e.target.value)}
                        placeholder="e.g. Go, Raft, Distributed Systems"
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          background: "var(--bg-tertiary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-primary)",
                          fontSize: "0.82rem",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-tertiary)", marginBottom: "0.25rem" }}>
                    Importance
                  </label>
                  <select
                    value={req.importance}
                    onChange={(e) => updateRequirementRow(req.id, "importance", e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-primary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="REQUIRED">REQUIRED</option>
                    <option value="PREFERRED">PREFERRED</option>
                  </select>
                </div>

                <div style={{ paddingTop: "1.4rem" }}>
                  <button
                    type="button"
                    onClick={() => removeRequirementRow(req.id)}
                    disabled={requirements.length <= 1}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--danger)",
                      cursor: requirements.length <= 1 ? "not-allowed" : "pointer",
                      opacity: requirements.length <= 1 ? 0.4 : 1,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <Link to="/workspace/jobs" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn btn-primary"
            style={{ padding: "0.75rem 1.5rem" }}
          >
            <Save size={16} /> {isEditing ? "Update Job & Rubrics" : "Save Job Posting"}
          </button>
        </div>
      </form>
    </div>
  );
};
