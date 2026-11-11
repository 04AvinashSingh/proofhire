import type {
  HealthCheckResponse,
  ReadinessCheckResponse,
  AuthUser,
  RegisterCandidateRequest,
  RegisterEmployerRequest,
  LoginRequest,
  SessionResponse,
  CreateOrganizationRequest,
  ApiSuccessResponse,
  ApiErrorResponse,
  UpdateCandidateProfileRequest,
  AddSkillRequest,
  AddEducationRequest,
  AddExperienceRequest,
  CreateProjectRequest,
  AddProjectEvidenceRequest,
  CandidatePortfolioDto,
  CandidateSkillDto,
  CandidateEducationDto,
  CandidateExperienceDto,
  ProjectDto,
  JobDto,
  CreateJobRequest,
  UpdateJobRequest,
  JobSearchQuery,
  ApplyToJobRequest,
  UpdateApplicationStatusRequest,
  CreateEvaluationNoteRequest,
  CandidateApplicationSummaryDto,
  ApplicationDetailDto,
  EvaluationNoteDto,
} from "@proofhire/shared-contracts";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3] || "") : null;
}

export function getCsrfToken(): string | null {
  return getCookie("proofhire_csrf");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const method = options.method?.toUpperCase() || "GET";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let body: any = null;
  const text = await res.text();
  if (text && text.trim().length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const errorBody = body as ApiErrorResponse | null;
    const message =
      errorBody?.error?.message ||
      (body?.message as string) ||
      `Request to ${path} failed with status ${res.status}${res.statusText ? ` (${res.statusText})` : ""}`;
    throw new Error(message);
  }

  const successBody = body as ApiSuccessResponse<T>;
  return successBody ? successBody.data : ({} as T);
}

// Probes
export async function fetchHealth(): Promise<HealthCheckResponse> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchReadiness(): Promise<ReadinessCheckResponse> {
  const res = await fetch(`${API_BASE}/ready`);
  return res.json();
}

// Auth
export async function fetchMe(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>("/api/v1/auth/me");
}

export async function login(dto: LoginRequest): Promise<SessionResponse> {
  return request<SessionResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function registerCandidate(dto: RegisterCandidateRequest) {
  return request<{ id: string; email: string; fullName: string; role: string }>(
    "/api/v1/auth/register/candidate",
    {
      method: "POST",
      body: JSON.stringify(dto),
    }
  );
}

export async function registerEmployer(dto: RegisterEmployerRequest) {
  return request<{ id: string; email: string; fullName: string; organizationId: string }>(
    "/api/v1/auth/register/employer",
    {
      method: "POST",
      body: JSON.stringify(dto),
    }
  );
}

export async function logout(): Promise<{ message: string }> {
  return request<{ message: string }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

// Organizations
export async function fetchOrganization(orgId: string) {
  return request<any>(`/api/v1/organisations/${orgId}`);
}

export async function fetchOrgMembers(orgId: string) {
  return request<any[]>(`/api/v1/organisations/${orgId}/members`);
}

export async function createOrganization(dto: CreateOrganizationRequest) {
  return request<any>("/api/v1/organisations", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// Candidate Profile & Portfolio
export async function fetchCandidateProfile() {
  return request<any>("/api/v1/candidates/profile");
}

export async function updateCandidateProfile(dto: UpdateCandidateProfileRequest) {
  return request<any>("/api/v1/candidates/profile", {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function fetchSkills(): Promise<CandidateSkillDto[]> {
  return request<CandidateSkillDto[]>("/api/v1/candidates/skills");
}

export async function addSkill(dto: AddSkillRequest): Promise<CandidateSkillDto> {
  return request<CandidateSkillDto>("/api/v1/candidates/skills", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteSkill(skillId: string) {
  return request<{ message: string }>(`/api/v1/candidates/skills/${skillId}`, {
    method: "DELETE",
  });
}

export async function fetchEducation(): Promise<CandidateEducationDto[]> {
  return request<CandidateEducationDto[]>("/api/v1/candidates/education");
}

export async function addEducation(dto: AddEducationRequest): Promise<CandidateEducationDto> {
  return request<CandidateEducationDto>("/api/v1/candidates/education", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteEducation(id: string) {
  return request<{ message: string }>(`/api/v1/candidates/education/${id}`, {
    method: "DELETE",
  });
}

export async function fetchExperience(): Promise<CandidateExperienceDto[]> {
  return request<CandidateExperienceDto[]>("/api/v1/candidates/experience");
}

export async function addExperience(dto: AddExperienceRequest): Promise<CandidateExperienceDto> {
  return request<CandidateExperienceDto>("/api/v1/candidates/experience", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteExperience(id: string) {
  return request<{ message: string }>(`/api/v1/candidates/experience/${id}`, {
    method: "DELETE",
  });
}

export async function fetchProjects(): Promise<ProjectDto[]> {
  return request<ProjectDto[]>("/api/v1/candidates/projects");
}

export async function createProject(dto: CreateProjectRequest): Promise<ProjectDto> {
  return request<ProjectDto>("/api/v1/candidates/projects", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteProject(projectId: string) {
  return request<{ message: string }>(`/api/v1/candidates/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function addProjectEvidence(
  projectId: string,
  dto: AddProjectEvidenceRequest
) {
  return request<any>(`/api/v1/candidates/projects/${projectId}/evidence`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteProjectEvidence(projectId: string, evidenceId: string) {
  return request<{ message: string }>(
    `/api/v1/candidates/projects/${projectId}/evidence/${evidenceId}`,
    {
      method: "DELETE",
    }
  );
}

export async function uploadArtifact(fileName: string, mimeType: string, base64Data: string) {
  return request<{ fileName: string; size: number; filePath: string }>(
    "/api/v1/candidates/artifacts/upload",
    {
      method: "POST",
      body: JSON.stringify({ fileName, mimeType, base64Data }),
    }
  );
}

export async function fetchPortfolio(candidateId: string): Promise<CandidatePortfolioDto> {
  return request<CandidatePortfolioDto>(`/api/v1/candidates/portfolio/${candidateId}`);
}

// Jobs
export async function searchJobs(params?: Partial<JobSearchQuery>) {
  const query = new URLSearchParams();
  if (params?.keyword) query.set("keyword", params.keyword);
  if (params?.employmentType) query.set("employmentType", params.employmentType);
  if (params?.remoteType) query.set("remoteType", params.remoteType);
  if (params?.location) query.set("location", params.location);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());

  const qs = query.toString() ? `?${query.toString()}` : "";
  return request<JobDto[]>(`/api/v1/jobs${qs}`);
}

export async function fetchJob(jobId: string): Promise<JobDto> {
  return request<JobDto>(`/api/v1/jobs/${jobId}`);
}

export async function createOrgJob(orgId: string, dto: CreateJobRequest): Promise<JobDto> {
  return request<JobDto>(`/api/v1/organisations/${orgId}/jobs`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function fetchOrgJobs(orgId: string): Promise<JobDto[]> {
  return request<JobDto[]>(`/api/v1/organisations/${orgId}/jobs`);
}

export async function updateOrgJob(orgId: string, jobId: string, dto: UpdateJobRequest): Promise<JobDto> {
  return request<JobDto>(`/api/v1/organisations/${orgId}/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

// Applications
export async function applyToJob(
  jobId: string,
  dto: ApplyToJobRequest
): Promise<CandidateApplicationSummaryDto> {
  return request<CandidateApplicationSummaryDto>(`/api/v1/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function fetchCandidateApplications(): Promise<CandidateApplicationSummaryDto[]> {
  return request<CandidateApplicationSummaryDto[]>("/api/v1/candidates/applications");
}

export async function fetchEmployerJobApplications(orgId: string, jobId: string) {
  return request<any[]>(`/api/v1/organisations/${orgId}/jobs/${jobId}/applications`);
}

export async function fetchEmployerApplicationDetail(
  orgId: string,
  appId: string
): Promise<ApplicationDetailDto> {
  return request<ApplicationDetailDto>(`/api/v1/organisations/${orgId}/applications/${appId}`);
}

export async function updateApplicationStatus(
  orgId: string,
  appId: string,
  dto: UpdateApplicationStatusRequest
): Promise<ApplicationDetailDto> {
  return request<ApplicationDetailDto>(`/api/v1/organisations/${orgId}/applications/${appId}/status`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function addEvaluationNote(
  orgId: string,
  appId: string,
  dto: CreateEvaluationNoteRequest
): Promise<EvaluationNoteDto> {
  return request<EvaluationNoteDto>(`/api/v1/organisations/${orgId}/applications/${appId}/notes`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function triggerAiAssessment(
  appId: string,
  requirementId?: string
): Promise<{ assessments: any[]; status: string; message: string }> {
  const query = requirementId ? `?requirementId=${encodeURIComponent(requirementId)}` : "";
  return request<{ assessments: any[]; status: string; message: string }>(
    `/api/v1/applications/${appId}/ai-assessment${query}`,
    {
      method: "POST",
    }
  );
}

export async function fetchAiAssessments(appId: string): Promise<any[]> {
  return request<any[]>(`/api/v1/applications/${appId}/ai-assessment`);
}

export async function verifyEvidenceItem(dto: {
  evidenceId: string;
  evidenceType: string;
  repoUrl?: string;
  commitHash?: string;
  artifactUrl?: string;
}): Promise<any> {
  return request<any>("/api/v1/evidence/verify", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}


