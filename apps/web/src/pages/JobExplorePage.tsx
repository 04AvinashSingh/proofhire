import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Sparkles,
} from "lucide-react";

export const JobExplorePage: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [remoteType, setRemoteType] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");

  const jobsQuery = useQuery({
    queryKey: ["jobs-explore", keyword, remoteType, employmentType],
    queryFn: () =>
      api.searchJobs({
        keyword: keyword.trim() || undefined,
        remoteType: (remoteType || undefined) as any,
        employmentType: (employmentType || undefined) as any,
      }),
  });

  const jobsList = jobsQuery.data || [];

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-indigo">Job Discovery</span>
          <span className="badge badge-success">Explicit Rubrics</span>
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Explore Evidence-Based Engineering Roles
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "700px" }}>
          Apply with your real code repositories, architecture diagrams, and pull requests.
          Every listing features explicit evaluation rubrics and guaranteed anti-ghosting SLAs.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem",
          marginBottom: "2.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <Search
            size={18}
            color="var(--text-tertiary)"
            style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by role title, technology, or keywords..."
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.75rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "0.92rem",
            }}
          />
        </div>

        <select
          value={remoteType}
          onChange={(e) => setRemoteType(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          <option value="">All Workplaces (Remote / Onsite)</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">Onsite</option>
        </select>

        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          <option value="">All Types (Full-Time / Internship)</option>
          <option value="FULL_TIME">Full-Time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="CONTRACT">Contract</option>
        </select>
      </div>

      {/* Jobs Listing */}
      {jobsQuery.isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div className="pulse-indicator green" style={{ width: "16px", height: "16px", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--text-secondary)" }}>Searching open engineering positions...</p>
        </div>
      ) : jobsList.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          <Briefcase size={40} color="var(--text-tertiary)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No engineering roles found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Try adjusting your search keywords or workplace filters.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {jobsList.map((job) => (
            <div
              key={job.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: "1.75rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              <div style={{ flex: "1 1 500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
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
                    <ShieldCheck size={12} /> 7-Day SLA Guaranteed
                  </span>
                </div>

                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  <Link to={`/jobs/${job.id}`} style={{ color: "var(--text-primary)" }}>
                    {job.title}
                  </Link>
                </h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.88rem",
                    marginBottom: "0.85rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Building2 size={15} color="var(--accent-primary)" />
                    {job.organisationName || "Partner Organization"}
                  </span>
                  {(job.locationCity || job.locationCountry) && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <MapPin size={15} color="var(--text-tertiary)" />
                      {[job.locationCity, job.locationCountry].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {job.salaryMin && (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <DollarSign size={15} color="var(--success)" />
                      ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{((job.salaryMax || job.salaryMin) / 100000).toFixed(1)}L
                    </span>
                  )}
                </div>

                {/* Evidence Requirements Preview */}
                {job.requirements && job.requirements.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>
                      Required Evidence:
                    </span>
                    {job.requirements.slice(0, 3).map((r) => (
                      <span
                        key={r.id}
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {r.requirementText}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)" }}>
                        +{job.requirements.length - 3} more criteria
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Link
                  to={`/jobs/${job.id}`}
                  className="btn btn-primary"
                  style={{ fontSize: "0.9rem", padding: "0.65rem 1.25rem" }}
                >
                  View Rubrics & Apply <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
