import { db, pool } from "./index.js";
import { users, projects, projectEvidence } from "./schema/index.js";
import { AuthService } from "../services/authService.js";
import { JobService } from "../services/jobService.js";
import { CandidateProfileService } from "../services/candidateProfileService.js";
import { ApplicationService } from "../services/applicationService.js";
import { logger } from "../logger.js";
import { eq } from "drizzle-orm";

export async function runSeed() {
  logger.info("🌱 Seeding ProofHire database for local interactive demo...");

  // 1. Check or create Employer & Organisation
  let employerUser = (
    await db.select().from(users).where(eq(users.email, "recruiter@acme.com"))
  )[0];

  let orgId: string;
  let employerId: string;

  if (!employerUser) {
    logger.info("Creating employer account: recruiter@acme.com / Password123!");
    const empResult = await AuthService.registerEmployer({
      email: "recruiter@acme.com",
      password: "Password123!",
      fullName: "Rachel Recruiter",
      organizationName: "Acme Cloud Labs",
      organizationSlug: "acme-cloud",
    });
    employerId = empResult.id;
    orgId = empResult.organizationId;
  } else {
    employerId = employerUser.id;
    const org = await db.query.organisations.findFirst({
      where: (tbl, { eq }) => eq(tbl.slug, "acme-cloud"),
    });
    orgId = org!.id;
  }

  // 2. Create Published Jobs
  let backendJob = (
    await db.query.jobs.findFirst({
      where: (tbl, { eq }) => eq(tbl.title, "Junior Backend Systems Engineer"),
    })
  );

  if (!backendJob) {
    logger.info("Creating job: Junior Backend Systems Engineer");
    const createdJob = await JobService.createJob(orgId, employerId, {
      title: "Junior Backend Systems Engineer",
      description:
        "We are looking for an ambitious early-career backend engineer passionate about distributed systems, API design, and TypeScript. You will help build high-throughput microservices and data pipelines.",
      employmentType: "FULL_TIME",
      remoteType: "HYBRID",
      locationCity: "Bengaluru",
      locationCountry: "India",
      salaryMin: 900000,
      salaryMax: 1500000,
      salaryCurrency: "INR",
      requirements: [
        {
          requirementText: "API Design & Data Modeling in PostgreSQL & TypeScript",
          importance: "REQUIRED",
          evidenceTypeHint: "GITHUB_REPO",
          skillTags: ["typescript", "postgresql", "rest", "api-design"],
          sortOrder: 0,
        },
        {
          requirementText: "Concurrency, Caching & Performance (Redis / In-Memory)",
          importance: "PREFERRED",
          evidenceTypeHint: "GITHUB_REPO",
          skillTags: ["redis", "concurrency", "caching", "performance"],
          sortOrder: 1,
        },
        {
          requirementText: "Automated Testing, CI/CD & Code Quality (Vitest / Jest)",
          importance: "REQUIRED",
          evidenceTypeHint: "GITHUB_REPO",
          skillTags: ["vitest", "jest", "ci-cd", "unit-testing"],
          sortOrder: 2,
        },
      ],
    });

    const published = await JobService.updateJob(createdJob.id, orgId, employerId, {
      status: "PUBLISHED",
    });
    backendJob = await db.query.jobs.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, published.id),
    });
  } else if (backendJob.status !== "PUBLISHED") {
    logger.info("Publishing existing draft job: Junior Backend Systems Engineer");
    const published = await JobService.updateJob(backendJob.id, orgId, employerId, {
      status: "PUBLISHED",
    });
    backendJob = await db.query.jobs.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, published.id),
    });
  }

  // 3. Create Candidate
  let candidateUser = (
    await db.select().from(users).where(eq(users.email, "alex.dev@example.com"))
  )[0];

  let candidateId: string;

  if (!candidateUser) {
    logger.info("Creating candidate account: alex.dev@example.com / Password123!");
    const candResult = await AuthService.registerCandidate({
      email: "alex.dev@example.com",
      password: "Password123!",
      fullName: "Alex Chen",
    });
    candidateId = candResult.id;
  } else {
    candidateId = candidateUser.id;
  }

  // Update Candidate Profile details
  const profile = await CandidateProfileService.getProfileByUserId(candidateId);
  await CandidateProfileService.updateProfile(candidateId, {
    bio: "Passionate systems engineer building resilient backend services and open-source tooling. Experienced in TypeScript, Node.js, PostgreSQL, and distributed caching.",
    locationCity: "Bengaluru",
    locationCountry: "India",
    yearsExperience: 1,
  });

  // Candidate Projects & Evidence
  let existingProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.candidateId, profile.id));

  let project1Id: string;
  let evidence1Id: string;
  let evidence2Id: string;

  if (existingProjects.length === 0) {
    logger.info("Creating candidate projects and evidence artifacts...");
    const [p1] = await db
      .insert(projects)
      .values({
        candidateId: profile.id,
        name: "High-throughput Redis Rate Limiter",
        description:
          "Distributed sliding-window and token-bucket rate limiting middleware for Express/Node.js with sub-millisecond overhead and Lua scripting.",
        roleInProject: "SOLE_DEVELOPER",
        teamSize: 1,
        personalContribution:
          "Authored complete token bucket algorithm, Redis Lua atomic scripts, unit tests, and load benchmarks (10,000 req/sec).",
        githubUrl: "https://github.com/alexchen/redis-rate-limiter",
        projectUrl: "https://ratelimiter.alexchen.dev",
        isTeamProject: false,
      })
      .returning();
    project1Id = p1!.id;

    // Project 1 Evidence: GitHub repo with verified evidence badge (Rule #8 demonstration)
    const [ev1] = await db
      .insert(projectEvidence)
      .values({
        projectId: project1Id,
        evidenceType: "GITHUB_URL",
        title: "Redis Rate Limiter Source Repository & Test Suite",
        description:
          "Production-grade TypeScript implementation with 100% Vitest branch coverage and atomic Redis Lua scripts.",
        url: "https://github.com/alexchen/redis-rate-limiter",
        personalContribution:
          "Wrote 100% of the codebase, benchmarks, and CI/CD GitHub Actions workflows.",
        isSelfReported: false, // Verified evidence badge
        skillTags: ["typescript", "redis", "vitest", "api-design", "performance"],
      })
      .returning();
    evidence1Id = ev1!.id;

    // Project 1 Evidence 2: Architecture Decision Record & Benchmarks
    const [ev2] = await db
      .insert(projectEvidence)
      .values({
        projectId: project1Id,
        evidenceType: "WRITTEN_EXPLANATION",
        title: "Concurrency Benchmarking & Latency Analysis",
        description:
          "Empirical performance comparison between Redis sliding-window counter and token-bucket under high concurrency (p99 < 1.2ms).",
        url: "https://ratelimiter.alexchen.dev/benchmarks.html",
        personalContribution:
          "Executed autocannon load tests and plotted percentile latencies.",
        isSelfReported: true, // Self-reported evidence badge (Rule #8)
        skillTags: ["concurrency", "performance", "benchmarking"],
      })
      .returning();
    evidence2Id = ev2!.id;
  } else {
    project1Id = existingProjects[0]!.id;
    const evs = await db
      .select()
      .from(projectEvidence)
      .where(eq(projectEvidence.projectId, project1Id));
    evidence1Id = evs[0]?.id || "";
    evidence2Id = evs[1]?.id || "";
  }

  // 4. Candidate submits application for the job
  if (backendJob) {
    const existingApps = await db.query.applications.findFirst({
      where: (tbl, { eq, and }) =>
        and(eq(tbl.jobId, backendJob!.id), eq(tbl.candidateId, candidateId)),
    });

    if (!existingApps && evidence1Id) {
      logger.info("Submitting application for Alex Chen to Junior Backend Systems Engineer...");
      const reqs = await db.query.jobRequirements.findMany({
        where: (tbl, { eq }) => eq(tbl.jobId, backendJob!.id),
        orderBy: (tbl, { asc }) => asc(tbl.sortOrder),
      });

      const application = await ApplicationService.applyToJob(
        backendJob.id,
        candidateId,
        {
          coverNote:
            "I have built production-grade backend systems in TypeScript and Redis with comprehensive test suites. My Redis Rate Limiter project directly addresses the API design, caching, and testing requirements in this rubric.",
          evidenceMappings: [
            {
              jobRequirementId: reqs[0]!.id,
              projectEvidenceId: evidence1Id,
            },
            {
              jobRequirementId: reqs[1]!.id,
              projectEvidenceId: evidence2Id || evidence1Id,
            },
            {
              jobRequirementId: reqs[2]!.id,
              projectEvidenceId: evidence1Id,
            },
          ],
        }
      );

      // Advance stage to SCREENING
      await ApplicationService.transitionStatus(
        application.id,
        orgId,
        employerId,
        {
          status: "SCREENING",
          reason: "Initial portfolio evidence matches rubric criteria",
        }
      );

      // Add Employer Evaluation Note
      await ApplicationService.addEvaluationNote(
        application.id,
        orgId,
        employerId,
        {
          content: "Strong evidence presented for token bucket algorithm and Vitest benchmarks. Personal contribution verified via commits. Moving to interview stage.",
          isInternal: true,
        }
      );

      logger.info(`✅ Application ${application.id} submitted and advanced to SCREENING`);
    }
  }

  logger.info("✨ ProofHire seed completed successfully!");
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  runSeed()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.fatal({ err }, "Seed process aborted");
      await pool.end();
      process.exit(1);
    });
}
