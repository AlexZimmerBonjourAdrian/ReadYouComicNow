import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre ReadYouComicNow: formatos compatibles, privacidad, procesamiento local y uso del lector.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "¿Qué formatos soporta ReadYouComicNow?",
    a: "CBZ/ZIP con imágenes, PDF e imágenes sueltas (JPG, PNG, WebP, AVIF, GIF, BMP).",
  },
  {
    q: "¿Se suben mis archivos a un servidor?",
    a: "No. Todo el procesamiento ocurre en tu navegador; tus archivos no salen de tu dispositivo.",
  },
  {
    q: "¿Puedo leer manga derecha a izquierda?",
    a: "Sí, incluye modo manga RTL con navegación y layouts adaptados.",
  },
  {
    q: "¿Es gratis?",
    a: "Sí, ReadYouComicNow es gratuito.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLayout
        title="Preguntas frecuentes"
        description="Todo lo que necesitas saber sobre el lector."
      >
        {faqs.map((f) => (
          <section key={f.q}>
            <h2 className="text-xl font-semibold text-white">{f.q}</h2>
            <p>{f.a}</p>
          </section>
        ))}
        <p>
          <a className="text-[#C0392B] hover:underline" href="/">
            Volver al lector
          </a>
        </p>
      </SeoLayout>
    </>
  );
}
