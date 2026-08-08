import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from "@react-email/components";
import type { ReactNode } from "react";

// Couleurs dupliquées depuis app/globals.css : les clients email ne
// peuvent pas lire les variables CSS du site, il faut des valeurs en dur.
const BRAND = "#1e3a5f";
const INK = "#161b22";
const INK_SOFT = "#4b5563";
const PAPER_RAISED = "#f7f8fa";
const LINE = "#e5e7eb";

export function EmailLayout({
  preview,
  heading,
  children,
}: {
  preview: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: PAPER_RAISED,
          fontFamily:
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            maxWidth: 480,
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          <Section style={{ backgroundColor: BRAND, padding: "20px 28px" }}>
            <Text
              style={{
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 16,
                margin: 0,
              }}
            >
              Référence Informatique
            </Text>
          </Section>

          <Section style={{ padding: "28px" }}>
            <Text
              style={{
                color: INK,
                fontSize: 18,
                fontWeight: 700,
                margin: "0 0 16px",
              }}
            >
              {heading}
            </Text>
            {children}
          </Section>

          <Hr style={{ borderColor: LINE, margin: 0 }} />

          <Section style={{ padding: "20px 28px" }}>
            <Text style={{ color: INK_SOFT, fontSize: 12, margin: 0 }}>
              Référence Informatique — Burkina Faso
              <br />
              Une question ? Répondez directement à cet email ou écrivez-nous
              sur WhatsApp.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailTextStyle = {
  color: INK_SOFT,
  fontSize: 14,
  lineHeight: "22px",
};
export const emailStrongStyle = { color: INK, fontWeight: 700 };
