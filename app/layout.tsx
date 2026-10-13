import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Shell } from "@/components/shell";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";
import "./globals.css";

// Typographie de la charte Boulga AI : DM Serif Display pour les titres,
// DM Sans pour tout le reste.
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Services informatiques et formations au Burkina Faso`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.name,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1f3a" },
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/brand/logo-icon.png`,
  areaServed: "BF",
  description: SITE.description,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: SITE.phoneInternational,
    availableLanguage: "fr",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`h-full ${dmSerif.variable} ${dmSans.variable}`}>
      <body className="min-h-full antialiased">
        <JsonLd data={organizationJsonLd} />
        <Shell>{children}</Shell>
        {/* Mesure réelle des Core Web Vitals une fois déployé sur Vercel
            — n'a aucun effet en dehors de cette plateforme. */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
