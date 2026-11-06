import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CandidateApplicationsPage } from "./CandidateApplicationsPage";
import * as api from "../lib/api";
import type { CandidateApplicationSummaryDto } from "@proofhire/shared-contracts";

const mockApplications: CandidateApplicationSummaryDto[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Full-Stack Engineer",
    organisationName: "Tech Corp",
    status: "APPLIED",
    coverNote: "Experienced in TypeScript and React.",
    slaDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: "ON_TRACK",
    daysInCurrentStage: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: "h-1",
        applicationId: "app-1",
        fromStatus: null,
        toStatus: "APPLIED",
        changedBy: "user-1",
        reason: "Submitted",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "app-2",
    jobId: "job-2",
    jobTitle: "Backend Systems Lead",
    organisationName: "Cloud Systems",
    status: "SCREENING",
    coverNote: "Raft consensus implementation submitted.",
    slaDeadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: "BREACHED",
    daysInCurrentStage: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: "h-2",
        applicationId: "app-2",
        fromStatus: "APPLIED",
        toStatus: "SCREENING",
        changedBy: "emp-1",
        reason: "Code evidence approved",
        createdAt: new Date().toISOString(),
      },
    ],
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
        <CandidateApplicationsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CandidateApplicationsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page title and value proposition", () => {
    vi.spyOn(api, "fetchCandidateApplications").mockResolvedValue([]);
    renderWithClient();

    expect(screen.getByText("Anti-Ghosting Application Tracker")).toBeInTheDocument();
  });

  it("displays applications with SLA badges and timeline stages", async () => {
    vi.spyOn(api, "fetchCandidateApplications").mockResolvedValue(mockApplications);
    renderWithClient();

    expect(await screen.findByText("Full-Stack Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Review SLA On Track/i)).toBeInTheDocument();

    expect(screen.getByText("Backend Systems Lead")).toBeInTheDocument();
    expect(screen.getByText(/SLA Breached \(8 days in stage\)/i)).toBeInTheDocument();
  });

  it("renders empty state when candidate has no submitted applications", async () => {
    vi.spyOn(api, "fetchCandidateApplications").mockResolvedValue([]);
    renderWithClient();

    expect(await screen.findByText("No Applications Submitted Yet")).toBeInTheDocument();
    expect(screen.getByText(/Explore Open Engineering Positions/i)).toBeInTheDocument();
  });
});
