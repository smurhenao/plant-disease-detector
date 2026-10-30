import type { AllowedMimeType } from "@/domain/schemas";

export interface ProcessedImagePayload {
  dataUrl: string;
  base64: string;
  mimeType: AllowedMimeType;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

const MAX_DIMENSION = 1024;

/**
 * Sanitiza y optimiza la imagen en el navegador del usuario antes de enviarla al servidor:
 * 1. Elimina todos los metadatos privados EXIF / coordenadas GPS re-dibujando en Canvas 2D.
 * 2. Redimensiona hasta un máximo de 1024px reduciendo el peso un ~90% para máxima velocidad.
 */
export async function processImageFileOnClient(
  fileOrBlob: Blob
): Promise<ProcessedImagePayload> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        const origW = img.naturalWidth || img.width || 640;
        const origH = img.naturalHeight || img.height || 480;

        const scale = Math.min(1, MAX_DIMENSION / Math.max(origW, origH));
        const targetW = Math.max(1, Math.round(origW * scale));
        const targetH = Math.max(1, Math.round(origH * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el motor gráfico Canvas 2D."));
          return;
        }

        // Fondo neutro por si el usuario sube un PNG transparente
        ctx.fillStyle = "#f8faf8";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const mimeType: AllowedMimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, 0.88);
        const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
        const compressedBytes = Math.round((base64.length * 3) / 4);

        resolve({
          dataUrl,
          base64,
          mimeType,
          originalBytes: fileOrBlob.size || compressedBytes,
          compressedBytes,
          width: targetW,
          height: targetH,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          "No fue posible decodificar la imagen. Asegúrate de subir un archivo JPEG, PNG o WebP válido."
        )
      );
    };

    img.src = objectUrl;
  });
}
