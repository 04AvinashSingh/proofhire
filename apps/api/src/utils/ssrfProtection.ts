import { URL } from "url";
import dns from "dns/promises";

/**
 * Parses flexible IPv4 representations: standard decimal, hex (0x7f...), octal (0177...),
 * integer/dword (2130706433), or multi-part combinations.
 * Returns unsigned 32-bit integer if valid IPv4, or null otherwise.
 */
function parseFlexibleIpv4(host: string): number | null {
  if (host.startsWith("[") && host.endsWith("]")) {
    return null;
  }

  const parts = host.split(".");
  if (parts.length > 4) return null;

  const parsedParts: number[] = [];
  for (const part of parts) {
    let val: number;
    if (part.startsWith("0x") || part.startsWith("0X")) {
      val = parseInt(part, 16);
    } else if (part.startsWith("0") && part.length > 1 && /^[0-7]+$/.test(part)) {
      val = parseInt(part, 8);
    } else if (/^\d+$/.test(part)) {
      val = parseInt(part, 10);
    } else {
      return null;
    }

    if (isNaN(val) || val < 0) return null;
    parsedParts.push(val);
  }

  let ipNum: number;
  if (parsedParts.length === 1) {
    ipNum = parsedParts[0]!;
  } else if (parsedParts.length === 2) {
    if (parsedParts[0]! > 255 || parsedParts[1]! > 0xffffff) return null;
    ipNum = (parsedParts[0]! << 24) | parsedParts[1]!;
  } else if (parsedParts.length === 3) {
    if (parsedParts[0]! > 255 || parsedParts[1]! > 255 || parsedParts[2]! > 0xffff) return null;
    ipNum = (parsedParts[0]! << 24) | (parsedParts[1]! << 16) | parsedParts[2]!;
  } else if (parsedParts.length === 4) {
    if (parsedParts.some((p) => p > 255)) return null;
    ipNum =
      (parsedParts[0]! << 24) |
      (parsedParts[1]! << 16) |
      (parsedParts[2]! << 8) |
      parsedParts[3]!;
  } else {
    return null;
  }

  return ipNum >>> 0;
}

/**
 * Evaluates whether an IPv4 numeric address falls into private, loopback, link-local,
 * or reserved blocks (RFC 1918, RFC 3927, RFC 5735).
 */
function isPrivateIpv4Octets(
  octet1: number,
  octet2: number,
  octet3: number
): boolean {
  // 0.0.0.0/8 (Current network)
  if (octet1 === 0) return true;

  // 10.0.0.0/8 (Private)
  if (octet1 === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (octet1 === 127) return true;

  // 169.254.0.0/16 (Link-local / Cloud metadata AWS/GCP/Azure)
  if (octet1 === 169 && octet2 === 254) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (octet1 === 192 && octet2 === 168) return true;

  // 100.64.0.0/10 (Carrier Grade NAT)
  if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (octet1 === 192 && octet2 === 0 && octet3 === 0) return true;

  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET documentation blocks)
  if (octet1 === 192 && octet2 === 0 && octet3 === 2) return true;
  if (octet1 === 198 && octet2 === 51 && octet3 === 100) return true;
  if (octet1 === 203 && octet2 === 0 && octet3 === 113) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (octet1 >= 224) return true;

  return false;
}

/**
 * Checks if an IP or hostname is private/internal to prevent Server-Side Request Forgery (SSRF).
 * Defends against hex, octal, integer, IPv6, and cloud metadata bypasses.
 */
export function isPrivateOrInternalHost(host: string): boolean {
  let cleanHost = host.toLowerCase().trim();

  // Strip brackets if IPv6
  if (cleanHost.startsWith("[") && cleanHost.endsWith("]")) {
    cleanHost = cleanHost.slice(1, -1);
  }

  // 1. Hostnames and local domain variants
  if (
    cleanHost === "localhost" ||
    cleanHost === "localhost.localdomain" ||
    cleanHost.endsWith(".localhost") ||
    cleanHost.endsWith(".local") ||
    cleanHost.endsWith(".internal") ||
    cleanHost === "metadata.google.internal"
  ) {
    return true;
  }

  // 2. IPv6 Checks (Loopback, Link-local, Unique Local, IPv4-mapped)
  if (
    cleanHost === "::1" ||
    cleanHost === "::" ||
    cleanHost.startsWith("fe8") ||
    cleanHost.startsWith("fe9") ||
    cleanHost.startsWith("fea") ||
    cleanHost.startsWith("feb") ||
    cleanHost.startsWith("fc") ||
    cleanHost.startsWith("fd") ||
    cleanHost.startsWith("ff")
  ) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or normalized ::ffff:7f00:1)
  if (cleanHost.startsWith("::ffff:")) {
    const rest = cleanHost.slice(7);
    if (rest.includes(".")) {
      return isPrivateOrInternalHost(rest);
    }
    if (rest.includes(":")) {
      const parts = rest.split(":");
      if (parts.length === 2 && parts[0] && parts[1]) {
        const high = parseInt(parts[0], 16);
        const low = parseInt(parts[1], 16);
        const o1 = (high >>> 8) & 255;
        const o2 = high & 255;
        const o3 = (low >>> 8) & 255;
        return isPrivateIpv4Octets(o1, o2, o3);
      }
    }
    return true; // Any unrecognized ::ffff: block is blocked for safety
  }

  // 3. Flexible IPv4 checks (supports decimal, hex, octal, dword)
  const ipv4Num = parseFlexibleIpv4(cleanHost);
  if (ipv4Num !== null) {
    const octet1 = (ipv4Num >>> 24) & 255;
    const octet2 = (ipv4Num >>> 16) & 255;
    const octet3 = (ipv4Num >>> 8) & 255;
    return isPrivateIpv4Octets(octet1, octet2, octet3);
  }

  return false;
}

/**
 * Validates that a user-supplied external URL is safe and does not target internal infrastructure.
 * Synchronous validation against scheme, hostname, and direct IP formats.
 */
export function validateSafeExternalUrl(rawUrl: string): {
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
} {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Only http and https protocols are permitted" };
  }

  if (isPrivateOrInternalHost(parsed.hostname)) {
    return {
      valid: false,
      error: "Access to private or local network resources is forbidden",
    };
  }

  return { valid: true, normalizedUrl: parsed.toString() };
}

/**
 * Asynchronous validation that additionally verifies DNS resolution to defeat DNS rebinding.
 */
export async function validateSafeExternalUrlAsync(rawUrl: string): Promise<{
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
}> {
  const syncResult = validateSafeExternalUrl(rawUrl);
  if (!syncResult.valid) {
    return syncResult;
  }

  const parsed = new URL(syncResult.normalizedUrl!);

  // If already identified as numeric IP, no DNS lookup needed
  if (parseFlexibleIpv4(parsed.hostname) !== null) {
    return syncResult;
  }

  try {
    const addresses = await dns.lookup(parsed.hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateOrInternalHost(addr.address)) {
        return {
          valid: false,
          error: `Access to private or local network resources is forbidden (resolved to ${addr.address})`,
        };
      }
    }
  } catch (err: any) {
    return {
      valid: false,
      error: `Could not resolve hostname '${parsed.hostname}': ${err.message}`,
    };
  }

  return syncResult;
}
