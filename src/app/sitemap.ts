import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://iridescent-sfogliatella-71f40c.netlify.app";

const routes = [
  "",
  "/features",
  "/formats/cbz",
  "/formats/pdf",
  "/formats/images",
  "/manga-right-to-left",
  "/layouts",
  "/faq",
  "/about",
  "/changelog",
  "/guides",
  "/guides/leer-cbz-en-navegador",
  "/guides/manga-derecha-a-izquierda",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
