import { NextRequest, NextResponse } from "next/server";
import {
  AnalyzeRequestSchema,
  type StreamEventPayload,
} from "@/domain/schemas";
import { validateImageBinary } from "@/security/file-validator";
import { checkRateLimit } from "@/security/rate-limiter";
import { analyzePlantWithGeminiApi } from "@/services/gemini-analyzer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatSseMessage(payload: StreamEventPayload): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: NextRequest) {
  // 1. Protección anti-CSRF (verificar Sec-Fetch-Site y Origin)
  const secFetchSite = req.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite === "cross-site") {
    return NextResponse.json(
      { error: "Solicitud bloqueada por política de seguridad Cross-Origin (CSRF)." },
      { status: 403 }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type no permitido. Se requiere application/json." },
      { status: 415 }
    );
  }

  // 2. Control de Rate Limiting por IP (Sliding Window)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateDecision = checkRateLimit(clientIp);
  if (!rateDecision.allowed) {
    return NextResponse.json(
      {
        error: `Demasiadas solicitudes desde esta IP. Intenta nuevamente en ${Math.ceil(
          rateDecision.resetInMs / 1000
        )} segundos.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateDecision.limit),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(Math.ceil(rateDecision.resetInMs / 1000)),
        },
      }
    );
  }

  // 3. Parsear y validar el cuerpo con Zod
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es un JSON válido." },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message || "Datos de entrada inválidos.";
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  const { imageBase64, mimeType } = parsed.data;
  const headerApiKey = req.headers.get("x-gemini-api-key")?.trim() || undefined;

  // 4. Iniciar flujo de Streaming SSE (Server-Sent Events)
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: StreamEventPayload) => {
        controller.enqueue(encoder.encode(formatSseMessage(event)));
      };

      try {
        // Etapa 1: Verificación de Magic Bytes, anti-políglota y sanitización EXIF
        emit({
          stage: "security_check",
          progress: 25,
          message:
            "Verificando firma criptográfica binaria (Magic Bytes) y escaneo anti-scripts...",
          timestamp: Date.now(),
        });

        const binaryCheck = validateImageBinary(imageBase64, mimeType);
        if (!binaryCheck.valid || !binaryCheck.detectedMimeType) {
          emit({
            stage: "error",
            progress: 100,
            message: binaryCheck.error || "Archivo rechazado por seguridad.",
            error: binaryCheck.error || "Archivo rechazado por seguridad.",
            timestamp: Date.now(),
          });
          controller.close();
          return;
        }

        // Etapa 2: Inferencia en la API de Gemini Vision
        emit({
          stage: "ai_inference",
          progress: 65,
          message:
            "Analizando imagen con la API de Gemini Vision (verificación botánica y diagnóstico)...",
          timestamp: Date.now(),
        });

        const diagnosis = await analyzePlantWithGeminiApi({
          cleanBase64: binaryCheck.cleanBase64,
          mimeType: binaryCheck.detectedMimeType,
          apiKeyOverride: headerApiKey,
          onStatusUpdate: (statusMsg) => {
            emit({
              stage: "ai_inference",
              progress: 75,
              message: statusMsg,
              timestamp: Date.now(),
            });
          },
        });

        // Etapa 3: Validación de contrato Zod
        emit({
          stage: "validation",
          progress: 90,
          message:
            "Validando integridad del esquema clínico (Zod Structured Output)...",
          timestamp: Date.now(),
        });

        // Etapa 4: Completado
        emit({
          stage: "complete",
          progress: 100,
          message: diagnosis.isPlant
            ? `Diagnóstico completado (${diagnosis.processingTimeMs} ms)`
            : "Objeto no botánico detectado y filtrado correctamente",
          timestamp: Date.now(),
          diagnosis,
        });

        controller.close();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error inesperado al consultar la API de IA.";
        emit({
          stage: "error",
          progress: 100,
          message,
          error: message,
          timestamp: Date.now(),
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-RateLimit-Limit": String(rateDecision.limit),
      "X-RateLimit-Remaining": String(rateDecision.remaining),
    },
  });
}
