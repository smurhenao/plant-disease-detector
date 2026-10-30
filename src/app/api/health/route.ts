import { NextResponse } from "next/server";
import { validateGeminiApiKeyFormat } from "@/security/file-validator";

export const dynamic = "force-dynamic";

export async function GET() {
  const keyCheck = validateGeminiApiKeyFormat(
    process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
  );

  return NextResponse.json({
    status: "ok",
    version: "2.0.0",
    engine: "gemini-3.8-flash (Cloud API Only)",
    hasServerGeminiKey: keyCheck.valid,
    security: {
      magicBytesVerification: true,
      polyglotPayloadScanner: true,
      csrfOriginProtection: true,
      exifStrippingClientSide: true,
      slidingWindowRateLimit: true,
      strictJsonSchemaValidation: true,
      cspHeadersEnabled: true,
    },
  });
}
