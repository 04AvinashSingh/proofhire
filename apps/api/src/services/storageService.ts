import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { BadRequestError } from "../errors/AppError.js";

export interface StorageProvider {
  saveFile(
    originalName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{ filePath: string; fileName: string; size: number }>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<void>;
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/markdown": ".md",
};

/**
 * Validates file magic bytes against declared MIME type to prevent extension/MIME spoofing.
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): void {
  if (mimeType === "image/png") {
    if (
      buffer.length < 8 ||
      buffer[0] !== 0x89 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x4e ||
      buffer[3] !== 0x47
    ) {
      throw new BadRequestError("File content does not match PNG format signature");
    }
  } else if (mimeType === "image/jpeg") {
    if (
      buffer.length < 3 ||
      buffer[0] !== 0xff ||
      buffer[1] !== 0xd8 ||
      buffer[2] !== 0xff
    ) {
      throw new BadRequestError("File content does not match JPEG format signature");
    }
  } else if (mimeType === "application/pdf") {
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x25 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x44 ||
      buffer[3] !== 0x46
    ) {
      throw new BadRequestError("File content does not match PDF format signature");
    }
  } else if (mimeType === "text/plain" || mimeType === "text/markdown") {
    if (buffer.includes(0x00)) {
      throw new BadRequestError("Binary content detected in text file");
    }
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit (ADR-006)

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir =
      customUploadDir || path.resolve(process.cwd(), "uploads");
  }

  public getUploadDir(): string {
    return this.uploadDir;
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // directory already exists or created
    }
  }

  public async saveFile(
    _originalName: string,
    buffer: Buffer,
    mimeType: string,
    ownerId?: string
  ): Promise<{ filePath: string; fileName: string; size: number }> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError("Uploaded file cannot be empty");
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestError(
        `File size exceeds maximum allowed limit of 10 MB. Received: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`
      );
    }

    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      throw new BadRequestError(
        `File type '${mimeType}' is not allowed. Allowed types: PNG, JPEG, PDF, TXT, MD`
      );
    }

    validateMagicBytes(buffer, mimeType);

    await this.ensureUploadDir();

    // Use cryptographically secure random UUID for filename to eliminate path traversal risks
    const prefix = ownerId ? `${ownerId}_` : "";
    const safeFileName = `${prefix}${crypto.randomUUID()}${extension}`;
    const destinationPath = path.join(this.uploadDir, safeFileName);

    await fs.writeFile(destinationPath, buffer);

    return {
      filePath: destinationPath,
      fileName: safeFileName,
      size: buffer.length,
    };
  }

  public async getFile(filePath: string): Promise<Buffer> {
    // Prevent path traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
      throw new BadRequestError("Access to the requested file path is restricted");
    }

    try {
      return await fs.readFile(resolvedPath);
    } catch {
      throw new BadRequestError("File could not be found or read");
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
      throw new BadRequestError("Access to the requested file path is restricted");
    }

    try {
      await fs.unlink(resolvedPath);
    } catch {
      // Ignore if already deleted
    }
  }
}

export const storageService = new LocalStorageProvider();
