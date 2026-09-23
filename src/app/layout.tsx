import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadYouComicNow - Comic & Manga Reader 100% Local",
  description: "Lightweight browser-based comic and manga reader. Fast local reading, custom layouts, total privacy. Open CBZ, PDF, EPUB and images without uploads.",
  keywords: ["comic reader", "manga reader", "cbz reader", "read comics online", "local comic reader", "manga rtl"],
  authors: [{ name: "ReadYouComicNow" }],
  creator: "ReadYouComicNow",
  publisher: "ReadYouComicNow",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ReadYouComicNow',
    description: 'Browser-based comic and manga reader with fast local reading, custom layouts and total privacy.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['CBZ reading', 'PDF comic reading', 'EPUB image reading', 'Single/double/scroll layouts', 'Manga right-to-left mode', '100% local processing'],
  };

  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
