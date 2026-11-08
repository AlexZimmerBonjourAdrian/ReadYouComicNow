import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Funciones",
  description:
    "Descubre las funciones de ReadYouComicNow: lectura de CBZ, PDF e imágenes, layouts simple, doble y scroll, zoom, modo manga RTL y procesamiento local.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return (
    <SeoLayout
      title="Funciones de ReadYouComicNow"
      description="Todo lo que necesitas para leer cómics y manga en el navegador, sin subir archivos."
    >
      <ul className="list-disc pl-6">
        <li>Lectura de archivos CBZ y ZIP con imágenes.</li>
        <li>Soporte para PDF de cómics.</li>
        <li>Imágenes sueltas: JPG, PNG, WebP, AVIF, GIF, BMP.</li>
        <li>Layouts simple, doble página y scroll.</li>
        <li>Modo manga derecha a izquierda.</li>
        <li>Zoom, paneo y navegación por teclado.</li>
        <li>Procesamiento 100% local: tus archivos no salen del navegador.</li>
      </ul>
      <p>
        <a className="text-[#C0392B] hover:underline" href="/">
          Abrir el lector
        </a>
      </p>
    </SeoLayout>
  );
}
