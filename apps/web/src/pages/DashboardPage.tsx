import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  ExternalLink,
  GitBranch,
  FileCheck,
  AlertCircle,
  Award,
  User,
  Briefcase,
  Filter,
  Check,
  Send,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  openingsCount: number;
  applicantsCount: number;
}

interface CandidateApplication {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  initials: string;
  appliedDate: string;
  matchScore: number;
  evidenceStatus: "VERIFIED" | "SELF_REPORTED";
  slaDaysRemaining: number;
  slaStatus: "ON_TRACK" | "AT_RISK" | "COMPLETED";
  currentStage: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED";
  targetJobId: string;
  targetJobTitle: string;
  summary: string;
  githubUrl: string;
  portfolioSlug: string;
  rubricEvaluations: {
    id: string;
    requirement: string;
    importance: "MUST_HAVE" | "IMPORTANT" | "PREFERRED";
    evidenceTitle: string;
    evidenceType: string;
    evidenceUrl?: string;
    isVerified: boolean;
    verificationMethod: string;
    candidateContribution: string;
  }[];
}

export const DashboardPage: React.FC = () => {
  const { user, activeOrg } = useAuth();

  // Active Job Filter
  const [selectedJobId, setSelectedJobId] = useState<string>("job-backend-eng");

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStage, setFilterStage] = useState<"ALL" | "VERIFIED" | "REVIEW" | "SLA_ALERT">("ALL");

  // Selected Candidate for Deep Review
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("cand-1");

  // Interactive Manager Feedback / Notes
  const [evaluationNote, setEvaluationNote] = useState<string>("");
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [decisionStage, setDecisionStage] = useState<string>("SCREENING");
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  // Available Job Openings
  const jobOpenings: JobOpening[] = [
    {
      id: "job-backend-eng",
      title: "Junior Backend Systems Engineer",
      department: "Platform Infrastructure",
      location: "Bengaluru (Hybrid)",
      openingsCount: 2,
      applicantsCount: 18,
    },
    {
      id: "job-fullstack",
      title: "Full-Stack TypeScript Engineer",
      department: "Product Engineering",
      location: "Remote",
      openingsCount: 1,
      applicantsCount: 24,
    },
    {
      id: "job-distributed",
      title: "Distributed Systems Developer",
      department: "Core Services",
      location: "Remote (APAC)",
      openingsCount: 1,
      applicantsCount: 12,
    },
  ];

  // Candidates Stream
  const [candidates, setCandidates] = useState<CandidateApplication[]>([
    {
      id: "cand-1",
      name: "Alex Chen",
      email: "alex.chen@example.dev",
      role: "Full-Stack & Systems Developer",
      initials: "AC",
      appliedDate: "2 days ago",
      matchScore: 94,
      evidenceStatus: "VERIFIED",
      slaDaysRemaining: 5,
      slaStatus: "ON_TRACK",
      currentStage: "SCREENING",
      targetJobId: "job-backend-eng",
      targetJobTitle: "Junior Backend Systems Engineer",
      summary:
        "Built distributed rate-limiter in TypeScript with sliding-window Redis counter. Strong experience in Drizzle ORM, PostgreSQL transactions, and automated Vitest suites.",
      githubUrl: "https://github.com/alexchen/redis-rate-limiter",
      portfolioSlug: "cand-profile-1",
      rubricEvaluations: [
        {
          id: "rubric-1",
          requirement: "API Design & Data Modeling in PostgreSQL & TypeScript",
          importance: "MUST_HAVE",
          evidenceTitle: "Distributed Rate-Limiter Architecture",
          evidenceType: "GITHUB_REPO",
          evidenceUrl: "https://github.com/alexchen/redis-rate-limiter",
          isVerified: true,
          verificationMethod: "GITHUB_REPOSITORY_CHECK",
          candidateContribution:
            "Designed schema migrations with foreign key constraints, connection pool timeouts, and idempotent upserts.",
        },
        {
          id: "rubric-2",
          requirement: "Concurrency, Caching & Performance (Redis / In-Memory)",
          importance: "IMPORTANT",
          evidenceTitle: "Redis Sliding-Window Script & Benchmarks",
          evidenceType: "COMMIT_HASH",
          evidenceUrl: "https://github.com/alexchen/redis-rate-limiter/commit/a1b2c3d4",
          isVerified: true,
          verificationMethod: "GIT_COMMIT_CHECKSUM",
          candidateContribution:
            "Implemented Lua script for atomic sliding-window increment, sustaining 12,000 req/s benchmark without race conditions.",
        },
        {
          id: "rubric-3",
          requirement: "Automated Testing, CI/CD & Code Quality (Vitest / Jest)",
          importance: "MUST_HAVE",
          evidenceTitle: "Test Suite & Integration Pipelines",
          evidenceType: "DESIGN_DOC",
          evidenceUrl: "/uploads/architecture-benchmark.pdf",
          isVerified: false,
          verificationMethod: "SELF_REPORTED_ARTIFACT",
          candidateContribution:
            "Wrote 86 unit and integration test assertions with 94% branch coverage in GitHub Actions.",
        },
      ],
    },
    {
      id: "cand-2",
      name: "Samira Rao",
      email: "samira.rao@example.com",
      role: "Distributed Systems Dev",
      initials: "SR",
      appliedDate: "3 days ago",
      matchScore: 82,
      evidenceStatus: "VERIFIED",
      slaDaysRemaining: 4,
      slaStatus: "ON_TRACK",
      currentStage: "APPLIED",
      targetJobId: "job-backend-eng",
      targetJobTitle: "Junior Backend Systems Engineer",
      summary:
        "Specialized in event brokers and transactional messaging. Created async job consumer pipeline in Node.js and Postgres listen/notify.",
      githubUrl: "https://github.com/samira-rao/pg-broker",
      portfolioSlug: "cand-profile-2",
      rubricEvaluations: [
        {
          id: "rubric-2-1",
          requirement: "API Design & Data Modeling in PostgreSQL & TypeScript",
          importance: "MUST_HAVE",
          evidenceTitle: "Postgres Event Queue Engine",
          evidenceType: "GITHUB_REPO",
          evidenceUrl: "https://github.com/samira-rao/pg-broker",
          isVerified: true,
          verificationMethod: "GITHUB_REPOSITORY_CHECK",
          candidateContribution:
            "Architected table partitioning and skip-locked consumer polling for reliable delivery guarantees.",
        },
        {
          id: "rubric-2-2",
          requirement: "Concurrency, Caching & Performance (Redis / In-Memory)",
          importance: "IMPORTANT",
          evidenceTitle: "In-Memory LRU Buffer Implementation",
          evidenceType: "COMMIT_HASH",
          isVerified: true,
          verificationMethod: "GIT_COMMIT_CHECKSUM",
          candidateContribution: "Optimized memory footprint with zero-copy binary serialization.",
        },
      ],
    },
    {
      id: "cand-3",
      name: "Jordan Taylor",
      email: "jordan.t@example.org",
      role: "Backend Platform Engineer",
      initials: "JT",
      appliedDate: "6 days ago",
      matchScore: 76,
      evidenceStatus: "SELF_REPORTED",
      slaDaysRemaining: 1,
      slaStatus: "AT_RISK",
      currentStage: "APPLIED",
      targetJobId: "job-backend-eng",
      targetJobTitle: "Junior Backend Systems Engineer",
      summary:
        "Experience with REST APIs and containerized microservices. Portfolio includes full-text search backend using Docker.",
      githubUrl: "https://github.com/jordantaylor/search-service",
      portfolioSlug: "cand-profile-3",
      rubricEvaluations: [
        {
          id: "rubric-3-1",
          requirement: "API Design & Data Modeling in PostgreSQL & TypeScript",
          importance: "MUST_HAVE",
          evidenceTitle: "Full-Text Search API",
          evidenceType: "DESIGN_DOC",
          isVerified: false,
          verificationMethod: "SELF_REPORTED_ARTIFACT",
          candidateContribution: "Authored OpenAPI spec and Docker Compose harness for local testing.",
        },
      ],
    },
    {
      id: "cand-4",
      name: "Priya Sharma",
      email: "priya.sharma@example.in",
      role: "Full-Stack Dev",
      initials: "PS",
      appliedDate: "1 day ago",
      matchScore: 89,
      evidenceStatus: "VERIFIED",
      slaDaysRemaining: 6,
      slaStatus: "ON_TRACK",
      currentStage: "INTERVIEW",
      targetJobId: "job-fullstack",
      targetJobTitle: "Full-Stack TypeScript Engineer",
      summary:
        "Full-stack engineer with React, Tailwind, and Node.js experience. Built responsive dashboards with WebSocket real-time updates.",
      githubUrl: "https://github.com/priyasharma/live-metrics",
      portfolioSlug: "cand-profile-4",
      rubricEvaluations: [
        {
          id: "rubric-4-1",
          requirement: "React UI & Design System Components",
          importance: "MUST_HAVE",
          evidenceTitle: "Live Metrics UI System",
          evidenceType: "GITHUB_REPO",
          evidenceUrl: "https://github.com/priyasharma/live-metrics",
          isVerified: true,
          verificationMethod: "GITHUB_REPOSITORY_CHECK",
          candidateContribution: "Developed reusable data-table with client-side sorting and virtualized rows.",
        },
      ],
    },
  ]);

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    // Search query filter
    const matchesSearch =
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.targetJobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Stage pill filter
    if (filterStage === "VERIFIED") return cand.evidenceStatus === "VERIFIED";
    if (filterStage === "REVIEW") return cand.currentStage === "SCREENING" || cand.currentStage === "APPLIED";
    if (filterStage === "SLA_ALERT") return cand.slaStatus === "AT_RISK";

    return true;
  });

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || candidates[0]!;

  const handleStageChange = (newStage: "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED") => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === selectedCandidate.id ? { ...c, currentStage: newStage } : c))
    );
    setDecisionStage(newStage);
    setDecisionFeedback(
      `Application updated to ${newStage}. Candidate notification recorded in audit trail.`
    );
    setTimeout(() => setDecisionFeedback(null), 4000);
  };

  const handleSaveNote = () => {
    if (!evaluationNote.trim()) return;
    setNoteSaved(true);
    setTimeout(() => {
      setNoteSaved(false);
      setEvaluationNote("");
    }, 2500);
  };

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "1.5rem 1.5rem 3rem" }}>
      {/* Sub-Header: Clean Navigation & Quick Metrics */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Hiring Pipeline Operations
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                background: "#ecfdf5",
                borderRadius: "var(--radius-full)",
                fontSize: "0.72rem",
                color: "#059669",
                fontWeight: 600,
                border: "1px solid #a7f3d0",
              }}
            >
              <span className="pulse-indicator green" style={{ width: "6px", height: "6px" }} />
              Live Hiring Cycle
            </span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            Review candidate portfolios, independently verified rubrics, and track 7-day Anti-Ghosting SLA deadlines.
          </p>
        </div>

        {/* Action Controls & Role Selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            style={{
              padding: "7px 14px",
              background: "#ffffff",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
            }}
          >
            {jobOpenings.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.applicantsCount} applicants)
              </option>
            ))}
          </select>

          <Link
            to="/jobs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              background: "linear-gradient(135deg, #0284c7 0%, #10b981 100%)",
              color: "#ffffff",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
              transition: "all var(--transition-fast)",
            }}
          >
            <span>Browse Job Openings</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Two-Column Hiring Pipeline Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: "1.5rem",
          alignItems: "start",
          marginBottom: "1.75rem",
        }}
      >
        {/* Left Column: Candidate Stream & Pipeline Filters */}
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem",
            background: "rgba(255, 255, 255, 0.88)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
          }}
        >
          {/* Header & Filter Search */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Briefcase size={16} color="#0284c7" />
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  Candidate Stream
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  background: "#f1f5f9",
                  borderRadius: "var(--radius-full)",
                  color: "var(--text-secondary)",
                }}
              >
                {filteredCandidates.length} Active
              </span>
            </div>

            {/* Clean Neo-Search Input */}
            <div style={{ position: "relative", marginBottom: "0.75rem" }}>
              <Search
                size={14}
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}
              />
              <input
                type="text"
                placeholder="Search candidates, skills, repos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  background: "#ffffff",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            {/* Stage Toggle Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {(
                [
                  { key: "ALL", label: "All" },
                  { key: "VERIFIED", label: "Verified" },
                  { key: "REVIEW", label: "In Review" },
                  { key: "SLA_ALERT", label: "SLA Urgent" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterStage(tab.key)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.72rem",
                    fontWeight: filterStage === tab.key ? 600 : 500,
                    color: filterStage === tab.key ? "#ffffff" : "var(--text-secondary)",
                    background: filterStage === tab.key ? "var(--text-primary)" : "#f1f5f9",
                    border: "none",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Card Stream List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
            {filteredCandidates.map((cand) => {
              const isSelected = cand.id === selectedCandidate.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  style={{
                    padding: "0.9rem",
                    borderRadius: "var(--radius-lg)",
                    background: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                    border: isSelected ? "1.5px solid #0284c7" : "1px solid var(--border-subtle)",
                    boxShadow: isSelected ? "0 4px 14px -2px rgba(2, 132, 199, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          background: isSelected ? "#0284c7" : "#e2e8f0",
                          color: isSelected ? "#ffffff" : "#334155",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cand.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                          {cand.name}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          {cand.targetJobTitle}
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        background: cand.matchScore >= 90 ? "#ecfdf5" : "#eff6ff",
                        color: cand.matchScore >= 90 ? "#059669" : "#0284c7",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        border: cand.matchScore >= 90 ? "1px solid #a7f3d0" : "1px solid #bfdbfe",
                      }}
                    >
                      {cand.matchScore}%
                    </div>
                  </div>

                  {/* Pills: Verification & Anti-Ghosting SLA */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {cand.evidenceStatus === "VERIFIED" ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "#059669",
                          background: "#ecfdf5",
                          padding: "1px 6px",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <ShieldCheck size={11} />
                        Verified Evidence
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "#d97706",
                          background: "#fffbeb",
                          padding: "1px 6px",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <AlertCircle size={11} />
                        Self-Reported (Rule #8)
                      </span>
                    )}

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "0.68rem",
                        fontWeight: 500,
                        color: cand.slaStatus === "AT_RISK" ? "#dc2626" : "var(--text-tertiary)",
                        background: cand.slaStatus === "AT_RISK" ? "#fef2f2" : "#f1f5f9",
                        padding: "1px 6px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      <Clock size={11} />
                      {cand.slaDaysRemaining}d SLA left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Candidate Deep-Dive & Rubric Evaluation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Candidate Profile Header Card */}
          <div
            className="glass-panel"
            style={{
              padding: "1.5rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #0284c7 0%, #10b981 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                  }}
                >
                  {selectedCandidate.initials}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {selectedCandidate.name}
                    </h2>
                    <span
                      style={{
                        padding: "2px 8px",
                        background: "#f1f5f9",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      {selectedCandidate.currentStage}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Applying for <strong style={{ color: "var(--text-primary)" }}>{selectedCandidate.targetJobTitle}</strong> &bull; Applied {selectedCandidate.appliedDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Public Portfolio & GitHub */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link
                  to={`/portfolio/${selectedCandidate.portfolioSlug}`}
                  target="_blank"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "#f1f5f9",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span>Public Portfolio</span>
                  <ExternalLink size={13} />
                </Link>

                <a
                  href={selectedCandidate.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "#0f172a",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <GitBranch size={13} />
                  <span>GitHub Repo</span>
                </a>
              </div>
            </div>

            {/* Candidate Executive Summary */}
            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.9rem 1.1rem",
                background: "#f8fafc",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                border: "1px solid var(--border-subtle)",
              }}
            >
              {selectedCandidate.summary}
            </div>

            {/* Anti-Ghosting SLA Timeline Banner */}
            <div
              style={{
                marginTop: "1rem",
                padding: "0.9rem 1.1rem",
                background: "linear-gradient(135deg, rgba(236, 253, 245, 0.7) 0%, rgba(239, 246, 255, 0.7) 100%)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(167, 243, 208, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="#059669" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#065f46" }}>
                    Anti-Ghosting SLA Guarantee &bull; {selectedCandidate.slaDaysRemaining} Days Remaining
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#047857" }}>
                    ProofHire guarantees candidates an employer status response within 7 calendar days of submission.
                  </div>
                </div>
              </div>

              {/* Micro SLA Progress Meter */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "120px", height: "6px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${((7 - selectedCandidate.slaDaysRemaining) / 7) * 100}%`,
                      height: "100%",
                      background: "#10b981",
                      borderRadius: "99px",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>
                  Day {7 - selectedCandidate.slaDaysRemaining} of 7
                </span>
              </div>
            </div>
          </div>

          {/* Grounded Rubric Evaluation Matrix */}
          <div
            className="glass-panel"
            style={{
              padding: "1.5rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} color="#10b981" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Grounded Rubric Alignment & Verified Evidence
                </h3>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                Rule #8: Self-reported evidence marked explicitly
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {selectedCandidate.rubricEvaluations.map((rubric) => (
                <div
                  key={rubric.id}
                  style={{
                    padding: "1rem",
                    background: "#ffffff",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.4rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                          {rubric.requirement}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: "var(--radius-full)",
                            background: rubric.importance === "MUST_HAVE" ? "#fef2f2" : "#f1f5f9",
                            color: rubric.importance === "MUST_HAVE" ? "#dc2626" : "var(--text-secondary)",
                          }}
                        >
                          {rubric.importance.replace("_", " ")}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        Evidence: <strong style={{ color: "var(--text-primary)" }}>{rubric.evidenceTitle}</strong>
                      </div>
                    </div>

                    {/* Verification Method Badge */}
                    {rubric.isVerified ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 9px",
                          background: "#ecfdf5",
                          color: "#059669",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        <ShieldCheck size={13} />
                        Independently Verified
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 9px",
                          background: "#fffbeb",
                          color: "#d97706",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          border: "1px solid #fde68a",
                        }}
                      >
                        <AlertCircle size={13} />
                        Self-Reported Evidence (Rule #8)
                      </span>
                    )}
                  </div>

                  {/* Candidate Direct Contribution Statement */}
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      background: "#f8fafc",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: "3px solid #0284c7",
                      marginTop: "0.4rem",
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>Candidate Contribution:</strong> {rubric.candidateContribution}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employer Decision Deliberation (Adheres strictly to Rule #7: Zero Automated Rejection) */}
          <div
            className="glass-panel"
            style={{
              padding: "1.5rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={18} color="#0284c7" />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Human Hiring Manager Deliberation
                </h3>
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  background: "#eff6ff",
                  borderRadius: "var(--radius-full)",
                  color: "#0284c7",
                  fontWeight: 600,
                }}
              >
                Rule #7: Zero Automated Rejection
              </span>
            </div>

            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              ProofHire strictly requires human decision-making. Advance candidate stage or record evaluation notes below.
            </p>

            {/* Stage Decision Buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => handleStageChange("SCREENING")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: decisionStage === "SCREENING" ? "#ffffff" : "#0284c7",
                  background: decisionStage === "SCREENING" ? "#0284c7" : "#eff6ff",
                  border: "1px solid #bfdbfe",
                  cursor: "pointer",
                }}
              >
                Move to Screening
              </button>

              <button
                type="button"
                onClick={() => handleStageChange("INTERVIEW")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: decisionStage === "INTERVIEW" ? "#ffffff" : "#059669",
                  background: decisionStage === "INTERVIEW" ? "#059669" : "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  cursor: "pointer",
                }}
              >
                Schedule Technical Interview
              </button>

              <button
                type="button"
                onClick={() => handleStageChange("OFFER")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: decisionStage === "OFFER" ? "#ffffff" : "#7c3aed",
                  background: decisionStage === "OFFER" ? "#7c3aed" : "#f5f3ff",
                  border: "1px solid #ddd6fe",
                  cursor: "pointer",
                }}
              >
                Extend Offer
              </button>

              <button
                type="button"
                onClick={() => handleStageChange("REJECTED")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: decisionStage === "REJECTED" ? "#ffffff" : "#dc2626",
                  background: decisionStage === "REJECTED" ? "#dc2626" : "#fef2f2",
                  border: "1px solid #fecaca",
                  cursor: "pointer",
                }}
              >
                Decline Application
              </button>
            </div>

            {decisionFeedback && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "#ecfdf5",
                  borderRadius: "var(--radius-md)",
                  color: "#059669",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Check size={14} />
                <span>{decisionFeedback}</span>
              </div>
            )}

            {/* Private Notes Field */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                Private Employer Evaluation Notes (Masked from candidate)
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Record confidential review remarks..."
                  value={evaluationNote}
                  onChange={(e) => setEvaluationNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "#ffffff",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8rem",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  style={{
                    padding: "8px 16px",
                    background: noteSaved ? "#059669" : "#0f172a",
                    color: "#ffffff",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {noteSaved ? <Check size={14} /> : <Send size={14} />}
                  <span>{noteSaved ? "Saved" : "Save Note"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Neo-Glass Analytics & SLA Performance Cards (Matching Reference Style) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Card 1: Application Review Velocity */}
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Hiring Pipeline Workload
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>30-Day Window</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              5,867
            </span>
            <span style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
              +14.2% applications verified
            </span>
          </div>

          {/* Micro-Bar Graph */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "48px", paddingTop: "8px" }}>
            {[24, 38, 45, 30, 52, 60, 48, 70, 85, 64, 78, 92, 80, 100].map((val, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${val}%`,
                  background: idx >= 11 ? "#10b981" : "#cbd5e1",
                  borderRadius: "3px",
                  transition: "all var(--transition-fast)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Anti-Ghosting SLA Compliance & Average Turnaround */}
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Anti-Ghosting SLA Compliance
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 8px",
                background: "#ecfdf5",
                borderRadius: "var(--radius-full)",
                color: "#059669",
                fontWeight: 600,
              }}
            >
              99.8% On-Time
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              2.1 Days
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Average response turnaround (7-day maximum guaranteed)
            </span>
          </div>

          {/* Smooth Wave Sparkline SVG */}
          <div style={{ width: "100%", height: "48px" }}>
            <svg width="100%" height="48" viewBox="0 0 400 48" preserveAspectRatio="none" fill="none">
              <defs>
                <linearGradient id="slaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 36 C40 38, 80 20, 120 24 C160 28, 200 12, 240 18 C280 24, 320 8, 360 14 C380 16, 400 6, 400 6 L400 48 L0 48 Z"
                fill="url(#slaGradient)"
              />
              <path
                d="M0 36 C40 38, 80 20, 120 24 C160 28, 200 12, 240 18 C280 24, 320 8, 360 14 C380 16, 400 6, 400 6"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
