import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhytoScan AI — Detector Clínico de Enfermedades en Plantas",
  description:
    "Plataforma moderna, minimalista y segura para la detección de plantas y diagnóstico fitopatológico en tiempo real con IA Multimodal y catálogo PlantVillage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f6f7f4] text-stone-900 selection:bg-botanical-200 selection:text-botanical-950">
        {children}
      </body>
    </html>
  );
}
