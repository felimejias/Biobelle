import type { MetadataRoute } from "next";
import { professionals } from "./equipo/data";
import { treatmentDetails } from "./tratamientos/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.biobelle.cl";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/lista-espera`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...treatmentDetails.map(({ slug }) => ({ url: `${base}/tratamientos/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...professionals.map(({ slug }) => ({ url: `${base}/equipo/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
