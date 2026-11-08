import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Lector de imágenes de cómics",
  description:
    "Arma y lee cómics desde imágenes sueltas (JPG, PNG, WebP y más) en tu navegador con ReadYouComicNow.",
  alternates: { canonical: "/formats/images" },
};

export default function ImagesPage() {
  return (
    <SeoLayout
      title="Lector de imágenes de cómics"
      description="Selecciona varias imágenes y léelas como un cómic."
    >
      <p>
        Puedes seleccionar múltiples imágenes y leerlas como un capítulo al instante, con orden
        natural y layouts adaptables.
      </p>
      <p>
        Compatible con JPG, PNG, WebP, AVIF, GIF y BMP, procesadas localmente en tu navegador.
      </p>
      <p>
        <a className="text-[#C0392B] hover:underline" href="/">
          Empezar a leer
        </a>
      </p>
    </SeoLayout>
  );
}
