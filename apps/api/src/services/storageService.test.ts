import { describe, it, expect, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { LocalStorageProvider } from "./storageService.js";

describe("LocalStorageProvider (ADR-006 Artifact Storage)", () => {
  const testUploadDir = path.resolve(process.cwd(), "test_uploads");
  const storage = new LocalStorageProvider(testUploadDir);

  afterAll(async () => {
    try {
      await fs.rm(testUploadDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("successfully stores a valid PNG image and returns safe path", async () => {
    // Valid PNG signature: \x89PNG\r\n\x1a\n
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pngBuffer = Buffer.concat([pngHeader, Buffer.from("fake-png-binary-content-12345")]);
    const result = await storage.saveFile("architecture-diagram.png", pngBuffer, "image/png");

    expect(result.size).toBe(pngBuffer.length);
    expect(result.fileName.endsWith(".png")).toBe(true);
    // Safe randomized name (not original user-supplied name to defeat traversal)
    expect(result.fileName).not.toBe("architecture-diagram.png");

    // Read back and verify
    const readBuffer = await storage.getFile(result.filePath);
    expect(readBuffer.toString()).toBe(pngBuffer.toString());

    // Clean up
    await storage.deleteFile(result.filePath);
  });

  it("stores file with owner prefix when ownerId is specified", async () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pngBuffer = Buffer.concat([pngHeader, Buffer.from("owner-test")]);
    const result = await storage.saveFile("diagram.png", pngBuffer, "image/png", "candidate-123");

    expect(result.fileName.startsWith("candidate-123_")).toBe(true);
    await storage.deleteFile(result.filePath);
  });

  it("rejects SVG files to prevent stored XSS attacks", async () => {
    const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    await expect(
      storage.saveFile("xss.svg", svgBuffer, "image/svg+xml")
    ).rejects.toThrow("File type 'image/svg+xml' is not allowed");
  });

  it("rejects files with spoofed MIME types when magic bytes mismatch", async () => {
    // Fake PNG file that is actually plain text / bash script
    const fakePng = Buffer.from("#!/bin/bash\nrm -rf /");
    await expect(
      storage.saveFile("exploit.png", fakePng, "image/png")
    ).rejects.toThrow("File content does not match PNG format signature");
  });

  it("rejects path traversal attacks in getFile and deleteFile", async () => {
    await expect(storage.getFile("../../../etc/passwd")).rejects.toThrow(
      "Access to the requested file path is restricted"
    );
    await expect(storage.deleteFile("/etc/shadow")).rejects.toThrow(
      "Access to the requested file path is restricted"
    );
  });

  it("stores and retrieves a PDF design document", async () => {
    const pdfBuffer = Buffer.from("%PDF-1.4 test design document content");
    const result = await storage.saveFile("system-design.pdf", pdfBuffer, "application/pdf");

    expect(result.fileName.endsWith(".pdf")).toBe(true);

    const readBuffer = await storage.getFile(result.filePath);
    expect(readBuffer.toString()).toBe(pdfBuffer.toString());

    await storage.deleteFile(result.filePath);
  });

  it("rejects unauthorized file MIME types", async () => {
    const maliciousBuffer = Buffer.from("executable binary code");
    await expect(
      storage.saveFile("hack.exe", maliciousBuffer, "application/x-msdownload")
    ).rejects.toThrow("File type 'application/x-msdownload' is not allowed");
  });

  it("rejects empty files", async () => {
    const emptyBuffer = Buffer.alloc(0);
    await expect(
      storage.saveFile("empty.png", emptyBuffer, "image/png")
    ).rejects.toThrow("Uploaded file cannot be empty");
  });

  it("rejects files exceeding 10 MB maximum size", async () => {
    // 11 MB buffer
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(
      storage.saveFile("huge.pdf", largeBuffer, "application/pdf")
    ).rejects.toThrow("exceeds maximum allowed limit of 10 MB");
  });
});
