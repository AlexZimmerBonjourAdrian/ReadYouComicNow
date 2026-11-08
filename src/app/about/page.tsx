import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "ReadYouComicNow es un lector de cómics y manga en el navegador, ligero, rápido y con privacidad total.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SeoLayout
      title="Acerca de ReadYouComicNow"
      description="Un lector web ligero para cómics y manga."
    >
      <p>
        ReadYouComicNow nace para leer cómics y manga directamente en el navegador, con
        procesamiento local y sin subidas.
      </p>
      <p>
        Repositorio:{" "}
        <a
          className="text-[#C0392B] hover:underline"
          href="https://github.com/AlexZimmerBonjourAdrian/ReadYouComicNow"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </p>
    </SeoLayout>
  );
}
