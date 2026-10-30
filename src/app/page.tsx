"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Leaf,
  Upload,
  Camera,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  History,
  Trash2,
  KeyRound,
} from "lucide-react";
import { DiagnosisReport } from "@/components/DiagnosisReport";
import { SecurityArchitectureModal } from "@/components/SecurityArchitectureModal";
import {
  processImageFileOnClient,
  type ProcessedImagePayload,
} from "@/lib/image-processor";
import type { PlantDiagnosis, StreamEventPayload } from "@/domain/schemas";

interface HistoryItem {
  id: string;
  timestamp: number;
  previewUrl: string;
  diagnosis: PlantDiagnosis;
}

export default function PlantDiseaseDetectorPage() {
  const [processedImage, setProcessedImage] =
    useState<ProcessedImagePayload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEventPayload[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cámara en vivo (WebRTC)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado del servidor y seguridad
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [hasServerKey, setHasServerKey] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedKey = sessionStorage.getItem("phytoscan_gemini_key") || "";
    if (savedKey) setCustomApiKey(savedKey);

    try {
      const savedHistory = localStorage.getItem("phytoscan_history_api");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch {
      // Ignorar errores de almacenamiento local
    }

    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasServerGeminiKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => {});
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const saveToHistory = useCallback(
    (imgPayload: ProcessedImagePayload, result: PlantDiagnosis) => {
      setHistory((prev) => {
        const next: HistoryItem[] = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            previewUrl: imgPayload.dataUrl,
            diagnosis: result,
          },
          ...prev.slice(0, 5),
        ];
        try {
          localStorage.setItem("phytoscan_history_api", JSON.stringify(next));
        } catch {
          // Ignorar cuota de localStorage
        }
        return next;
      });
    },
    []
  );

  const runRealtimeStreamingAnalysis = useCallback(
    async (payload: ProcessedImagePayload) => {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setDiagnosis(null);
      setStreamEvents([]);
      setCurrentProgress(10);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (customApiKey) {
          headers["x-gemini-api-key"] = customApiKey;
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers,
          body: JSON.stringify({
            imageBase64: payload.base64,
            mimeType: payload.mimeType,
          }),
        });

        if (!response.ok || !response.body) {
          const errJson = await response.json().catch(() => null);
          throw new Error(
            errJson?.error || `Error del servidor (${response.status})`
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const line = chunk
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!line) continue;

            const rawJson = line.slice(6).trim();
            if (!rawJson) continue;

            const event: StreamEventPayload = JSON.parse(rawJson);
            setStreamEvents((prev) => [...prev, event]);
            setCurrentProgress(event.progress);

            if (event.stage === "error") {
              setErrorMessage(
                event.error || "Error durante el análisis en la API."
              );
            } else if (event.stage === "complete" && event.diagnosis) {
              setDiagnosis(event.diagnosis);
              saveToHistory(payload, event.diagnosis);
            }
          }
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "No fue posible completar la transmisión de análisis."
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [customApiKey, saveToHistory]
  );

  const handleFileSelected = async (file: File) => {
    stopCamera();
    setErrorMessage(null);
    try {
      const payload = await processImageFileOnClient(file);
      setProcessedImage(payload);
      await runRealtimeStreamingAnalysis(payload);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Archivo de imagen no válido."
      );
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelected(file);
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = mediaStream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 50);
    } catch {
      setErrorMessage(
        "No se pudo acceder a la cámara. Verifica los permisos del navegador o sube una foto directamente."
      );
    }
  };

  const captureCameraFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const payload = await processImageFileOnClient(blob);
        setProcessedImage(payload);
        await runRealtimeStreamingAnalysis(payload);
      },
      "image/jpeg",
      0.9
    );
  };

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    if (key) {
      sessionStorage.setItem("phytoscan_gemini_key", key);
    } else {
      sessionStorage.removeItem("phytoscan_gemini_key");
    }
  };

  const isApiReady = hasServerKey || Boolean(customApiKey);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra Superior Minimalista */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f6f7f4]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-botanical-700 text-white shadow-xs">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 tracking-tight text-base">
                  PhytoScan
                </span>
                <span className="rounded-full bg-botanical-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-botanical-800">
                  API Cloud
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Detección Botánica y Diagnóstico Fitopatológico en Tiempo Real
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:border-botanical-400 hover:text-stone-900 transition shadow-2xs"
          >
            <ShieldCheck className="h-4 w-4 text-botanical-600" />
            <span>Seguridad & API Key</span>
            <span
              className={`h-2 w-2 rounded-full ${
                isApiReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
              title={
                isApiReady
                  ? "API Key lista"
                  : "Haz clic para configurar tu GEMINI_API_KEY"
              }
            />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-stone-200/80 px-3 py-1 text-xs text-stone-600 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-botanical-600" />
                <span>
                  Impulsado por Google Gemini Vision API · Streaming en Tiempo Real
                </span>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
                Detector inteligente de enfermedades en plantas
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Lock className="h-3.5 w-3.5 text-botanical-600 shrink-0" />
              <span>
                Validación Magic Bytes, protección CSRF y limpieza de metadatos GPS/EXIF
              </span>
            </div>
          </div>

          {/* Aviso rápido si aún no ha puesto su API Key */}
          {!isApiReady && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  Para analizar imágenes con la API en la nube, configura tu{" "}
                  <code className="font-mono font-semibold">GEMINI_API_KEY</code> en{" "}
                  <code className="font-mono">.env.local</code> o ingrésala en el panel
                  seguro.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(true)}
                className="rounded-xl bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 transition shrink-0"
              >
                Configurar API Key
              </button>
            </div>
          )}

          {/* Grid Principal: Izquierda (Subida / Cámara) | Derecha (Instrucciones y Diagnóstico) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-5 shadow-sm"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                  className="hidden"
                />

                {isCameraOpen ? (
                  <div className="relative overflow-hidden rounded-2xl bg-stone-950 aspect-[4/3]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-6 border border-emerald-400/50 rounded-2xl" />
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="rounded-xl bg-stone-900/80 backdrop-blur-xs px-3.5 py-2 text-xs font-medium text-white hover:bg-stone-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={captureCameraFrame}
                        className="inline-flex items-center gap-2 rounded-xl bg-botanical-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-botanical-500"
                      >
                        <Camera className="h-4 w-4" />
                        Capturar y Analizar
                      </button>
                    </div>
                  </div>
                ) : processedImage ? (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-2xl bg-stone-100 aspect-[4/3] border border-stone-200/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={processedImage.dataUrl}
                        alt="Imagen cargada"
                        className="h-full w-full object-cover"
                      />
                      {isAnalyzing && (
                        <div className="pointer-events-none absolute inset-0 bg-stone-950/20">
                          <div className="scanner-beam absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]" />
                        </div>
                      )}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 rounded-xl bg-stone-950/75 backdrop-blur-xs px-3 py-1.5 text-[11px] text-stone-200">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          EXIF eliminado ·{" "}
                          {Math.round(processedImage.compressedBytes / 1024)} KB
                        </span>
                        <span className="font-mono text-stone-300">
                          {processedImage.width}×{processedImage.height}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Subir otra foto
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Cámara
                      </button>
                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={() =>
                          runRealtimeStreamingAnalysis(processedImage)
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-botanical-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-botanical-600 disabled:opacity-50 transition"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            isAnalyzing ? "animate-spin" : ""
                          }`}
                        />
                        Re-analizar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-8 sm:p-10 text-center transition hover:border-botanical-500 hover:bg-botanical-50/30"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-botanical-100/80 text-botanical-700 group-hover:scale-105 transition">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-stone-900">
                      Sube o arrastra la foto de una planta
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                      Formatos aceptados: JPEG, PNG y WebP (máx. 4.5 MB).
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs">
                        <Upload className="h-3.5 w-3.5" />
                        Seleccionar archivo
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startCamera();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        <Camera className="h-3.5 w-3.5 text-botanical-600" />
                        Cámara en vivo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Historial de la sesión */}
              {history.length > 0 && (
                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                      <History className="h-4 w-4 text-botanical-600" />
                      <span>Análisis recientes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem("phytoscan_history_api");
                      }}
                      className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Limpiar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDiagnosis(item.diagnosis)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-100 bg-stone-50/60 p-2 text-left hover:border-botanical-300 hover:bg-white transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt=""
                            className="h-9 w-9 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-800 truncate">
                              {item.diagnosis.diseaseName}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">
                              {item.diagnosis.plantName} ·{" "}
                              {item.diagnosis.confidence.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 h-2.5 w-2.5 rounded-full ${
                            !item.diagnosis.isPlant
                              ? "bg-stone-400"
                              : item.diagnosis.healthStatus === "healthy"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Streaming, Diagnóstico o Instrucciones (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {(isAnalyzing || streamEvents.length > 0) && (
                <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-botanical-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      <span>Estado del análisis en tiempo real (SSE)</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-botanical-700">
                      {currentProgress}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-botanical-600 transition-all duration-300"
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {streamEvents.map((ev, idx) => (
                      <div
                        key={`${ev.stage}-${idx}`}
                        className="flex items-center justify-between text-xs text-stone-600"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              ev.stage === "error"
                                ? "bg-rose-500"
                                : ev.stage === "complete"
                                  ? "bg-emerald-500"
                                  : "bg-botanical-500"
                            }`}
                          />
                          {ev.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">No se pudo completar el análisis</p>
                    <p className="mt-0.5 text-xs text-rose-800">{errorMessage}</p>
                  </div>
                </div>
              )}

              {diagnosis ? (
                <DiagnosisReport diagnosis={diagnosis} />
              ) : (
                !isAnalyzing && (
                  <div className="rounded-3xl border border-stone-200/80 bg-white p-7 sm:p-9 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-botanical-50 text-botanical-700 border border-botanical-200">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-stone-900">
                          ¿Cómo funciona la plataforma?
                        </h2>
                        <p className="text-xs text-stone-500">
                          Instrucciones breves para obtener un diagnóstico preciso y seguro
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                          1
                        </span>
                        <h3 className="mt-3 text-sm font-semibold text-stone-900">
                          Captura o sube la hoja
                        </h3>
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                          Enfoca bien la hoja, tallo o fruto afectado con buena luz. Tu
                          navegador limpiará automáticamente los metadatos GPS/EXIF por
                          privacidad.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                          2
                        </span>
                        <h3 className="mt-3 text-sm font-semibold text-stone-900">
                          Verificación y Escaneo API
                        </h3>
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                          El servidor verifica la firma binaria (Magic Bytes) del archivo
                          y la API de Gemini confirma primero que realmente sea una planta.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                          3
                        </span>
                        <h3 className="mt-3 text-sm font-semibold text-stone-900">
                          Recibe el plan fitosanitario
                        </h3>
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                          Obtén en segundos la especie, severidad, síntomas y opciones de
                          tratamiento orgánico, químico y preventivo.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3 rounded-2xl bg-stone-50 border border-stone-200/70 px-4 py-3 text-xs text-stone-600">
                      <ShieldCheck className="h-4 w-4 text-botanical-600 shrink-0" />
                      <span>
                        <strong>Privacidad y Seguridad garantizadas:</strong> Sin modelos
                        locales imprecisos; todo el análisis se realiza con validación de
                        esquema JSON estricto, Rate Limiting por IP y cabeceras HTTP
                        seguras.
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <SecurityArchitectureModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        hasServerKey={hasServerKey}
      />
    </div>
  );
}
