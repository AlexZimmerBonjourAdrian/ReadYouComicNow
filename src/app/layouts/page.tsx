import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Layouts de lectura",
  description:
    "Elige entre layouts simple, doble página y scroll para leer cómics y manga en ReadYouComicNow.",
  alternates: { canonical: "/layouts" },
};

export default function LayoutsPage() {
  return (
    <SeoLayout
      title="Layouts de lectura"
      description="Adapta la lectura a tu pantalla y a tu estilo."
    >
      <ul className="list-disc pl-6">
        <li>Simple: una página a la vez.</li>
        <li>Doble: pliegos para experiencia de tomo.</li>
        <li>Scroll: lectura continua vertical.</li>
      </ul>
      <p>
        <a className="text-[#C0392B] hover:underline" href="/">
          Abrir el lector
        </a>
      </p>
    </SeoLayout>
  );
}
