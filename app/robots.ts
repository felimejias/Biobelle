import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/reserva/"] }], sitemap: "https://www.biobelle.cl/sitemap.xml" };
}
