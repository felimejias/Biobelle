import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "600"] });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.biobelle.cl"),
  title: "BIOBELLE | Centro Médico Estético en Rancagua",
  description: "Medicina estética consciente, tecnología láser y dermocosmética. Agenda tu evaluación personalizada en BIOBELLE Rancagua.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "BIOBELLE | Tu belleza, en equilibrio.",
    description: "Medicina estética consciente y personalizada en Rancagua.",
    url: "/",
    siteName: "BIOBELLE",
    locale: "es_CL",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BIOBELLE — Tu belleza, en equilibrio." }],
  },
  twitter: { card: "summary_large_image", title: "BIOBELLE | Tu belleza, en equilibrio.", description: "Centro médico estético en Rancagua.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${serif.variable} ${sans.variable}`}>{children}</body></html>;
}
