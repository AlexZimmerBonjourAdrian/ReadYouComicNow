import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Términos",
  description: "Términos de uso de ReadYouComicNow.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <SeoLayout title="Términos de uso" description="Condiciones de uso del lector.">
      <p>
        ReadYouComicNow se ofrece tal cual, para uso personal. Eres responsable del contenido que
        abras y de respetar los derechos de autor aplicables.
      </p>
    </SeoLayout>
  );
}
