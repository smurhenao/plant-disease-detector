"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Zap,
  KeyRound,
  X,
  CheckCircle2,
  Server,
  FileCheck2,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { sanitizeAndExtractApiKey } from "@/security/file-validator";

interface SecurityArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  hasServerKey: boolean;
}

export function SecurityArchitectureModal({
  isOpen,
  onClose,
  customApiKey,
  onSaveApiKey,
  hasServerKey,
}: SecurityArchitectureModalProps) {
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(customApiKey);
      setStatusMessage(null);
    }
  }, [isOpen, customApiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeAndExtractApiKey(inputKey);
    setInputKey(cleaned);
    onSaveApiKey(cleaned);
    setStatusMessage(
      cleaned
        ? "Clave guardada y sanitizada correctamente (lista para Gemini 3.8 Flash)."
        : "Clave eliminada de la sesión."
    );
  };

  const handleClearKey = () => {
    setInputKey("");
    onSaveApiKey("");
    setStatusMessage(
      "Clave borrada por completo. Ahora puedes pegar una clave limpia sin riesgo de sobrescritura."
    );
  };

  const maskedPreview =
    customApiKey.length > 10
      ? `${customApiKey.slice(0, 6)}••••••••••••${customApiKey.slice(-4)}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-botanical-50 text-botanical-700 border border-botanical-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-900">
              Seguridad y Configuración de API
            </h2>
            <p className="text-xs text-stone-500">
              Motor activo: <strong>models/gemini-3.8-flash</strong> con blindaje multicapa
            </p>
          </div>
        </div>

        {/* Configuración de API Key */}
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/80 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="gemini-key-input"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700"
            >
              <KeyRound className="h-4 w-4 text-botanical-600" />
              Clave GEMINI_API_KEY (Gemini 3.8 Flash)
            </label>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                hasServerKey || customApiKey
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {hasServerKey
                ? "Configurada en Servidor (.env)"
                : customApiKey
                  ? `Activa: ${maskedPreview}`
                  : "Sin clave activa"}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
            Si vas a cambiar de clave, usa primero el botón{" "}
            <strong>Borrar clave</strong> para asegurarte de que no se concatene
            con la anterior.
          </p>

          <div className="mt-3 flex flex-wrap sm:flex-nowrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <input
                id="gemini-key-input"
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Pega aquí tu clave AIzaSy..."
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-stone-300 bg-white pl-3.5 pr-10 py-2 text-sm text-stone-800 focus:border-botanical-600 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                title={showKey ? "Ocultar clave" : "Mostrar clave"}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-botanical-700 px-4 py-2 text-xs font-semibold text-white hover:bg-botanical-600 transition shrink-0"
            >
              Guardar clave
            </button>

            <button
              type="button"
              onClick={handleClearKey}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shrink-0"
              title="Eliminar la clave guardada en sesión"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Borrar clave
            </button>
          </div>

          {statusMessage && (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </p>
          )}
        </form>

        {/* Capas de Seguridad Implementadas */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-2xl border border-stone-200/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <FileCheck2 className="h-4 w-4 text-botanical-600" />
              Magic Bytes + Escaneo Anti-Políglota
            </div>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              Verifica la firma hexadecimal real (<code className="font-mono">FF D8 FF</code>,{" "}
              <code className="font-mono">89 50 4E 47</code>,{" "}
              <code className="font-mono">RIFF..WEBP</code>) y bloquea imágenes con scripts
              ocultos.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Lock className="h-4 w-4 text-botanical-600" />
              Limpieza EXIF / GPS y Protección CSRF
            </div>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              Elimina metadatos EXIF y ubicación GPS de la foto en el cliente antes de subirla,
              y bloquea peticiones Cross-Site (<code className="font-mono">Sec-Fetch-Site</code>).
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Zap className="h-4 w-4 text-botanical-600" />
              Cabecera Cifrada + Gemini 3.8 Flash
            </div>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              La clave viaja en la cabecera privada <code className="font-mono">x-goog-api-key</code>{" "}
              hacia <code className="font-mono">models/gemini-3.8-flash</code> con validación
              en <strong>Zod</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Server className="h-4 w-4 text-botanical-600" />
              Rate Limiting por IP + CSP Estricta
            </div>
            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
              Limitador de tasa <em>Sliding Window</em> en memoria LRU contra abusos/DoS y
              cabeceras HTTP <code className="font-mono">Content-Security-Policy</code>,{" "}
              <code className="font-mono">HSTS</code> y <code className="font-mono">DENY</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
