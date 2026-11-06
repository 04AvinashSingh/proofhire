import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import {
  Briefcase,
  Plus,
  Users,
  Eye,
  Edit,
  Clock,
  Sparkles,
  Building2,
  AlertCircle,
} from "lucide-react";

export const EmployerJobsPage: React.FC = () => {
  const { activeOrg, user } = useAuth();
  const orgId = activeOrg?.id || user?.organizations?.[0]?.id;

  const jobsQuery = useQuery({
    queryKey: ["org-jobs", orgId],
    queryFn: () => api.fetchOrgJobs(orgId!),
    enabled: !!orgId,
  });

  const jobsList = jobsQuery.data || [];

  if (!orgId) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
          <AlertCircle size={40} color="var(--warning)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            No Active Organization
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            You need to be part of an employer organization to manage job postings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span className="badge badge-indigo">Employer Workspace</span>
            <span className="badge badge-success">Active Openings</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Job Postings & Evaluation Rubrics
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Define positions with explicit code evidence rubrics for <strong>{activeOrg?.name}</strong>.
          </p>
        </div>

        <Link
          to="/workspace/jobs/new"
          className="btn btn-primary"
          style={{ fontSize: "0.92rem", padding: "0.65rem 1.25rem" }}
        >
          <Plus size={16} /> Post New Engineering Role
        </Link>
      </div>

      {/* Jobs List */}
      {jobsQuery.isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div className="pulse-indicator green" style={{ width: "16px", height: "16px", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading organization job listings...</p>
        </div>
      ) : jobsList.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3.5rem", textAlign: "center" }}>
          <Briefcase size={44} color="var(--text-tertiary)" style={{ margin: "0 auto 1.25rem" }} />
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            No Jobs Created Yet
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Create your first job listing with structured evaluation rubrics and required code criteria.
          </p>
          <Link to="/workspace/jobs/new" className="btn btn-primary">
            <Plus size={16} /> Create Job Listing
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {jobsList.map((job) => (
            <div
              key={job.id}
              className="glass-panel"
              style={{
                padding: "1.75rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                  <span
                    className={`badge ${
                      job.status === "PUBLISHED"
                        ? "badge-success"
                        : job.status === "DRAFT"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="badge badge-indigo">{job.employmentType.replace("_", " ")}</span>
                  <span className="badge badge-secondary">{job.remoteType}</span>
                </div>

                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  {job.title}
                </h2>

                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", color: "var(--text-secondary)", fontSize: "0.86rem" }}>
                  <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span>{job.requirements.length} Rubric Criteria</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Link
                  to={`/jobs/${job.id}`}
                  target="_blank"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 0.85rem" }}
                >
                  <Eye size={14} /> Preview
                </Link>

                <Link
                  to={`/workspace/jobs/${job.id}/edit`}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 0.85rem" }}
                >
                  <Edit size={14} /> Edit Rubrics
                </Link>

                <Link
                  to={`/workspace/jobs/${job.id}/applications`}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 0.95rem" }}
                >
                  <Users size={14} /> Applicants ({job.applicationCount || 0})
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
