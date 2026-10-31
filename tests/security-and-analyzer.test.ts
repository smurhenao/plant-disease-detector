import { describe, it, expect, beforeEach } from "vitest";
import {
  validateImageBinary,
  validateGeminiApiKeyFormat,
  sanitizeAndExtractApiKey,
} from "@/security/file-validator";
import {
  checkRateLimit,
  resetRateLimiterForTests,
} from "@/security/rate-limiter";

describe("Security: Binary Magic Bytes & Anti-Polyglot Validator", () => {
  it("accepts a valid JPEG binary header (FF D8 FF)", () => {
    const fakeJpegBytes = Buffer.alloc(128, 0x11);
    fakeJpegBytes[0] = 0xff;
    fakeJpegBytes[1] = 0xd8;
    fakeJpegBytes[2] = 0xff;

    const res = validateImageBinary(
      fakeJpegBytes.toString("base64"),
      "image/jpeg"
    );
    expect(res.valid).toBe(true);
    expect(res.detectedMimeType).toBe("image/jpeg");
  });

  it("accepts a valid PNG binary header (89 50 4E 47 0D 0A 1A 0A)", () => {
    const fakePngBytes = Buffer.alloc(128, 0x22);
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    sig.forEach((b, i) => {
      fakePngBytes[i] = b;
    });

    const res = validateImageBinary(
      fakePngBytes.toString("base64"),
      "image/png"
    );
    expect(res.valid).toBe(true);
    expect(res.detectedMimeType).toBe("image/png");
  });

  it("rejects disguised executable or script payloads claiming to be image/jpeg", () => {
    const maliciousScript = Buffer.from(
      "<script>alert('xss')</script>".repeat(6),
      "utf-8"
    ).toString("base64");

    const res = validateImageBinary(maliciousScript, "image/jpeg");
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Magic Bytes");
  });

  it("blocks polyglot JPEG files containing embedded <script payloads", () => {
    const polyglotJpeg = Buffer.alloc(256, 0x20);
    polyglotJpeg[0] = 0xff;
    polyglotJpeg[1] = 0xd8;
    polyglotJpeg[2] = 0xff;
    polyglotJpeg.write("<script>evil()</script>", 32, "latin1");

    const res = validateImageBinary(
      polyglotJpeg.toString("base64"),
      "image/jpeg"
    );
    expect(res.valid).toBe(false);
    expect(res.error).toContain("script embebido");
  });
});

describe("Security: API Key Format Validation & De-concatenation", () => {
  it("rejects missing or placeholder keys", () => {
    expect(validateGeminiApiKeyFormat(undefined).valid).toBe(false);
    expect(
      validateGeminiApiKeyFormat("tu_api_key_de_gemini_aqui").valid
    ).toBe(false);
  });

  it("accepts properly formatted Google AI Studio keys", () => {
    const prefix = ["AI", "za", "Sy"].join("");
    const sample = `${prefix}${"A".repeat(33)}`;
    const check = validateGeminiApiKeyFormat(sample);
    expect(check.valid).toBe(true);
    expect(check.sanitizedKey).toBe(sample);
  });

  it("automatically extracts the latest key if two keys were pasted together", () => {
    const prefix = ["AI", "za", "Sy"].join("");
    const key1 = `${prefix}${"1".repeat(33)}`;
    const key2 = `${prefix}${"2".repeat(33)}`;
    const concatenated = `${key1}${key2}`;
    expect(sanitizeAndExtractApiKey(concatenated)).toBe(key2);
  });
});

describe("Security: Sliding Window IP Rate Limiter", () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it("allows requests within the threshold and blocks excess requests", () => {
    const ip = "203.0.113.42";
    const r1 = checkRateLimit(ip, 2, 60_000);
    const r2 = checkRateLimit(ip, 2, 60_000);
    const r3 = checkRateLimit(ip, 2, 60_000);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });
});
