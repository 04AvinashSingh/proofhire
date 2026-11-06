import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";
import type { SkillCategory, SkillProficiency } from "@proofhire/shared-contracts";
import {
  Code2,
  Briefcase,
  GraduationCap,
  MapPin,
  ExternalLink,
  Github,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
  Clock,
  Layers,
  ArrowLeft,
  Video,
  FileCheck,
  Eye,
  Sparkles,
} from "lucide-react";

export const PublicPortfolioPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const portfolioQuery = useQuery({
    queryKey: ["public-portfolio", candidateId],
    queryFn: () => api.fetchPortfolio(candidateId!),
    enabled: !!candidateId,
  });

  if (portfolioQuery.isLoading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div className="pulse-indicator green" style={{ width: "16px", height: "16px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Loading candidate evidence portfolio...
        </p>
      </div>
    );
  }

  if (portfolioQuery.isError || !portfolioQuery.data) {
    const errorMsg =
      portfolioQuery.error instanceof Error
        ? portfolioQuery.error.message
        : "The requested candidate portfolio could not be found or access is restricted.";

    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
          <AlertTriangle
            size={48}
            color="var(--warning)"
            style={{ margin: "0 auto 1.5rem auto", display: "block" }}
          />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Portfolio Unavailable
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "2rem" }}>
            {errorMsg}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { fullName, email, profile, skills, education, experience, projects } =
    portfolioQuery.data;

  // Filter skills by selected category
  const filteredSkills =
    selectedCategory === "ALL"
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  const totalEvidenceCount = projects.reduce((acc, p) => acc + p.evidence.length, 0);

  const getProficiencyBadgeClass = (p: SkillProficiency) => {
    switch (p) {
      case "ADVANCED":
        return "badge-success";
      case "INTERMEDIATE":
        return "badge-indigo";
      case "BEGINNER":
      default:
        return "badge-warning";
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "GITHUB_URL":
        return <Github size={16} color="var(--accent-primary)" />;
      case "VIDEO_LINK":
        return <Video size={16} color="var(--warning)" />;
      case "UPLOADED_FILE":
        return <FileCheck size={16} color="var(--success)" />;
      case "WRITTEN_EXPLANATION":
        return <FileText size={16} color="var(--info)" />;
      case "URL":
      default:
        return <ExternalLink size={16} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.88rem",
            transition: "color var(--transition-fast)",
          }}
        >
          <ArrowLeft size={15} /> Back to ProofHire
        </Link>
      </div>

      {/* Mandatory ProofHire Invariant Disclaimer (Rule #8) */}
      <div
        style={{
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.85rem",
        }}
      >
        <AlertTriangle
          size={20}
          color="var(--warning)"
          style={{ flexShrink: 0, marginTop: "0.15rem" }}
        />
        <div style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-primary)" }}>
            Candidate Self-Reported Evidence Notice:
          </strong>{" "}
          All code projects, architecture diagrams, work histories, and skill proficiencies
          displayed below have been directly submitted by the candidate. In compliance with
          ProofHire verification principles, they remain designated as{" "}
          <span className="badge badge-warning" style={{ fontSize: "0.68rem" }}>
            Self-Reported
          </span>{" "}
          until verified through employer technical review or reproducible challenge execution.
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div
        className="glass-panel"
        style={{
          padding: "2.5rem",
          marginBottom: "2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {/* Avatar Initials */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#ffffff",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>{fullName}</h1>
                <span className="badge badge-success">
                  <span className="pulse-indicator green" /> {profile.status?.replace("_", " ") || "ACTIVE"}
                </span>
                <span className="badge badge-indigo">
                  <Eye size={12} /> {profile.visibility}
                </span>
              </div>

              {/* Metadata Subline */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  marginTop: "0.5rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.92rem",
                  flexWrap: "wrap",
                }}
              >
                {(profile.locationCity || profile.locationCountry) && (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <MapPin size={15} color="var(--accent-primary)" />
                    {[profile.locationCity, profile.locationCountry].filter(Boolean).join(", ")}
                  </span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Briefcase size={15} color="var(--success)" />
                  {profile.yearsExperience || 0} years experience
                </span>
                {email && (
                  <span style={{ color: "var(--text-tertiary)" }}>
                    &bull; {email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              lineHeight: 1.6,
              maxWidth: "850px",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Quick Highlights Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", textTransform: "uppercase" }}>
              Projects
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-primary)" }}>
              {projects.length}
            </div>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", textTransform: "uppercase" }}>
              Attached Artifacts
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--success)" }}>
              {totalEvidenceCount}
            </div>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", textTransform: "uppercase" }}>
              Claimed Skills
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--info)" }}>
              {skills.length}
            </div>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ color: "var(--text-tertiary)", fontSize: "0.78rem", textTransform: "uppercase" }}>
              Work History
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a855f7" }}>
              {experience.length} roles
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "2.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left Column: Projects, Evidence, Experience, Education */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Projects Section */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <FolderGit2 size={22} color="var(--accent-primary)" />
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                  Projects & Technical Evidence
                </h2>
              </div>
              <span className="badge badge-indigo">
                {projects.length} {projects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
                <Code2 size={40} color="var(--text-tertiary)" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "var(--text-secondary)" }}>
                  No projects have been published to this portfolio yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="glass-panel"
                    style={{
                      padding: "2rem",
                      borderLeft: "4px solid var(--accent-primary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.25rem",
                    }}
                  >
                    {/* Project Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                            {project.name}
                          </h3>
                          <span className="badge badge-indigo">
                            {project.roleInProject.replace("_", " ")}
                          </span>
                          {project.isTeamProject ? (
                            <span className="badge badge-warning">
                              Team ({project.teamSize || 2} engineers)
                            </span>
                          ) : (
                            <span className="badge badge-success">Sole Developer</span>
                          )}
                        </div>

                        {/* Project Timeline */}
                        {(project.startDate || project.endDate) && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              color: "var(--text-tertiary)",
                              fontSize: "0.82rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            <Clock size={13} />
                            {project.startDate || "Started"} &mdash;{" "}
                            {project.endDate || "Present"}
                          </div>
                        )}
                      </div>

                      {/* Project External Links */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}
                          >
                            <Github size={14} /> Repository
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}
                          >
                            <ExternalLink size={14} /> Live Demo
                          </a>
                        )}
                        {project.projectUrl && !project.demoUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}
                          >
                            <ExternalLink size={14} /> Website
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Project Overview */}
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      {project.description}
                    </p>

                    {/* ProofHire Key Invariant: Personal Contribution Highlight Box */}
                    <div
                      style={{
                        background: "rgba(99, 102, 241, 0.08)",
                        border: "1px solid rgba(99, 102, 241, 0.25)",
                        borderRadius: "var(--radius-md)",
                        padding: "1.15rem 1.25rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          marginBottom: "0.5rem",
                          color: "var(--accent-primary)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        <Sparkles size={14} />
                        Personal Contribution & Architectural Responsibility
                      </div>
                      <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                        {project.personalContribution}
                      </p>
                    </div>

                    {/* Attached Evidence Artifacts Showcase */}
                    {project.evidence && project.evidence.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--text-tertiary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Layers size={14} /> Attached Evidence Artifacts ({project.evidence.length})
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                          {project.evidence.map((ev) => (
                            <div
                              key={ev.id}
                              style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                padding: "1rem 1.15rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.6rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  flexWrap: "wrap",
                                  gap: "0.5rem",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  {getEvidenceIcon(ev.evidenceType)}
                                  <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                                    {ev.title}
                                  </span>
                                  <span className="badge badge-indigo" style={{ fontSize: "0.68rem" }}>
                                    {ev.evidenceType.replace("_", " ")}
                                  </span>
                                  <span className="badge badge-warning" style={{ fontSize: "0.68rem" }}>
                                    Self-Reported
                                  </span>
                                </div>

                                {ev.url && (
                                  <a
                                    href={ev.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                                  >
                                    <ExternalLink size={12} /> Inspect Evidence
                                  </a>
                                )}
                              </div>

                              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                                {ev.description}
                              </p>

                              {/* Evidence Individual Contribution */}
                              {ev.personalContribution && (
                                <div
                                  style={{
                                    fontSize: "0.82rem",
                                    color: "var(--text-secondary)",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "var(--radius-sm)",
                                  }}
                                >
                                  <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                                    Contribution:
                                  </span>{" "}
                                  {ev.personalContribution}
                                </div>
                              )}

                              {/* Skill Tags */}
                              {ev.skillTags && ev.skillTags.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                                  {ev.skillTags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      style={{
                                        background: "var(--bg-tertiary)",
                                        color: "var(--text-secondary)",
                                        fontSize: "0.72rem",
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Experience Section */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <Briefcase size={22} color="var(--success)" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Work Experience</h2>
            </div>

            {experience.length === 0 ? (
              <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)" }}>
                  No experience timeline entries added yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="glass-panel"
                    style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{exp.roleTitle}</h4>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          <strong>{exp.companyName}</strong>
                          {exp.employmentType && (
                            <span style={{ color: "var(--text-tertiary)" }}>
                              {" "}
                              &bull; {exp.employmentType.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="badge badge-indigo">
                          {exp.startDate} &mdash; {exp.isCurrent ? "Present" : exp.endDate || "Ended"}
                        </span>
                        {exp.isCurrent && <span className="badge badge-success">Current Role</span>}
                      </div>
                    </div>

                    {exp.responsibilities && (
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.55 }}>
                        {exp.responsibilities}
                      </p>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                        {exp.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "var(--bg-secondary)",
                              color: "var(--accent-primary)",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <GraduationCap size={22} color="#a855f7" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Education & Academics</h2>
            </div>

            {education.length === 0 ? (
              <div className="glass-panel" style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)" }}>
                  No academic background entries added yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="glass-panel"
                    style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{edu.institution}</h4>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                          {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ")}
                        </div>
                      </div>

                      {(edu.startYear || edu.endYear) && (
                        <span className="badge badge-indigo">
                          {[edu.startYear, edu.endYear].filter(Boolean).join(" - ")}
                        </span>
                      )}
                    </div>

                    {edu.description && (
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Skills Inventory & Platform Guarantees */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Skills Inventory Card */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Code2 size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Skills Inventory</h3>
            </div>

            {/* Category Filter Pills */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
                marginBottom: "1.25rem",
              }}
            >
              {["ALL", "Languages", "Frameworks", "Databases", "Tools"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "0.3rem 0.65rem",
                    fontSize: "0.75rem",
                    borderRadius: "var(--radius-full)",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor:
                      selectedCategory === cat ? "var(--accent-primary)" : "var(--border-subtle)",
                    background:
                      selectedCategory === cat ? "var(--accent-subtle)" : "var(--bg-secondary)",
                    color: selectedCategory === cat ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: 500,
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filtered Skills List */}
            {filteredSkills.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                No skills found for this category.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      background: "var(--bg-secondary)",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{skill.skillName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                        {skill.category}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span className={`badge ${getProficiencyBadgeClass(skill.proficiency)}`}>
                        {skill.proficiency}
                      </span>
                      <span
                        className="badge badge-warning"
                        style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}
                        title="Self-reported by candidate; pending independent verification"
                      >
                        Self-Reported
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ProofHire Verification & Integrity Guarantee Card */}
          <div
            className="glass-panel"
            style={{
              padding: "1.75rem",
              background: "linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <ShieldCheck size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>ProofHire Integrity</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.84rem" }}>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  <strong style={{ color: "var(--text-primary)" }}>Zero Automated Rejection:</strong> ProofHire
                  guarantees that AI never makes hiring decisions. All evaluations are reviewed by human engineers.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  <strong style={{ color: "var(--text-primary)" }}>Evidence Over Buzzwords:</strong> Candidates are
                  evaluated on tangible code artifacts, pull requests, and verified contributions.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  <strong style={{ color: "var(--text-primary)" }}>Anti-Ghosting SLA:</strong> Every application
                  submitted receives guaranteed timeline tracking and transparent feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
