import { describe, it, expect } from "vitest";
import { validateSafeExternalUrl, isPrivateOrInternalHost } from "./ssrfProtection.js";

describe("SSRF Protection Utility", () => {
  it("allows legitimate public URLs", () => {
    const urls = [
      "https://github.com/facebook/react",
      "https://gitlab.com/project/repo",
      "https://example.com/demo",
      "http://api.myapp.dev/portfolio",
    ];

    for (const url of urls) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBeDefined();
    }
  });

  it("blocks localhost, loopback, and local domain variants", () => {
    const malicious = [
      "http://localhost:3000",
      "http://127.0.0.1:5432",
      "http://127.0.0.2:8000",
      "http://0.0.0.0:80",
      "http://myhost.localhost:8080",
      "http://server.local",
    ];

    for (const url of malicious) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("forbidden");
    }
  });

  it("blocks private RFC 1918 internal subnets", () => {
    const privateUrls = [
      "http://10.0.0.1/admin",
      "http://10.255.0.1",
      "http://172.16.0.1:4000",
      "http://172.31.255.255",
      "http://192.168.1.1:80",
      "http://192.168.0.254",
    ];

    for (const url of privateUrls) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("forbidden");
    }
  });

  it("blocks cloud instance metadata service endpoints", () => {
    const metadataUrls = [
      "http://169.254.169.254/latest/meta-data/",
      "http://metadata.google.internal/computeMetadata/v1/",
    ];

    for (const url of metadataUrls) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("forbidden");
    }
  });

  it("blocks non-http protocols (file://, ftp://, gopher://)", () => {
    const dangerousProtocols = [
      "file:///etc/passwd",
      "ftp://ftp.example.com",
      "gopher://gopher.floodgap.com",
    ];

    for (const url of dangerousProtocols) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  });

  it("blocks alternative IP encoding bypasses (hex, octal, dword)", () => {
    const encodedBypasses = [
      "http://2130706433", // dword for 127.0.0.1
      "http://0x7f000001", // hex for 127.0.0.1
      "http://0x7f.0.0.1", // dotted hex
      "http://0177.0.0.1", // dotted octal
      "http://017700000001", // octal dword
      "http://0", // shorthand for 0.0.0.0
      "http://127.1", // 2-part IPv4 (127.0.0.1)
    ];

    for (const url of encodedBypasses) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("forbidden");
    }
  });

  it("blocks IPv6 loopback, private, and mapped IPv4 addresses", () => {
    const ipv6Attacks = [
      "http://[::1]:8080",
      "http://[::]:8080",
      "http://[::ffff:127.0.0.1]",
      "http://[::ffff:10.0.0.1]",
      "http://[fe80::1]",
      "http://[fc00::1]",
    ];

    for (const url of ipv6Attacks) {
      const result = validateSafeExternalUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("forbidden");
    }
  });
});

