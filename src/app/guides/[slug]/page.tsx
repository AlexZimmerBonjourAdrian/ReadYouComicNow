import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

const guides: Record<string, { title: string; description: string; body: string }> = {
  "leer-cbz-en-navegador": {
    title: "Cómo leer archivos CBZ en el navegador",
    description: "Guía paso a paso para abrir y leer cómics CBZ con ReadYouComicNow.",
    body: "Abre ReadYouComicNow, selecciona tu archivo CBZ y empieza a leer. Puedes cambiar entre layouts simple, doble y scroll, y usar zoom para adaptar la lectura a tu pantalla. Todo ocurre localmente en tu navegador.",
  },
  "manga-derecha-a-izquierda": {
    title: "Manga derecha a izquierda: cómo funciona",
    description: "Entiende el modo RTL y cómo usarlo para leer manga.",
    body: "El modo manga derecha a izquierda invierte la navegación y el orden de las páginas en layouts dobles, para respetar la lectura original del manga. Puedes activarlo desde el visor en cualquier momento.",
  },
};

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  return {
    title: guide?.title ?? "Guía",
    description: guide?.description,
    alternates: { canonical: `/guides/${slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLayout title={guide.title} description={guide.description}>
        <p>{guide.body}</p>
        <p>
          <a className="text-[#C0392B] hover:underline" href="/">
            Abrir el lector
          </a>
        </p>
      </SeoLayout>
    </>
  );
}
