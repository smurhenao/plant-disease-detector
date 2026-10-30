[🇪🇸 Español](README_ES.md) | 🇺🇸 English

# 🌱 PhytoScan v2.0 — Real-Time Plant Disease Detection Platform (Cloud API & SSE)

Modern, minimalist, and security-hardened web platform for **true botanical detection** and **real-time foliar disease diagnosis**, built with **Next.js (App Router), TypeScript, and Tailwind CSS**, ready for **Vercel**.

---

## ✨ Key Highlights

- **True Botanical Validation (`models/gemini-3.8-flash`)**: Powered by the Google Gemini Vision API with automatic retry and high-availability failover. Verifies `isPlant: boolean` first and rejects non-botanical objects cleanly.
- **Real-Time SSE Streaming (`/api/analyze`)**: Built on native HTTP `ReadableStream` (`text/event-stream`) for real-time progress updates, 100% compatible with Vercel Serverless Functions.
- **Defense-in-Depth Security**:
  - **Binary Magic Bytes & Anti-Polyglot Inspection** (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `RIFF..WEBP`).
  - **Client-Side EXIF/GPS Stripping & Compression** via HTML5 Canvas (~90% payload reduction).
  - **CSRF Protection & Sliding-Window IP Rate Limiting** with LRU memory protection.
  - **Visual Prompt Injection Hardening** + strict **Zod** validation and HTTP CSP headers.

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local # Add GEMINI_API_KEY
npm run dev
```
