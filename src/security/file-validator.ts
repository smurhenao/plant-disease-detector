import type { AllowedMimeType } from "@/domain/schemas";

export interface BinaryValidationResult {
  valid: boolean;
  detectedMimeType?: AllowedMimeType;
  byteLength: number;
  cleanBase64: string;
  error?: string;
}

const MAX_BYTES = 4.5 * 1024 * 1024; // 4.5 MB límite seguro para Vercel Serverless
const MIN_BYTES = 64;

const SUSPICIOUS_POLYGLOT_PATTERNS = [
  "<script",
  "<?php",
  "javascript:",
  "onerror=",
  "onload=",
  "eval(",
];

/**
 * Valida criptográficamente los Magic Bytes (firma binaria real) de la imagen
 * y escanea el buffer contra archivos políglotas (JPEG/PNG con scripts inyectados).
 */
export function validateImageBinary(
  rawBase64: string,
  claimedMimeType: AllowedMimeType
): BinaryValidationResult {
  const cleanBase64 = rawBase64
    .replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "")
    .trim();

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleanBase64)) {
    return {
      valid: false,
      byteLength: 0,
      cleanBase64: "",
      error: "Codificación Base64 malformada o con caracteres no permitidos.",
    };
  }

  const buffer = Buffer.from(cleanBase64, "base64");
  const byteLength = buffer.byteLength;

  if (byteLength < MIN_BYTES) {
    return {
      valid: false,
      byteLength,
      cleanBase64: "",
      error: "El archivo binario es demasiado pequeño para ser una imagen válida.",
    };
  }

  if (byteLength > MAX_BYTES) {
    return {
      valid: false,
      byteLength,
      cleanBase64: "",
      error: `La imagen excede el tamaño máximo de seguridad (4.5 MB). Tamaño recibido: ${(
        byteLength /
        (1024 * 1024)
      ).toFixed(2)} MB.`,
    };
  }

  // 1. Verificar firma JPEG: FF D8 FF
  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  // 2. Verificar firma PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  // 3. Verificar firma WebP: "RIFF" (0..3) + "WEBP" (8..11)
  const isWebp =
    buffer.byteLength >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  let detectedMimeType: AllowedMimeType | undefined;
  if (isJpeg) detectedMimeType = "image/jpeg";
  else if (isPng) detectedMimeType = "image/png";
  else if (isWebp) detectedMimeType = "image/webp";

  if (!detectedMimeType) {
    return {
      valid: false,
      byteLength,
      cleanBase64: "",
      error:
        "Firma binaria (Magic Bytes) rechazada: el archivo no corresponde a una imagen JPEG, PNG o WebP auténtica.",
    };
  }

  // 4. Escaneo anti-políglota (detectar scripts ocultos dentro de comentarios binarios)
  const asciiSample = buffer
    .subarray(0, Math.min(buffer.byteLength, 32_768))
    .toString("latin1")
    .toLowerCase();

  for (const pattern of SUSPICIOUS_POLYGLOT_PATTERNS) {
    if (asciiSample.includes(pattern)) {
      return {
        valid: false,
        byteLength,
        cleanBase64: "",
        error:
          "Alerta de seguridad: se detectó contenido ejecutable o script embebido dentro del archivo de imagen.",
      };
    }
  }

  void claimedMimeType;

  return {
    valid: true,
    detectedMimeType,
    byteLength,
    cleanBase64,
  };
}

/**
 * Limpia y valida la API Key de Gemini (incluso si fue pegada con GEMINI_API_KEY=,
 * comillas, espacios o si se pegaron dos claves seguidas por error).
 */
export function sanitizeAndExtractApiKey(rawInput: string): string {
  let cleaned = rawInput
    .trim()
    .replace(/^(GEMINI_API_KEY|GEMINI_KEY|GOOGLE_API_KEY)\s*=\s*/i, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();

  // Si por error el usuario pegó una clave encima de otra (ej. AIzaSy...AIzaSy...),
  // tomamos a partir de la última aparición de "AIza".
  const lastAiIndex = cleaned.lastIndexOf("AIza");
  if (lastAiIndex > 0) {
    cleaned = cleaned.slice(lastAiIndex).trim();
  }

  return cleaned;
}

export function validateGeminiApiKeyFormat(rawKey: string | undefined): {
  valid: boolean;
  sanitizedKey?: string;
  error?: string;
} {
  if (!rawKey || !rawKey.trim()) {
    return {
      valid: false,
      error:
        "No hay ninguna clave GEMINI_API_KEY activa. Haz clic en 'Seguridad & API Key' arriba a la derecha para ingresarla.",
    };
  }

  const cleaned = sanitizeAndExtractApiKey(rawKey);

  if (
    !cleaned ||
    cleaned === "tu_api_key_de_gemini_aqui" ||
    cleaned.length < 20 ||
    cleaned.length > 120 ||
    /\s/.test(cleaned)
  ) {
    return {
      valid: false,
      error:
        "La clave GEMINI_API_KEY no tiene un formato válido. Abre 'Seguridad & API Key', bórrala y vuelve a pegarla.",
    };
  }

  return {
    valid: true,
    sanitizedKey: cleaned,
  };
}
