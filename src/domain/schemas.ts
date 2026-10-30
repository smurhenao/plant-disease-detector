import { z } from "zod";

export const AllowedMimeTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type AllowedMimeType = z.infer<typeof AllowedMimeTypeSchema>;

export const AnalyzeRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(64, "La imagen codificada es demasiado pequeña o inválida.")
    .max(6_500_000, "La imagen supera el límite máximo permitido de 4.5 MB."),
  mimeType: AllowedMimeTypeSchema,
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const HealthStatusSchema = z.enum([
  "healthy",
  "diseased",
  "stressed",
  "non_plant",
]);

export const SeverityLevelSchema = z.enum([
  "none",
  "low",
  "moderate",
  "high",
  "critical",
]);

export const PathogenTypeSchema = z.enum([
  "fungal",
  "bacterial",
  "viral",
  "pest",
  "nutritional",
  "abiotic",
  "none",
]);

export const PlantDiagnosisSchema = z.object({
  isPlant: z.boolean(),
  detectedSubject: z.string().max(300),
  rejectionReason: z.string().max(1000).nullable().optional(),
  plantName: z.string().max(200),
  scientificName: z.string().max(200),
  healthStatus: HealthStatusSchema,
  confidence: z.number().min(0).max(100),
  severity: SeverityLevelSchema,
  affectedAreaPercent: z.number().min(0).max(100),
  diseaseName: z.string().max(250),
  pathogenName: z.string().max(250),
  pathogenType: PathogenTypeSchema,
  summary: z.string().max(2500),
  symptoms: z.array(z.string().max(500)).max(12),
  causes: z.array(z.string().max(500)).max(12),
  organicTreatments: z.array(z.string().max(500)).max(12),
  chemicalTreatments: z.array(z.string().max(500)).max(12),
  preventionTips: z.array(z.string().max(500)).max(12),
  engineUsed: z.string(),
  processingTimeMs: z.number().nonnegative(),
});

export type PlantDiagnosis = z.infer<typeof PlantDiagnosisSchema>;

export type StreamStage =
  | "security_check"
  | "ai_inference"
  | "validation"
  | "complete"
  | "error";

export interface StreamEventPayload {
  stage: StreamStage;
  progress: number;
  message: string;
  timestamp: number;
  diagnosis?: PlantDiagnosis;
  error?: string;
}
