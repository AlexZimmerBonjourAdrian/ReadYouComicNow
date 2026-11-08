import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Lector de PDF de cómics",
  description:
    "Lee PDF de cómics y manga en el navegador con ReadYouComicNow. Procesamiento local, sin subidas, con zoom y navegación cómoda.",
  alternates: { canonical: "/formats/pdf" },
};

export default function PdfPage() {
  return (
    <SeoLayout
      title="Lector de PDF de cómics"
      description="Abre PDF de cómics y manga directamente en tu navegador."
    >
      <p>
        Si tienes cómics o manga en PDF, ReadYouComicNow los renderiza en tu navegador sin
        necesidad de instalar un lector externo.
      </p>
      <p>
        Puedes usar zoom, paneo y modos de lectura para adaptar la experiencia a tu pantalla.
      </p>
      <p>
        <a className="text-[#C0392B] hover:underline" href="/">
          Abrir un PDF
        </a>
      </p>
    </SeoLayout>
  );
}
