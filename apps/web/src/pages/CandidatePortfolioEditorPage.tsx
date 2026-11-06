import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type {
  SkillCategory,
  SkillProficiency,
  ProjectRole,
  EvidenceType,
} from "@proofhire/shared-contracts";
import {
  Code,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  FileText,
  Upload,
  CheckCircle,
  Eye,
  Sparkles,
  AlertCircle,
  FolderGit2,
} from "lucide-react";

export const CandidatePortfolioEditorPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const profileQuery = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: api.fetchCandidateProfile,
  });

  const skillsQuery = useQuery({
    queryKey: ["candidate-skills"],
    queryFn: api.fetchSkills,
  });

  const experienceQuery = useQuery({
    queryKey: ["candidate-experience"],
    queryFn: api.fetchExperience,
  });

  const projectsQuery = useQuery({
    queryKey: ["candidate-projects"],
    queryFn: api.fetchProjects,
  });

  // Local Form States
  const [activeTab, setActiveTab] = useState<"profile" | "skills" | "experience" | "projects">("projects");

  // Profile Form State
  const [bio, setBio] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [status, setStatus] = useState<string>("ACTIVELY_LOOKING");
  const [visibility, setVisibility] = useState<string>("PUBLIC");
  const [yearsExperience, setYearsExperience] = useState<number>(1);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Skill Form State
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState<SkillCategory>("Languages");
  const [skillProficiency, setSkillProficiency] = useState<SkillProficiency>("INTERMEDIATE");

  // Project Form State
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectRole, setProjectRole] = useState<ProjectRole>("SOLE_DEVELOPER");
  const [personalContribution, setPersonalContribution] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [isTeamProject, setIsTeamProject] = useState(false);

  // Evidence Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("GITHUB_URL");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceContribution, setEvidenceContribution] = useState("");
  const [evidenceTags, setEvidenceTags] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: api.updateCandidateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-profile"] });
      setProfileMsg("Profile updated successfully!");
      setTimeout(() => setProfileMsg(null), 3000);
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: api.addSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-skills"] });
      setSkillName("");
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: api.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-skills"] });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-projects"] });
      setProjectName("");
      setProjectDescription("");
      setPersonalContribution("");
      setGithubUrl("");
      setDemoUrl("");
      setIsTeamProject(false);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-projects"] });
    },
  });

  const addEvidenceMutation = useMutation({
    mutationFn: ({ projectId, dto }: { projectId: string; dto: any }) =>
      api.addProjectEvidence(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-projects"] });
      setSelectedProjectId(null);
      setEvidenceTitle("");
      setEvidenceDescription("");
      setEvidenceUrl("");
      setEvidenceContribution("");
      setEvidenceTags("");
      setEvidenceFile(null);
    },
  });

  // Initialize profile form once fetched
  React.useEffect(() => {
    if (profileQuery.data) {
      setBio(profileQuery.data.bio || "");
      setLocationCity(profileQuery.data.locationCity || "");
      setLocationCountry(profileQuery.data.locationCountry || "");
      setStatus(profileQuery.data.status || "ACTIVELY_LOOKING");
      setVisibility(profileQuery.data.visibility || "PUBLIC");
      setYearsExperience(profileQuery.data.yearsExperience || 0);
    }
  }, [profileQuery.data]);

  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    let filePath: string | null = null;

    if (evidenceFile) {
      setIsUploading(true);
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(evidenceFile);
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1] || "");
          };
          reader.onerror = reject;
        });

        const uploaded = await api.uploadArtifact(
          evidenceFile.name,
          evidenceFile.type || "application/pdf",
          base64Data
        );
        filePath = uploaded.filePath;
      } catch (err: any) {
        alert("File upload failed: " + err.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const tags = evidenceTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addEvidenceMutation.mutate({
      projectId: selectedProjectId,
      dto: {
        evidenceType,
        title: evidenceTitle,
        description: evidenceDescription,
        url: evidenceUrl || null,
        filePath,
        personalContribution: evidenceContribution,
        skillTags: tags.length > 0 ? tags : ["General"],
      },
    });
  };

  const candidateProfileId = profileQuery.data?.id;

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "3rem 1.5rem" }}>
      {/* Top Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span className="badge badge-indigo">Portfolio Studio</span>
            <span className="badge badge-success">Verified Artifacts</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            Evidence Portfolio & Profile Manager
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            Replace keyword claims with real code repositories, architecture diagrams, and commit histories.
          </p>
        </div>

        {candidateProfileId && (
          <Link
            to={`/portfolio/${candidateProfileId}`}
            target="_blank"
            className="btn btn-primary"
            style={{ fontSize: "0.9rem", padding: "0.6rem 1.15rem" }}
          >
            <Eye size={16} /> View Public Portfolio
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "2rem",
          overflowX: "auto",
        }}
      >
        {[
          { key: "projects", label: "Projects & Evidence", icon: FolderGit2 },
          { key: "skills", label: "Skills Inventory", icon: Code },
          { key: "profile", label: "Profile & Visibility", icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.92rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={16} color={isActive ? "var(--accent-primary)" : "inherit"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROJECTS & EVIDENCE */}
      {activeTab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Create Project Form Card */}
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={18} color="var(--accent-primary)" /> Add Engineering Project
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              Showcase projects you've personally developed. Explicit contributions are required.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProjectMutation.mutate({
                  name: projectName,
                  description: projectDescription,
                  roleInProject: projectRole,
                  personalContribution,
                  githubUrl: githubUrl || null,
                  demoUrl: demoUrl || null,
                  isTeamProject,
                });
              }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
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
                  Your Role in Project *
                </label>
                <select
                  value={projectRole}
                  onChange={(e) => setProjectRole(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="SOLE_DEVELOPER">Sole Developer</option>
                  <option value="LEAD">Technical Lead</option>
                  <option value="CONTRIBUTOR">Core Contributor</option>
                  <option value="REVIEWER">Architecture Reviewer</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Project Overview & Problem Solved *
                </label>
                <textarea
                  required
                  rows={2}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe the system architecture, challenges, and throughput goals..."
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Your Personal Contribution (Required) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={personalContribution}
                  onChange={(e) => setPersonalContribution(e.target.value)}
                  placeholder="Explicitly detail what you individually engineered (e.g. designed the schema, authored the Raft RPC handler)..."
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
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
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
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
                  Live Deployment / Demo URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://project-demo.com"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="isTeamProject"
                  checked={isTeamProject}
                  onChange={(e) => setIsTeamProject(e.target.checked)}
                  style={{ accentColor: "var(--accent-primary)", width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="isTeamProject" style={{ fontSize: "0.88rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  This was a collaborative / team project (requires team size or role clarification)
                </label>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="btn btn-primary"
                >
                  <Plus size={16} /> Save Project
                </button>
              </div>
            </form>
          </div>

          {/* Projects List */}
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
              Your Project Evidence Portfolio ({projectsQuery.data?.length || 0})
            </h3>

            {projectsQuery.data && projectsQuery.data.length === 0 && (
              <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <FolderGit2 size={36} color="var(--text-tertiary)" style={{ marginBottom: "0.75rem" }} />
                <p>No projects added yet. Create your first project above to link verifiable evidence.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {projectsQuery.data?.map((project) => (
                <div key={project.id} className="glass-panel" style={{ padding: "1.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <h4 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{project.name}</h4>
                        <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>
                          {project.roleInProject}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                        {project.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                        >
                          <Github size={14} /> Repository
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
                        >
                          <ExternalLink size={14} /> Live Demo
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteProjectMutation.mutate(project.id)}
                        className="btn btn-outline"
                        style={{ padding: "0.35rem 0.65rem", color: "var(--danger)" }}
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Personal Contribution Box */}
                  <div
                    style={{
                      background: "rgba(99, 102, 241, 0.06)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem",
                      marginBottom: "1.25rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#a5b4fc" }}>Individual Contribution: </span>
                    <span style={{ color: "var(--text-secondary)" }}>{project.personalContribution}</span>
                  </div>

                  {/* Linked Evidence Section */}
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        Linked Evidence ({project.evidence?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedProjectId(project.id)}
                        className="btn btn-outline"
                        style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                      >
                        <Plus size={13} /> Link Evidence
                      </button>
                    </div>

                    {project.evidence?.length === 0 && (
                      <div style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
                        No evidence linked yet. Link a PR URL, commit, or architectural diagram to prove this project.
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                      {project.evidence?.map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-md)",
                            padding: "1rem",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{ev.title}</span>
                            <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>
                              {ev.evidenceType}
                            </span>
                          </div>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginBottom: "0.5rem" }}>
                            {ev.description}
                          </p>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.65rem" }}>
                            {ev.skillTags?.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  background: "rgba(255, 255, 255, 0.06)",
                                  padding: "0.15rem 0.45rem",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "0.72rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>
                              Self-Reported
                            </span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {ev.url ? (
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: "0.78rem", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}
                              >
                                <ExternalLink size={12} /> Inspect Evidence
                              </a>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                                File Artifact Stored
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => api.deleteProjectEvidence(project.id, ev.id).then(() => queryClient.invalidateQueries({ queryKey: ["candidate-projects"] }))}
                              style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: "0.2rem" }}
                              title="Delete evidence"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Evidence Modal */}
          {selectedProjectId && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: "1rem",
              }}
            >
              <div
                className="glass-panel"
                style={{
                  maxWidth: "520px",
                  width: "100%",
                  padding: "2rem",
                  background: "var(--bg-primary)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Link Evidence Item</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId(null)}
                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer" }}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleEvidenceSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      Evidence Type
                    </label>
                    <select
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                      }}
                    >
                      <option value="GITHUB_URL">GitHub PR / Commit URL</option>
                      <option value="URL">Deployment / Public URL</option>
                      <option value="UPLOADED_FILE">Architecture Diagram / Document (PDF, PNG, SVG)</option>
                      <option value="WRITTEN_EXPLANATION">Written Technical Explanation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      Evidence Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      placeholder="e.g. Raft Leader Election PR"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                      }}
                    />
                  </div>

                  {evidenceType === "UPLOADED_FILE" ? (
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                        Upload Architecture Diagram or PDF (Max 10MB)
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                        style={{
                          width: "100%",
                          padding: "0.55rem",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-medium)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--text-primary)",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                        Evidence URL
                      </label>
                      <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-medium)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--text-primary)",
                          fontSize: "0.88rem",
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      Description & What This Demonstrates *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={evidenceDescription}
                      onChange={(e) => setEvidenceDescription(e.target.value)}
                      placeholder="Highlights the concurrency patterns and automated unit tests..."
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      Personal Contribution to this Item *
                    </label>
                    <input
                      type="text"
                      required
                      value={evidenceContribution}
                      onChange={(e) => setEvidenceContribution(e.target.value)}
                      placeholder="e.g. Sole author of commit 4b2f19"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      Demonstrated Skills (comma-separated tags) *
                    </label>
                    <input
                      type="text"
                      required
                      value={evidenceTags}
                      onChange={(e) => setEvidenceTags(e.target.value)}
                      placeholder="Go, Concurrency, Raft, Distributed Systems"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-medium)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || addEvidenceMutation.isPending}
                      className="btn btn-primary"
                    >
                      {isUploading ? "Uploading File..." : "Attach Evidence"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SKILLS INVENTORY */}
      {activeTab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Add Claimed Competency
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
              Claimed competencies will be mapped to project evidence and evaluation rubrics.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSkillMutation.mutate({
                  skillName,
                  category: skillCategory,
                  proficiency: skillProficiency,
                });
              }}
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}
            >
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. TypeScript, PostgreSQL, Docker"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ flex: "1 1 150px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Category
                </label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="Languages">Languages</option>
                  <option value="Frameworks">Frameworks</option>
                  <option value="Databases">Databases</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div style={{ flex: "1 1 150px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Proficiency
                </label>
                <select
                  value={skillProficiency}
                  onChange={(e) => setSkillProficiency(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addSkillMutation.isPending}
                className="btn btn-primary"
                style={{ padding: "0.65rem 1.25rem" }}
              >
                <Plus size={16} /> Add Skill
              </button>
            </form>
          </div>

          {/* Categorized Skills View */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {(["Languages", "Frameworks", "Databases", "Tools"] as SkillCategory[]).map((cat) => {
              const catSkills = skillsQuery.data?.filter((s) => s.category === cat) || [];
              return (
                <div key={cat} className="glass-panel" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{cat}</h4>
                    <span className="badge badge-indigo" style={{ fontSize: "0.68rem" }}>
                      {catSkills.length}
                    </span>
                  </div>

                  {catSkills.length === 0 ? (
                    <div style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>None added yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {catSkills.map((skill) => (
                        <div
                          key={skill.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--bg-secondary)",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{skill.skillName}</span>
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.7rem",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {skill.proficiency} &bull; Self-Reported
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteSkillMutation.mutate(skill.id)}
                            style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}
                            title="Remove skill"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE & VISIBILITY */}
      {activeTab === "profile" && (
        <div className="glass-panel" style={{ padding: "2.5rem", maxWidth: "680px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Candidate Profile & Privacy Controls
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
            Configure how your evidence portfolio is displayed and discoverable by employers.
          </p>

          {profileMsg && (
            <div
              style={{
                background: "var(--success-subtle)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
                fontSize: "0.85rem",
              }}
            >
              {profileMsg}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate({
                bio,
                locationCity,
                locationCountry,
                status: status as any,
                visibility: visibility as any,
                yearsExperience: Number(yearsExperience),
              });
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Bio / Engineering Statement (Max 500 characters)
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Software engineer focused on distributed systems and type-safe APIs..."
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  City
                </label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
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
                  Country
                </label>
                <input
                  type="text"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  placeholder="e.g. India"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Job Search Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="ACTIVELY_LOOKING">Actively Looking</option>
                  <option value="OPEN">Open to Offers</option>
                  <option value="STUDENT">Student / New Grad</option>
                  <option value="NOT_LOOKING">Not Looking</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Profile Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="PUBLIC">Public (Visible to all employers)</option>
                  <option value="APPLIED_ONLY">Applied Only (Visible after job apply)</option>
                  <option value="PRIVATE">Private (Only you can view)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Years of Professional Experience
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
