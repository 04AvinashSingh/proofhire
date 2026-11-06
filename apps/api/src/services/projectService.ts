import path from "path";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects, projectEvidence } from "../db/schema/index.js";
import { storageService } from "./storageService.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../errors/AppError.js";
import type {
  CreateProjectRequest,
  AddProjectEvidenceRequest,
} from "@proofhire/shared-contracts";

export class ProjectService {
  /**
   * Retrieves all projects for a candidate with their associated evidence.
   */
  public static async getProjects(candidateId: string) {
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.candidateId, candidateId))
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

    const projectIds = projectList.map((p) => p.id);

    const allEvidence =
      projectIds.length > 0
        ? await db
            .select()
            .from(projectEvidence)
            .orderBy(asc(projectEvidence.createdAt))
        : [];

    return projectList.map((project) => ({
      ...project,
      evidence: allEvidence.filter((e) => e.projectId === project.id),
    }));
  }

  /**
   * Creates a new project entry for a candidate.
   */
  public static async createProject(
    candidateId: string,
    dto: CreateProjectRequest
  ) {
    const [newProject] = await db
      .insert(projects)
      .values({
        candidateId,
        name: dto.name,
        description: dto.description,
        roleInProject: dto.roleInProject,
        teamSize: dto.teamSize || null,
        personalContribution: dto.personalContribution,
        githubUrl: dto.githubUrl || null,
        projectUrl: dto.projectUrl || null,
        demoUrl: dto.demoUrl || null,
        isTeamProject: dto.isTeamProject || false,
        startDate: dto.startDate || null,
        endDate: dto.endDate || null,
      })
      .returning();

    return {
      ...newProject,
      evidence: [],
    };
  }

  /**
   * Updates an existing project, ensuring candidate ownership.
   */
  public static async updateProject(
    candidateId: string,
    projectId: string,
    dto: Partial<CreateProjectRequest>
  ) {
    const [project] = await db
      .select({ id: projects.id, candidateId: projects.candidateId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.candidateId !== candidateId) {
      throw new ForbiddenError("You do not have permission to modify this project");
    }

    const [updated] = await db
      .update(projects)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return updated;
  }

  /**
   * Deletes a project and all associated evidence.
   */
  public static async deleteProject(candidateId: string, projectId: string) {
    const [project] = await db
      .select({ id: projects.id, candidateId: projects.candidateId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.candidateId !== candidateId) {
      throw new ForbiddenError("You do not have permission to delete this project");
    }

    // Find files to clean up from storage
    const evidenceItems = await db
      .select({ filePath: projectEvidence.filePath })
      .from(projectEvidence)
      .where(eq(projectEvidence.projectId, projectId));

    for (const item of evidenceItems) {
      if (item.filePath) {
        await storageService.deleteFile(item.filePath);
      }
    }

    await db.delete(projects).where(eq(projects.id, projectId));
    return { success: true };
  }

  // Evidence
  /**
   * Adds evidence to a project.
   */
  public static async addEvidence(
    candidateId: string,
    projectId: string,
    dto: AddProjectEvidenceRequest
  ) {
    const [project] = await db
      .select({ id: projects.id, candidateId: projects.candidateId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.candidateId !== candidateId) {
      throw new ForbiddenError("You do not have permission to add evidence to this project");
    }

    let safeFilePath: string | null = null;
    if (dto.filePath) {
      const fileName = path.basename(dto.filePath);
      const resolved = path.resolve(storageService.getUploadDir(), fileName);
      if (!resolved.startsWith(path.resolve(storageService.getUploadDir()))) {
        throw new BadRequestError("Invalid file path: path traversal detected");
      }
      if (fileName.includes("_")) {
        const fileOwner = fileName.split("_")[0];
        if (fileOwner && fileOwner !== candidateId) {
          throw new ForbiddenError("Cannot attach file belonging to another candidate");
        }
      }
      safeFilePath = resolved;
    }

    const [evidence] = await db
      .insert(projectEvidence)
      .values({
        projectId,
        evidenceType: dto.evidenceType,
        title: dto.title,
        description: dto.description,
        url: dto.url || null,
        filePath: safeFilePath,
        personalContribution: dto.personalContribution,
        isSelfReported: true, // Invariant: All candidate submitted evidence is self-reported
        skillTags: dto.skillTags,
      })
      .returning();

    return evidence;
  }

  /**
   * Deletes evidence from a project.
   */
  public static async deleteEvidence(
    candidateId: string,
    projectId: string,
    evidenceId: string
  ) {
    const [project] = await db
      .select({ id: projects.id, candidateId: projects.candidateId })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project || project.candidateId !== candidateId) {
      throw new ForbiddenError("Access to this project is restricted");
    }

    const [evidence] = await db
      .select()
      .from(projectEvidence)
      .where(
        and(
          eq(projectEvidence.id, evidenceId),
          eq(projectEvidence.projectId, projectId)
        )
      );

    if (!evidence) {
      throw new NotFoundError("Evidence not found");
    }

    if (evidence.filePath) {
      const fileName = path.basename(evidence.filePath);
      if (fileName.includes("_")) {
        const fileOwner = fileName.split("_")[0];
        if (fileOwner && fileOwner !== candidateId) {
          throw new ForbiddenError("Cannot delete file belonging to another candidate");
        }
      }
      await storageService.deleteFile(evidence.filePath);
    }

    await db
      .delete(projectEvidence)
      .where(eq(projectEvidence.id, evidenceId));

    return { success: true };
  }
}
