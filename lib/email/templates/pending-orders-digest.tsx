import { Link, Text } from "@react-email/components";
import {
  EmailLayout,
  EMAIL_COLORS,
  emailStrongStyle,
  emailTextStyle,
} from "./layout";
import { formatPrice } from "@/lib/format";

export interface PendingOrderDigestRow {
  reference: string;
  clientName: string;
  clientPhone: string | null;
  clientCountry: string | null;
  clientEmail: string | null;
  productName: string;
  amount: number;
  status: "EN_ATTENTE" | "ECHOUE";
  createdAgo: string;
  whatsappUrl: string | null;
  adminUrl: string;
}

const rowBox = {
  border: `1px solid ${EMAIL_COLORS.line}`,
  borderRadius: 10,
  padding: "14px 16px",
  marginBottom: 12,
};

/** Rapport 9h/13h/19h des commandes non finalisées (voir lib/checkout/call-digest.ts) — relance manuelle par téléphone/WhatsApp. */
export function PendingOrdersDigestEmail({
  rows,
}: {
  rows: PendingOrderDigestRow[];
}) {
  if (rows.length === 0) {
    return (
      <EmailLayout
        preview="Aucune commande en attente à relancer"
        heading="Rien à signaler"
      >
        <Text style={emailTextStyle}>
          Aucune nouvelle commande en attente à relancer pour le moment. Le
          système de rappel fonctionne normalement.
        </Text>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout
      preview={`${rows.length} commande${rows.length > 1 ? "s" : ""} en attente à relancer`}
      heading={`${rows.length} commande${rows.length > 1 ? "s" : ""} en attente à relancer`}
    >
      <Text style={emailTextStyle}>
        Ces commandes n&apos;ont pas encore été payées — un appel ou un message
        WhatsApp peut suffire à conclure la vente.
      </Text>
      {rows.map((r) => (
        <div key={r.reference} style={rowBox}>
          <Text style={{ ...emailTextStyle, margin: "0 0 4px" }}>
            <strong style={emailStrongStyle}>{r.clientName}</strong>{" "}
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: r.status === "ECHOUE" ? "#b91c1c" : "#b45309",
              }}
            >
              {r.status === "ECHOUE" ? "· Échec de paiement" : "· En attente"}
            </span>
          </Text>
          <Text style={{ ...emailTextStyle, margin: "0 0 4px", fontSize: 13 }}>
            {r.reference} · {r.productName} ·{" "}
            <strong style={{ color: EMAIL_COLORS.brand }}>
              {formatPrice(r.amount)}
            </strong>
          </Text>
          <Text style={{ ...emailTextStyle, margin: "0 0 4px", fontSize: 13 }}>
            {r.clientPhone ?? "—"}
            {r.clientCountry ? ` · ${r.clientCountry}` : ""}
            {r.clientEmail ? ` · ${r.clientEmail}` : ""}
          </Text>
          <Text style={{ ...emailTextStyle, margin: "0 0 8px", fontSize: 12 }}>
            Créée {r.createdAgo}
          </Text>
          <Text style={{ ...emailTextStyle, margin: 0, fontSize: 13 }}>
            {r.whatsappUrl ? (
              <>
                <Link
                  href={r.whatsappUrl}
                  style={{ color: EMAIL_COLORS.brand, fontWeight: 700 }}
                >
                  WhatsApp
                </Link>
                {" · "}
              </>
            ) : null}
            <Link
              href={r.adminUrl}
              style={{ color: EMAIL_COLORS.brand, fontWeight: 700 }}
            >
              Ouvrir la commande
            </Link>
          </Text>
        </div>
      ))}
    </EmailLayout>
  );
}
