import type { Metadata } from "next";
import SeoLayout from "@/components/SeoLayout";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Política de privacidad de ReadYouComicNow: procesamiento local, sin subida de archivos.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <SeoLayout title="Privacidad" description="Tu biblioteca se queda en tu navegador.">
      <p>
        ReadYouComicNow procesa los archivos localmente en tu navegador. No subimos tus cómics,
        imágenes ni PDF a ningún servidor.
      </p>
      <p>
        Si en el futuro se añade analítica, se actualizará esta política y se informará al usuario.
      </p>
    </SeoLayout>
  );
}
