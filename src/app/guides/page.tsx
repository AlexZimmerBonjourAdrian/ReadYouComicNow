import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Guías",
  description: "Guías para leer cómics y manga en el navegador con ReadYouComicNow.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <SeoLayout title="Guías" description="Aprende a sacar partido al lector.">
      <ul className="list-disc pl-6">
        <li>
          <a className="text-[#C0392B] hover:underline" href="/guides/leer-cbz-en-navegador">
            Cómo leer archivos CBZ en el navegador
          </a>
        </li>
        <li>
          <a className="text-[#C0392B] hover:underline" href="/guides/manga-derecha-a-izquierda">
            Manga derecha a izquierda: cómo funciona
          </a>
        </li>
      </ul>
    </SeoLayout>
  );
}
