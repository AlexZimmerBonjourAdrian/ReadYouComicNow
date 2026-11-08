import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Modo manga derecha a izquierda",
  description:
    "Lee manga en modo derecha a izquierda con ReadYouComicNow. Navegación RTL, layouts dobles y control total en el navegador.",
  alternates: { canonical: "/manga-right-to-left" },
};

export default function MangaRtlPage() {
  return (
    <SeoLayout
      title="Modo manga derecha a izquierda"
      description="Lectura RTL para manga, con navegación y layouts adaptados."
    >
      <p>
        ReadYouComicNow incluye modo manga derecha a izquierda, ideal para títulos japoneses y
        otros cómics con lectura RTL.
      </p>
      <p>
        Puedes alternar entre LTR y RTL en cualquier momento, manteniendo zoom y layouts.
      </p>
      <p>
        <a className="text-[#C0392B] hover:underline" href="/">
          Probar modo manga
        </a>
      </p>
    </SeoLayout>
  );
}
