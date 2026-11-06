import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JobExplorePage } from "./JobExplorePage";
import * as api from "../lib/api";

const mockJobs = [
  {
    id: "job-1-uuid",
    organisationId: "org-1",
    organisationName: "Acme Cloud",
    organisationSlug: "acme-cloud",
    createdBy: "user-1",
    title: "Junior Distributed Systems Engineer",
    description: "Build robust consensus engines in Go and TypeScript.",
    employmentType: "FULL_TIME" as const,
    locationCity: "Bengaluru",
    locationCountry: "India",
    remoteType: "REMOTE" as const,
    salaryMin: 900000,
    salaryMax: 1500000,
    salaryCurrency: "INR",
    applicationDeadline: null,
    status: "PUBLISHED" as const,
    publishedAt: new Date().toISOString(),
    closedAt: null,
    requirements: [
      {
        id: "req-1",
        jobId: "job-1-uuid",
        requirementText: "Relational schema design and query optimization",
        importance: "REQUIRED" as const,
        evidenceTypeHint: "Link to schema migration or PR",
        skillTags: ["PostgreSQL", "SQL"],
        sortOrder: 0,
        createdAt: new Date().toISOString(),
      },
    ],
    applicationCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function renderWithClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <JobExplorePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("JobExplorePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders search input, filter controls, and headline", () => {
    vi.spyOn(api, "searchJobs").mockResolvedValue([]);
    renderWithClient();

    expect(screen.getByText(/Explore Evidence-Based Engineering Roles/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search by role title, technology, or keywords.../i)
    ).toBeInTheDocument();
  });

  it("renders published jobs with 7-Day Anti-Ghosting SLA and requirement badges", async () => {
    vi.spyOn(api, "searchJobs").mockResolvedValue(mockJobs);
    renderWithClient();

    expect(
      await screen.findByText("Junior Distributed Systems Engineer")
    ).toBeInTheDocument();
    expect(screen.getByText("Acme Cloud")).toBeInTheDocument();
    expect(screen.getByText(/7-Day SLA Guaranteed/i)).toBeInTheDocument();
    expect(screen.getByText(/Relational schema design/i)).toBeInTheDocument();
    expect(screen.getByText(/View Rubrics & Apply/i)).toBeInTheDocument();
  });

  it("displays empty state when no jobs match the query", async () => {
    vi.spyOn(api, "searchJobs").mockResolvedValue([]);
    renderWithClient();

    expect(await screen.findByText("No engineering roles found")).toBeInTheDocument();
  });
});
