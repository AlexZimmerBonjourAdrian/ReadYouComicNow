import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Registro de cambios",
  description: "Historial de versiones y mejoras de ReadYouComicNow.",
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  return (
    <SeoLayout
      title="Registro de cambios"
      description="Mejoras y novedades del lector."
    >
      <section>
        <h2 className="text-xl font-semibold text-white">v1.0.0</h2>
        <p>Lector de cómics y manga con soporte CBZ, PDF e imágenes, layouts y modo manga RTL.</p>
      </section>
    </SeoLayout>
  );
}
