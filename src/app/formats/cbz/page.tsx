import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Lector de archivos CBZ",
  description:
    "Lee archivos CBZ en tu navegador sin instalar nada. ReadYouComicNow abre cómics CBZ de forma local, rápida y privada.",
  alternates: { canonical: "/formats/cbz" },
};

export default function CbzPage() {
  return (
    <SeoLayout
      title="Lector de archivos CBZ"
      description="Abre cómics en formato CBZ directamente en el navegador."
    >
      <p>
        CBZ es uno de los formatos más usados para cómics digitales. Con ReadYouComicNow puedes
        abrir un archivo CBZ completo y navegar por sus páginas con layouts simple, doble o scroll.
      </p>
      <p>
        Todo el procesamiento ocurre en tu dispositivo: no se suben archivos ni se comparte tu
        biblioteca.
      </p>
      <p>
        <a className="text-[#C0392B] hover:underline" href="/">
          Leer un CBZ ahora
        </a>
      </p>
    </SeoLayout>
  );
}
