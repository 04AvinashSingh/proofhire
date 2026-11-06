import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicPortfolioPage } from "./PublicPortfolioPage";
import * as api from "../lib/api";

const mockPortfolioData = {
  profile: {
    id: "f8c3d9a1-5e2b-4c7a-9f1e-8a7b6c5d4e3f",
    userId: "u1c3d9a1-5e2b-4c7a-9f1e-8a7b6c5d4e3f",
    bio: "Passionate full-stack systems engineer focused on high-throughput backend services and distributed systems.",
    locationCity: "San Francisco",
    locationCountry: "USA",
    status: "ACTIVELY_LOOKING" as const,
    visibility: "PUBLIC" as const,
    yearsExperience: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  fullName: "Jordan Lee",
  email: "jordan@example.com",
  skills: [
    {
      id: "s1-uuid",
      skillName: "TypeScript",
      proficiency: "ADVANCED" as const,
      category: "Languages" as const,
      isSelfReported: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "s2-uuid",
      skillName: "PostgreSQL",
      proficiency: "INTERMEDIATE" as const,
      category: "Databases" as const,
      isSelfReported: true,
      createdAt: new Date().toISOString(),
    },
  ],
  education: [
    {
      id: "e1-uuid",
      institution: "UC Berkeley",
      degree: "B.S.",
      fieldOfStudy: "Computer Science",
      startYear: 2019,
      endYear: 2023,
      description: "Focus on Distributed Systems and Software Architecture",
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  experience: [
    {
      id: "exp1-uuid",
      companyName: "Acme Cloud",
      roleTitle: "Software Engineer",
      employmentType: "FULL_TIME",
      startDate: "2023-06",
      endDate: null,
      isCurrent: true,
      responsibilities: "Designed event pipeline handling 10k events/sec.",
      technologies: ["Node.js", "Redis", "Kafka"],
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: "p1-uuid",
      candidateId: "f8c3d9a1-5e2b-4c7a-9f1e-8a7b6c5d4e3f",
      name: "Distributed Event Bus",
      description: "Low-latency in-memory message broker with replication and consensus.",
      roleInProject: "SOLE_DEVELOPER" as const,
      teamSize: null,
      personalContribution: "Implemented Raft consensus algorithm from scratch in TypeScript, designed zero-copy buffer serializer, and benchmarked 50k ops/sec.",
      githubUrl: "https://github.com/jordan/event-bus",
      projectUrl: null,
      demoUrl: "https://demo.eventbus.dev",
      isTeamProject: false,
      startDate: "2023-01",
      endDate: "2023-05",
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: [
        {
          id: "ev1-uuid",
          projectId: "p1-uuid",
          evidenceType: "GITHUB_URL" as const,
          title: "Raft Consensus Core Implementation",
          description: "Pull request demonstrating election timeout logic and log compaction.",
          url: "https://github.com/jordan/event-bus/pull/12",
          filePath: null,
          personalContribution: "Wrote all consensus test matrices and state machine replication.",
          isSelfReported: true,
          skillTags: ["TypeScript", "Distributed Systems"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ],
};

function renderWithClient(candidateId = "f8c3d9a1-5e2b-4c7a-9f1e-8a7b6c5d4e3f") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/portfolio/${candidateId}`]}>
        <Routes>
          <Route path="/portfolio/:candidateId" element={<PublicPortfolioPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PublicPortfolioPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    vi.spyOn(api, "fetchPortfolio").mockReturnValue(new Promise(() => {}));
    renderWithClient();
    expect(screen.getByText(/Loading candidate evidence portfolio/i)).toBeInTheDocument();
  });

  it("renders candidate header, bio, and key statistics when loaded", async () => {
    vi.spyOn(api, "fetchPortfolio").mockResolvedValue(mockPortfolioData);
    renderWithClient();

    expect(await screen.findByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText(/Passionate full-stack systems engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, USA/i)).toBeInTheDocument();
    expect(screen.getByText(/3 years experience/i)).toBeInTheDocument();
    expect(screen.getByText("Distributed Event Bus")).toBeInTheDocument();
  });

  it("displays mandatory Rule #8 Self-Reported Evidence notices and badges", async () => {
    vi.spyOn(api, "fetchPortfolio").mockResolvedValue(mockPortfolioData);
    renderWithClient();

    expect(await screen.findByText(/Candidate Self-Reported Evidence Notice/i)).toBeInTheDocument();

    const selfReportedBadges = screen.getAllByText("Self-Reported");
    expect(selfReportedBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("displays personal contribution highlight box with candidate disclosure", async () => {
    vi.spyOn(api, "fetchPortfolio").mockResolvedValue(mockPortfolioData);
    renderWithClient();

    expect(
      await screen.findByText(/Personal Contribution & Architectural Responsibility/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Implemented Raft consensus algorithm from scratch in TypeScript/i)
    ).toBeInTheDocument();
  });

  it("renders error state when portfolio cannot be loaded", async () => {
    vi.spyOn(api, "fetchPortfolio").mockRejectedValue(new Error("Candidate portfolio not found"));
    renderWithClient("invalid-id");

    expect(await screen.findByText("Portfolio Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Candidate portfolio not found")).toBeInTheDocument();
  });
});
