import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from "@react-email/components";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

// Couleurs de la charte (app/globals.css), dupliquées ici : les clients
// email ne peuvent pas lire les variables CSS du site, il faut des valeurs
// en dur. Polices : DM Serif Display / DM Sans ne sont pas disponibles dans
// les messageries, on retombe sur Georgia (titres) et la police système.
export const EMAIL_COLORS = {
  navy: "#0b1f3a",
  brand: "#1565c0",
  ink: "#0b1f3a",
  inkSoft: "#46576f",
  page: "#f5f7fa",
  line: "#e0e4ec",
  brandSoft: "#e3f0ff",
} as const;

const SERIF = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const SANS =
  "'DM Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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
          backgroundColor: EMAIL_COLORS.page,
          fontFamily: SANS,
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            maxWidth: 520,
            margin: "0 auto",
            overflow: "hidden",
            border: `1px solid ${EMAIL_COLORS.line}`,
          }}
        >
          <Section
            style={{ backgroundColor: EMAIL_COLORS.navy, padding: "22px 32px" }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 22,
                lineHeight: "26px",
                margin: 0,
              }}
            >
              Référence
            </Text>
            <Text
              style={{
                color: "#81adfc",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "3px 0 0",
              }}
            >
              Informatique
            </Text>
          </Section>

          <Section style={{ padding: "32px" }}>
            <Text
              style={{
                color: EMAIL_COLORS.ink,
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 26,
                lineHeight: "30px",
                margin: "0 0 18px",
              }}
            >
              {heading}
            </Text>
            {children}
          </Section>

          <Hr style={{ borderColor: EMAIL_COLORS.line, margin: 0 }} />

          <Section style={{ padding: "20px 32px 26px" }}>
            <Text
              style={{
                color: EMAIL_COLORS.inkSoft,
                fontSize: 13,
                lineHeight: "20px",
                margin: 0,
              }}
            >
              Une question ? Répondez à cet email, ou écrivez-nous sur{" "}
              <Link
                href={`https://wa.me/${SITE.whatsapp}`}
                style={{ color: EMAIL_COLORS.brand, fontWeight: 500 }}
              >
                WhatsApp au {SITE.phoneDisplay}
              </Link>
              .
            </Text>
            <Text
              style={{
                color: "#8795ad",
                fontSize: 12,
                margin: "10px 0 0",
              }}
            >
              {SITE.name} — Burkina Faso
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailTextStyle = {
  color: EMAIL_COLORS.inkSoft,
  fontFamily: SANS,
  fontSize: 15,
  lineHeight: "24px",
  margin: "0 0 14px",
};

export const emailStrongStyle = { color: EMAIL_COLORS.ink, fontWeight: 700 };

/** Style du bouton d'appel à l'action des emails. */
export const emailButtonStyle = {
  backgroundColor: EMAIL_COLORS.brand,
  color: "#ffffff",
  fontFamily: SANS,
  padding: "14px 26px",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
  marginTop: 8,
};
