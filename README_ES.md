🇪🇸 Español | [🇺🇸 English](README.md)

# 🌱 PhytoScan v2.0 — Detector Inteligente de Enfermedades en Plantas (Cloud API & Real-Time SSE)

Plataforma web moderna, minimalista y segura para la **detección real de plantas** y el **diagnóstico fitopatológico en tiempo real**, construida con **Next.js (App Router), TypeScript y Tailwind CSS**, lista para desplegar en **Vercel**.

---

## ✨ Características Principales

1. **Detección Botánica Real (Anti-Falsos Positivos)**:
   - Impulsada por **Google Gemini Vision API (`models/gemini-3.8-flash`)** con alta disponibilidad y conmutación automática ante picos de demanda.
   - Verifica primero si la imagen contiene genuinamente una planta, hoja, tallo, flor o fruto (`isPlant: boolean`), rechazando objetos no botánicos con explicación detallada.
2. **Streaming en Tiempo Real (Server-Sent Events — SSE)**:
   - Endpoint `/api/analyze` basado en `ReadableStream` (`text/event-stream`) 100% compatible con **Vercel Serverless**, transmitiendo en vivo cada etapa del análisis (`security_check` → `ai_inference` → `validation` → `complete`).
3. **Seguridad Multicapa (Defense-in-Depth)**:
   - **Verificación Criptográfica de Magic Bytes + Escaneo Anti-Políglota**: Valida las cabeceras hexadecimales reales (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `RIFF..WEBP`) y bloquea archivos con scripts embebidos.
   - **Limpieza de EXIF / GPS en el Navegador**: Re-codifica la imagen en `<canvas>` antes de enviarla, eliminando coordenadas GPS privadas y reduciendo el peso un ~90% para máxima velocidad.
   - **Protección Anti-CSRF y Rate Limiting por IP**: Bloqueo de peticiones *Cross-Site* (`Sec-Fetch-Site`) y limitador de tasa *Sliding Window* en memoria LRU.
   - **Ocultación de API Key y Validación Estricta con Zod**: La clave viaja en la cabecera privada `x-goog-api-key` y la salida del modelo es validada con esquemas estrictos de **Zod**.
   - **Cabeceras HTTP Seguras**: `Content-Security-Policy (CSP)`, `Strict-Transport-Security (HSTS)`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` y `Permissions-Policy`.

---

## 🏗️ Estructura del Software

```text
plant-disease-detector/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts       # Endpoint SSE en tiempo real con seguridad multicapa
│   │   ├── api/health/route.ts        # Estado del motor y auditoría de seguridad
│   │   ├── layout.tsx                 # Layout principal
│   │   └── page.tsx                   # Interfaz minimalista (Escáner + Cámara en vivo + Instrucciones)
│   ├── components/
│   │   ├── DiagnosisReport.tsx        # Informe clínico fitopatológico y rechazo No-Planta
│   │   └── SecurityArchitectureModal.tsx # Gestión segura de API Key y arquitectura de seguridad
│   ├── domain/
│   │   └── schemas.ts                 # Contratos estrictos con Zod
│   ├── lib/
│   │   └── image-processor.ts         # Compresión JPEG/WebP y eliminación de metadatos EXIF/GPS
│   ├── security/
│   │   ├── file-validator.ts          # Verificador binario de Magic Bytes, anti-políglota y sanitizador de claves
│   │   └── rate-limiter.ts            # Rate limiter Sliding Window en memoria LRU
│   └── services/
│       └── gemini-analyzer.ts         # Cliente Gemini 3.8 Flash con retry y alta disponibilidad
├── tests/                             # Suite de pruebas automatizadas de seguridad (Vitest)
└── vercel.json                        # Configuración lista para despliegue en Vercel
```

---

## 🚀 Ejecución Local y Despliegue en Vercel

```bash
npm install
cp .env.example .env.local # Configura tu GEMINI_API_KEY
npm run dev
```

En **Vercel**, importa el repositorio y agrega la variable de entorno `GEMINI_API_KEY` en *Project Settings → Environment Variables*.

---

## 🧑‍💻 Autor
**Sebastian Murillo** — Ingeniero de Software | Desarrollador Full Stack | IA & Datos
