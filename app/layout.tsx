import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Référence Informatique",
    template: "%s — Référence Informatique",
  },
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
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
