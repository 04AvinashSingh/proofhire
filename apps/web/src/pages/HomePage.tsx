import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileCode2,
  CheckCircle,
  GitPullRequest,
  Sliders,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Lock,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"candidate" | "employer">("candidate");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", marginBottom: "4.5rem", position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.95rem",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            marginBottom: "1.5rem",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#059669",
          }}
        >
          <Sparkles size={14} />
          <span>Evidence-Based Software Hiring &bull; 7-Day Anti-Ghosting SLA</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
          }}
        >
          Evidence Over <br />
          <span
            style={{
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Keyword Guesswork.
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: "680px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.6,
          }}
        >
          ProofHire enables early-career software developers to prove their practical skills
          through structured project evidence, while engineering teams evaluate candidates against
          explicit rubrics.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/jobs" className="btn btn-primary" style={{ padding: "0.75rem 1.75rem", fontSize: "1rem" }}>
            Explore Engineering Jobs <ArrowRight size={18} />
          </Link>
          <Link
            to="/register/candidate"
            className="btn btn-secondary"
            style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
          >
            Create Evidence Portfolio
          </Link>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="pillars" style={{ marginBottom: "5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            The Four Pillars of ProofHire
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Built around measurable engineering artifacts rather than resume keyword stuffing.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="glass-panel glass-panel-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
                marginBottom: "1.25rem",
              }}
            >
              <FileCode2 size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.6rem" }}>
              Verifiable Code Evidence
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Candidates submit links to repositories, commits, PRs, and architectural diagrams
              linked directly to claimed competencies.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--success)",
                marginBottom: "1.25rem",
              }}
            >
              <Sliders size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.6rem" }}>
              Explicit Rubrics
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              No arbitrary filtering. Job requirements specify required artifacts and clear scoring
              rubrics for objective human evaluation.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--info)",
                marginBottom: "1.25rem",
              }}
            >
              <GitPullRequest size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.6rem" }}>
              Anti-Ghosting SLA
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Transparent application tracking with SLA timers. Candidates always know the review
              status and receive rubric-based feedback.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: "1.75rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--warning)",
                marginBottom: "1.25rem",
              }}
            >
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.6rem" }}>
              Human Decision Authority
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Strict architectural rule: Zero automated rejection. AI assists with evidence
              summarization, but humans always make final hiring choices.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Flow Switcher */}
      <section style={{ marginBottom: "5rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: "0.5rem" }}>
                Platform Experience
              </span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Tailored Role Workflows</h2>
            </div>

            <div
              style={{
                display: "flex",
                background: "var(--bg-secondary)",
                padding: "0.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("candidate")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  background: activeTab === "candidate" ? "var(--accent-primary)" : "transparent",
                  color: activeTab === "candidate" ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                For Candidates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("employer")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  background: activeTab === "employer" ? "var(--accent-primary)" : "transparent",
                  color: activeTab === "employer" ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                For Employers
              </button>
            </div>
          </div>

          {activeTab === "candidate" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ color: "var(--accent-primary)", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Step 01 &bull; Build Evidence Portfolio
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Connect Real Projects</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  Add GitHub repos, live deployments, schema diagrams, and architecture decisions.
                </p>
              </div>
              <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ color: "var(--accent-primary)", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Step 02 &bull; Map to Job Rubrics
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Targeted Submissions</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  Map specific commits and PRs directly to the employer's required competencies.
                </p>
              </div>
              <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ color: "var(--accent-primary)", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Step 03 &bull; Transparent Reviews
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Guaranteed Updates</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  Track your evaluation lifecycle with SLA guarantees and actionable rubric feedback.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ color: "var(--success)", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Step 01 &bull; Define Explicit Rubrics
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Objective Criteria</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  Specify needed skills and what constitutes verified evidence vs self-reported claims.
                </p>
              </div>
              <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ color: "var(--success)", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Step 02 &bull; Evidence Matrix View
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Side-by-Side Review</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  Inspect candidate pull requests, commit histories, and architecture documents in one screen.
                </p>
              </div>
              <div style={{ background: "var(--bg-secondary)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                <div style={{ color: "var(--success)", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Step 03 &bull; Human-in-the-Loop Decisions
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Audit-Grade Hiring</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  Collaborative evaluation notes, structured scorecards, and cross-tenant isolation.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Core Platform Commitments */}
      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <GitPullRequest size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Verified Code & Architecture</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Connect real GitHub repositories, commit histories, and system architecture diagrams.
              Be evaluated on actual engineering craftsmanship, not keyword padding.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <Sliders size={20} color="var(--info)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Objective Skill Rubrics</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Transparent, measurable criteria defined directly by hiring engineering teams.
              Know exactly what skills and evidence are expected before you submit.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <Shield size={20} color="var(--success)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>7-Day Anti-Ghosting Guarantee</h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              No silent rejections or black-hole applications. Every applicant receives a guaranteed
              human status update or decision within 7 calendar days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
