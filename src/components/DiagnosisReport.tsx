"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sprout,
  Microscope,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import type { PlantDiagnosis } from "@/domain/schemas";

interface DiagnosisReportProps {
  diagnosis: PlantDiagnosis;
}

const SEVERITY_MAP: Record<
  PlantDiagnosis["severity"],
  { label: string; color: string; barColor: string }
> = {
  none: {
    label: "Sin daño foliar",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
  },
  low: {
    label: "Severidad Baja",
    color: "bg-lime-50 text-lime-700 border-lime-200",
    barColor: "bg-lime-500",
  },
  moderate: {
    label: "Severidad Moderada",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    barColor: "bg-amber-500",
  },
  high: {
    label: "Severidad Alta",
    color: "bg-orange-50 text-orange-800 border-orange-200",
    barColor: "bg-orange-500",
  },
  critical: {
    label: "Severidad Crítica",
    color: "bg-rose-50 text-rose-800 border-rose-200",
    barColor: "bg-rose-600",
  },
};

const PATHOGEN_TYPE_LABELS: Record<PlantDiagnosis["pathogenType"], string> = {
  fungal: "Hongo / Oomiceto Fitopatógeno",
  bacterial: "Bacteria Fitopatógena",
  viral: "Virus Vegetal",
  pest: "Plaga / Ácaro / Insecto",
  nutritional: "Deficiencia Nutricional / Fisiopatía",
  abiotic: "Estrés Abiótico",
  none: "Tejido Sano / Sin Patógeno",
};

export function DiagnosisReport({ diagnosis }: DiagnosisReportProps) {
  const [activeTab, setActiveTab] = useState<
    "symptoms" | "organic" | "chemical" | "prevention"
  >("symptoms");

  // Caso 1: Rechazo de Objeto No Botánico (Verdadera detección de plantas)
  if (!diagnosis.isPlant || diagnosis.healthStatus === "non_plant") {
    return (
      <div className="rounded-3xl border border-rose-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                Verificación Botánica Activa
              </span>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                No se detectó ninguna planta en la imagen
              </h2>
              <p className="text-sm text-stone-500 mt-0.5">
                Elemento identificado:{" "}
                <span className="font-medium text-stone-700">
                  {diagnosis.detectedSubject}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200/70">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>{diagnosis.processingTimeMs} ms</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-rose-50/60 border border-rose-100 p-4 text-sm text-rose-900 leading-relaxed">
          <p className="font-semibold mb-1">Motivo del rechazo:</p>
          <p>{diagnosis.rejectionReason || diagnosis.summary}</p>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-stone-900 text-stone-100 p-4 text-xs leading-relaxed">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <p>
            El sistema valida primero que la imagen corresponda genuinamente a una
            planta, hoja, flor o cultivo antes de emitir un diagnóstico fitosanitario.
          </p>
        </div>
      </div>
    );
  }

  // Caso 2: Planta Detectada (Sana o Enferma)
  const isHealthy = diagnosis.healthStatus === "healthy";
  const severityMeta = SEVERITY_MAP[diagnosis.severity];

  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm">
      {/* Encabezado clínico */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
              isHealthy
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  isHealthy
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : severityMeta.color
                }`}
              >
                {isHealthy ? "Planta Sana" : severityMeta.label}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                Confianza: {diagnosis.confidence.toFixed(1)}%
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-semibold text-stone-900 tracking-tight">
              {diagnosis.diseaseName}
            </h2>

            <p className="mt-0.5 text-sm text-stone-600">
              Especie:{" "}
              <strong className="font-semibold text-stone-800">
                {diagnosis.plantName}
              </strong>{" "}
              <span className="italic text-stone-500">
                ({diagnosis.scientificName})
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
            <Sparkles className="h-3.5 w-3.5 text-botanical-600" />
            API {diagnosis.engineUsed}
          </span>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Latencia: {diagnosis.processingTimeMs} ms
          </span>
        </div>
      </div>

      {/* Resumen ejecutivo y Agente causal */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl bg-stone-50/80 border border-stone-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
            Diagnóstico Clínico
          </p>
          <p className="text-sm text-stone-700 leading-relaxed">
            {diagnosis.summary}
          </p>
        </div>

        <div className="rounded-2xl bg-stone-50/80 border border-stone-200/70 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Agente Etiológico
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-900 italic">
              {diagnosis.pathogenName}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {PATHOGEN_TYPE_LABELS[diagnosis.pathogenType]}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/70">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-500">Área foliar afectada</span>
              <span className="font-semibold text-stone-800">
                {diagnosis.affectedAreaPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${severityMeta.barColor}`}
                style={{
                  width: `${Math.max(4, diagnosis.affectedAreaPercent)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas de Tratamiento y Manejo Integrado */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("symptoms")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              activeTab === "symptoms"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Microscope className="h-3.5 w-3.5" />
            Síntomas y Causas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("organic")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              activeTab === "organic"
                ? "bg-botanical-700 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Leaf className="h-3.5 w-3.5" />
            Manejo Orgánico
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chemical")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              activeTab === "chemical"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Control Químico
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prevention")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              activeTab === "prevention"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Sprout className="h-3.5 w-3.5" />
            Prevención
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "symptoms" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-stone-200/70 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                  Signos y Síntomas Observados
                </h4>
                <ul className="space-y-2 text-sm text-stone-700">
                  {diagnosis.symptoms.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-botanical-600 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-stone-200/70 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                  Causas Probables
                </h4>
                <ul className="space-y-2 text-sm text-stone-700">
                  {diagnosis.causes.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "organic" && (
            <div className="rounded-2xl border border-botanical-200 bg-botanical-50/40 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-botanical-800 mb-2.5">
                Tratamiento Ecológico y Biológico Recomendado
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-800">
                {diagnosis.organicTreatments.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-botanical-200 text-[11px] font-bold text-botanical-900">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "chemical" && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                Control Químico / Fitosanitario
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-700">
                {diagnosis.chemicalTreatments.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-stone-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "prevention" && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                Medidas Preventivas y Buenas Prácticas
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-700">
                {diagnosis.preventionTips.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-botanical-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
