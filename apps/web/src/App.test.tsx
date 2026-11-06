import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { App } from "./App";
import * as api from "./lib/api";

describe("Web Application Shell & Auth Views", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default: unauthenticated
    vi.spyOn(api, "fetchMe").mockRejectedValue(new Error("Unauthenticated"));
  });

  it("renders the ProofHire header and branding with Sign In link", async () => {
    render(<App />);

    expect(screen.getByText("Proof")).toBeInTheDocument();
    expect(screen.getByText("Hire")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders the hero headline and value proposition", () => {
    render(<App />);

    expect(screen.getByText(/Evidence Over/i)).toBeInTheDocument();
    expect(screen.getByText(/Keyword Guesswork/i)).toBeInTheDocument();
  });

  it("renders Milestone 2 architectural invariants in the footer", () => {
    render(<App />);

    expect(screen.getByText(/Argon2id Password Hashing/i)).toBeInTheDocument();
    expect(screen.getByText(/HttpOnly Secure Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Cross-Tenant Isolation/i)).toBeInTheDocument();
  });

  it("shows authenticated user name and Logout button when session exists", async () => {
    vi.spyOn(api, "fetchMe").mockResolvedValueOnce({
      user: {
        id: "mock-user-id",
        email: "alex@proofhire.dev",
        fullName: "Alex Engineer",
        role: "CANDIDATE",
        emailVerified: true,
        accountStatus: "ACTIVE",
        createdAt: new Date().toISOString(),
        organizations: [],
      },
    });

    render(<App />);

    expect(await screen.findByText("Alex Engineer")).toBeInTheDocument();
    expect(screen.getByText("CANDIDATE")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
