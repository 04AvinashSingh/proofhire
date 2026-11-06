import { eq, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  candidateProfiles,
  candidateSkills,
  candidateEducation,
  candidateExperience,
} from "../db/schema/index.js";
import { NotFoundError, ConflictError } from "../errors/AppError.js";
import type {
  UpdateCandidateProfileRequest,
  AddSkillRequest,
  AddEducationRequest,
  AddExperienceRequest,
} from "@proofhire/shared-contracts";

export class CandidateProfileService {
  /**
   * Retrieves or ensures existence of candidate profile for a user.
   */
  public static async getProfileByUserId(userId: string) {
    const [profile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId));

    if (!profile) {
      throw new NotFoundError("Candidate profile not found for user");
    }

    return profile;
  }

  /**
   * Updates candidate profile information.
   */
  public static async updateProfile(
    userId: string,
    dto: UpdateCandidateProfileRequest
  ) {
    const profile = await this.getProfileByUserId(userId);

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.locationCity !== undefined) updateData.locationCity = dto.locationCity;
    if (dto.locationCountry !== undefined) updateData.locationCountry = dto.locationCountry;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.visibility !== undefined) updateData.visibility = dto.visibility;
    if (dto.yearsExperience !== undefined) updateData.yearsExperience = dto.yearsExperience;

    const [updated] = await db
      .update(candidateProfiles)
      .set(updateData)
      .where(eq(candidateProfiles.id, profile.id))
      .returning();

    return updated;
  }

  // Skills
  public static async getSkills(candidateId: string) {
    return await db
      .select()
      .from(candidateSkills)
      .where(eq(candidateSkills.candidateId, candidateId))
      .orderBy(asc(candidateSkills.category), asc(candidateSkills.skillName));
  }

  public static async addSkill(candidateId: string, dto: AddSkillRequest) {
    const existing = await db
      .select({ id: candidateSkills.id })
      .from(candidateSkills)
      .where(
        and(
          eq(candidateSkills.candidateId, candidateId),
          eq(candidateSkills.skillName, dto.skillName)
        )
      );

    if (existing.length > 0) {
      throw new ConflictError(`Skill '${dto.skillName}' already added to profile`);
    }

    const [newSkill] = await db
      .insert(candidateSkills)
      .values({
        candidateId,
        skillName: dto.skillName,
        proficiency: dto.proficiency,
        category: dto.category,
        isSelfReported: true, // Invariant: All candidate claimed skills are self-reported
      })
      .returning();

    return newSkill;
  }

  public static async deleteSkill(candidateId: string, skillId: string) {
    const [deleted] = await db
      .delete(candidateSkills)
      .where(
        and(
          eq(candidateSkills.id, skillId),
          eq(candidateSkills.candidateId, candidateId)
        )
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Skill not found or access denied");
    }
    return { success: true };
  }

  // Education
  public static async getEducation(candidateId: string) {
    return await db
      .select()
      .from(candidateEducation)
      .where(eq(candidateEducation.candidateId, candidateId))
      .orderBy(asc(candidateEducation.sortOrder), asc(candidateEducation.startYear));
  }

  public static async addEducation(
    candidateId: string,
    dto: AddEducationRequest
  ) {
    const [edu] = await db
      .insert(candidateEducation)
      .values({
        candidateId,
        institution: dto.institution,
        degree: dto.degree || null,
        fieldOfStudy: dto.fieldOfStudy || null,
        startYear: dto.startYear || null,
        endYear: dto.endYear || null,
        description: dto.description || null,
      })
      .returning();

    return edu;
  }

  public static async deleteEducation(candidateId: string, educationId: string) {
    const [deleted] = await db
      .delete(candidateEducation)
      .where(
        and(
          eq(candidateEducation.id, educationId),
          eq(candidateEducation.candidateId, candidateId)
        )
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Education entry not found or access denied");
    }
    return { success: true };
  }

  // Experience
  public static async getExperience(candidateId: string) {
    return await db
      .select()
      .from(candidateExperience)
      .where(eq(candidateExperience.candidateId, candidateId))
      .orderBy(asc(candidateExperience.sortOrder), asc(candidateExperience.startDate));
  }

  public static async addExperience(
    candidateId: string,
    dto: AddExperienceRequest
  ) {
    const [exp] = await db
      .insert(candidateExperience)
      .values({
        candidateId,
        companyName: dto.companyName,
        roleTitle: dto.roleTitle,
        employmentType: dto.employmentType || null,
        startDate: dto.startDate,
        endDate: dto.isCurrent ? null : dto.endDate || null,
        isCurrent: dto.isCurrent,
        responsibilities: dto.responsibilities || null,
        technologies: dto.technologies || [],
      })
      .returning();

    return exp;
  }

  public static async deleteExperience(
    candidateId: string,
    experienceId: string
  ) {
    const [deleted] = await db
      .delete(candidateExperience)
      .where(
        and(
          eq(candidateExperience.id, experienceId),
          eq(candidateExperience.candidateId, candidateId)
        )
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Experience entry not found or access denied");
    }
    return { success: true };
  }
}
