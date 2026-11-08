import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://iridescent-sfogliatella-71f40c.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ReadYouComicNow — Lector de cómics y manga en el navegador",
    template: "%s | ReadYouComicNow",
  },
  description:
    "Lee cómics y manga en tu navegador: CBZ, PDF e imágenes. Procesamiento 100% local, sin subidas. Layouts simple, doble y scroll, modo manga derecha a izquierda.",
  keywords: [
    "lector de cómics online",
    "lector de manga navegador",
    "leer cbz online",
    "cbz reader",
    "pdf comic reader",
    "manga rtl",
    "comic reader local",
    "leer cómics sin subidas",
    "comic reader online",
    "manga reader browser",
  ],
  authors: [{ name: "ReadYouComicNow" }],
  creator: "ReadYouComicNow",
  publisher: "ReadYouComicNow",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "ReadYouComicNow",
    title: "ReadYouComicNow — Lector de cómics y manga en el navegador",
    description:
      "Lee CBZ, PDF e imágenes en tu navegador. 100% local, sin subidas, con layouts a medida y modo manga RTL.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ReadYouComicNow, lector de cómics y manga en el navegador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadYouComicNow — Lector de cómics y manga en el navegador",
    description:
      "Lee CBZ, PDF e imágenes en tu navegador. 100% local, sin subidas, con layouts a medida y modo manga RTL.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/Icon/ajuste_avatar_Documents-3.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ReadYouComicNow",
  description:
    "Lector de cómics y manga en el navegador con procesamiento 100% local. Soporta CBZ, PDF e imágenes, layouts simple/doble/scroll y modo manga derecha a izquierda.",
  url: siteUrl,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Lectura de CBZ",
    "Lectura de PDF de cómics",
    "Imágenes sueltas",
    "Layouts simple, doble y scroll",
    "Modo manga derecha a izquierda",
    "Procesamiento 100% local",
    "Sin subidas de archivos",
  ],
  screenshot: `${siteUrl}/images/Wata/WhereAreTheAlices.JPG`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <footer className="border-t border-[#2A2E33] bg-[#0f0f0f] px-6 py-8 text-[12px] text-[#9CA3AF]">
          <nav className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2">
            <a href="/features" className="hover:text-white">Funciones</a>
            <a href="/formats/cbz" className="hover:text-white">CBZ</a>
            <a href="/formats/pdf" className="hover:text-white">PDF</a>
            <a href="/formats/images" className="hover:text-white">Imágenes</a>
            <a href="/manga-right-to-left" className="hover:text-white">Manga RTL</a>
            <a href="/layouts" className="hover:text-white">Layouts</a>
            <a href="/faq" className="hover:text-white">FAQ</a>
            <a href="/about" className="hover:text-white">Acerca de</a>
            <a href="/privacy" className="hover:text-white">Privacidad</a>
            <a href="/terms" className="hover:text-white">Términos</a>
          </nav>
          <p className="mx-auto mt-4 max-w-7xl">
            © {new Date().getFullYear()} ReadYouComicNow. Lector de cómics y manga 100% local.
          </p>
        </footer>
      </body>
    </html>
  );
}
