import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { candidateProfiles, users } from "../db/schema/index.js";
import { CandidateProfileService } from "./candidateProfileService.js";
import { ProjectService } from "./projectService.js";
import { NotFoundError, ForbiddenError } from "../errors/AppError.js";
import type { AuthUser, CandidatePortfolioDto } from "@proofhire/shared-contracts";

export class PortfolioService {
  /**
   * Retrieves full candidate portfolio, enforcing profile visibility constraints.
   */
  public static async getPortfolio(
    candidateId: string,
    requestingUser?: AuthUser
  ): Promise<CandidatePortfolioDto> {
    const [profile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.id, candidateId));

    if (!profile) {
      throw new NotFoundError("Candidate profile not found");
    }

    const [user] = await db
      .select({ fullName: users.fullName, email: users.email })
      .from(users)
      .where(eq(users.id, profile.userId));

    if (!user) {
      throw new NotFoundError("User record for candidate not found");
    }

    // Visibility Check
    const isOwner = requestingUser && requestingUser.id === profile.userId;
    const isPlatformAdmin = requestingUser && requestingUser.role === "ADMIN";

    if (!isOwner && !isPlatformAdmin) {
      if (profile.visibility === "PRIVATE") {
        throw new NotFoundError("Candidate portfolio not found");
      }

      if (profile.visibility === "APPLIED_ONLY") {
        // Must be authenticated as an employer or candidate
        if (!requestingUser || (requestingUser.role !== "EMPLOYER" && requestingUser.role !== "ADMIN")) {
          throw new ForbiddenError(
            "This portfolio is only visible to employers for active job applications"
          );
        }
      }
    }

    // Fetch related components
    const skills = await CandidateProfileService.getSkills(candidateId);
    const education = await CandidateProfileService.getEducation(candidateId);
    const experience = await CandidateProfileService.getExperience(candidateId);
    const projectsWithEvidence = await ProjectService.getProjects(candidateId);

    return {
      profile: {
        id: profile.id,
        userId: profile.userId,
        bio: profile.bio,
        locationCity: profile.locationCity,
        locationCountry: profile.locationCountry,
        status: profile.status as any,
        visibility: profile.visibility as any,
        yearsExperience: profile.yearsExperience,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
      fullName: user.fullName,
      email: profile.visibility === "PUBLIC" && !isOwner && !isPlatformAdmin ? "" : user.email, // mask email on public view if unauthenticated
      skills: skills.map((s) => ({
        id: s.id,
        skillName: s.skillName,
        proficiency: s.proficiency as any,
        category: s.category as any,
        isSelfReported: s.isSelfReported,
        createdAt: s.createdAt.toISOString(),
      })),
      education: education.map((e) => ({
        id: e.id,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        startYear: e.startYear,
        endYear: e.endYear,
        description: e.description,
        sortOrder: e.sortOrder,
        createdAt: e.createdAt.toISOString(),
      })),
      experience: experience.map((exp) => ({
        id: exp.id,
        companyName: exp.companyName,
        roleTitle: exp.roleTitle,
        employmentType: exp.employmentType,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        responsibilities: exp.responsibilities,
        technologies: exp.technologies,
        sortOrder: exp.sortOrder,
        createdAt: exp.createdAt.toISOString(),
      })),
      projects: projectsWithEvidence.map((p) => ({
        id: p.id,
        candidateId: p.candidateId,
        name: p.name,
        description: p.description,
        roleInProject: p.roleInProject as any,
        teamSize: p.teamSize,
        personalContribution: p.personalContribution,
        githubUrl: p.githubUrl,
        projectUrl: p.projectUrl,
        demoUrl: p.demoUrl,
        isTeamProject: p.isTeamProject,
        startDate: p.startDate,
        endDate: p.endDate,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        evidence: p.evidence.map((e) => ({
          id: e.id,
          projectId: e.projectId,
          evidenceType: e.evidenceType as any,
          title: e.title,
          description: e.description,
          url: e.url,
          filePath: isOwner || isPlatformAdmin ? e.filePath : null, // Internal file paths masked from external consumers
          personalContribution: e.personalContribution,
          isSelfReported: e.isSelfReported,
          skillTags: e.skillTags,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        })),
      })),
    };
  }
}
