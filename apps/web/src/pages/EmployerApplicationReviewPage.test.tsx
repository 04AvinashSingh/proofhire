import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmployerApplicationReviewPage } from "./EmployerApplicationReviewPage";
import * as api from "../lib/api";

vi.mock("../lib/api");
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: mockEmployerUser,
    activeOrg: mockEmployerUser.organizations[0],
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

const mockEmployerUser = {
  id: "emp-user-1",
  email: "recruiter@acme.dev",
  fullName: "Rachel Recruiter",
  role: "EMPLOYER" as const,
  emailVerified: true,
  accountStatus: "ACTIVE" as const,
  createdAt: new Date().toISOString(),
  organizations: [
    {
      id: "org-1",
      name: "Acme Corp",
      slug: "acme-corp",
      role: "OWNER" as const,
    },
  ],
};

const mockApplicationDetail = {
  id: "app-1",
  jobId: "job-1",
  candidateId: "cand-1",
  candidateName: "Alex Engineer",
  candidateEmail: "alex@proofhire.dev",
  candidateProfileId: "cand-profile-1",
  status: "APPLIED" as const,
  statusHistory: [],
  daysInCurrentStage: 2,
  slaDeadline: new Date(Date.now() + 86400000 * 5).toISOString(),
  slaStatus: "ON_TRACK" as const,
  hoursUntilBreach: 120,
  coverNote: "Excited to apply for this backend role.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  candidate: {
    id: "cand-1",
    fullName: "Alex Engineer",
    email: "alex@proofhire.dev",
    bio: "Backend developer specializing in Node.js and PostgreSQL.",
    yearsExperience: 1,
    skills: [{ id: "sk-1", name: "Node.js", category: "Frameworks" }],
  },
  job: {
    id: "job-1",
    title: "Junior Backend Engineer",
    organisationId: "org-1",
    requirements: [
      {
        id: "req-1",
        requirementText: "Experience with PostgreSQL migrations",
        importance: "REQUIRED" as const,
        evidenceTypeHint: "Link to schema migration",
      },
    ],
  },
  evidenceMappings: [
    {
      id: "map-1",
      jobRequirementId: "req-1",
      evidenceId: "ev-1",
      relevanceScore: 0.9,
      relevanceReason: "Authored schema migration for users table",
      evidence: {
        id: "ev-1",
        title: "Drizzle Migration Schema",
        description: "PostgreSQL migration file with foreign keys",
        isSelfReported: true,
        personalContribution: "Wrote migration 0001 from scratch",
      },
    },
  ],
  evaluationNotes: [],
};

const mockAiAssessment = {
  id: "assess-1",
  applicationId: "app-1",
  requirementId: "req-1",
  supportLevel: "SUPPORTED",
  confidence: 0.89,
  citations: ["Authored Drizzle migration file with foreign keys"],
  limitations: ["No Kubernetes experience found"],
  advisoryNotes: "Candidate directly demonstrates PostgreSQL competence.",
  isSelfReported: true,
  securityWarnings: [],
  rule7Disclaimer:
    "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
  createdAt: new Date().toISOString(),
};

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/organisations/org-1/applications/app-1"]}>
        <Routes>
          <Route
            path="/organisations/:orgId/applications/:appId"
            element={<EmployerApplicationReviewPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("EmployerApplicationReviewPage (AI & Evidence Assessment)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(api.fetchEmployerApplicationDetail).mockResolvedValue(mockApplicationDetail as any);
    vi.mocked(api.fetchAiAssessments).mockResolvedValue([mockAiAssessment]);
  });

  it("renders candidate header, job title, and AI assessment trigger button", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Alex Engineer")).toBeInTheDocument();
      expect(screen.getByText("Analyze All via ProofHire AI")).toBeInTheDocument();
    });
  });

  it("renders grounded AI analysis with verbatim citations and Rule #7 disclaimer", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("ProofHire AI Semantic Analysis")).toBeInTheDocument();
      expect(screen.getByText(/SUPPORTED \(89% confidence\)/)).toBeInTheDocument();
      expect(
        screen.getByText(/Authored Drizzle migration file with foreign keys/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Rule #7 Invariant/)).toBeInTheDocument();
    });
  });

  it("displays Rule #8 Self-Reported badges for candidate evidence", async () => {
    renderComponent();

    await waitFor(() => {
      const badges = screen.getAllByText("Self-Reported");
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
