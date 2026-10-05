import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Polices auto-hébergées (paquets Fontsource) : aucun appel à Google au build ni chez le visiteur.
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});
const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "MKFit — Équipement de sport, vêtements et nutrition",
    template: "%s | MKFit",
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
    title: "MKFit — Équipement de sport, vêtements et nutrition",
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
