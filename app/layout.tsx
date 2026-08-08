import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Shell } from "@/components/shell";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Référence Informatique",
    template: "%s — Référence Informatique",
  },
  description:
    "Formations, conception de sites web, agents IA et maintenance informatique au Burkina Faso.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Référence Informatique",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Référence Informatique",
  url: SITE_URL,
  areaServed: "BF",
  description:
    "Formations, conception de sites web, agents IA et maintenance informatique au Burkina Faso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased">
        <JsonLd data={organizationJsonLd} />
        <Shell>{children}</Shell>
        {/* Mesure réelle des Core Web Vitals une fois déployé sur Vercel
            (Étape 16) — n'a aucun effet en dehors de cette plateforme. */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
