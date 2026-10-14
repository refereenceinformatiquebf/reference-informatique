import type { Metadata } from "next";
import { AdminHeader, Facts, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma/client";
import { SITE } from "@/lib/site";
import {
  SETTING_KEYS,
  announcementSchema,
  legalSchema,
  isLegalComplete,
} from "@/lib/settings";
import { AnnouncementForm, LegalForm } from "./settings-forms";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  // Lecture directe (sans cache) : l'équipe voit toujours ce qu'elle a enregistré.
  const rows = await prisma.siteSetting.findMany();
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const legal = legalSchema.parse(byKey.get(SETTING_KEYS.legal) ?? {});
  const announcement = announcementSchema.parse(
    byKey.get(SETTING_KEYS.announcement) ?? {},
  );

  return (
    <>
      <AdminHeader
        title="Paramètres"
        subtitle="Informations légales de l'entreprise et bandeau d'annonce du site."
      />
      <div className="flex flex-col gap-6">
        <Panel title="Informations légales">
          <p className="text-ink-soft mb-4 text-sm leading-relaxed">
            Ces informations alimentent la page « Mentions légales ».{" "}
            {isLegalComplete(legal) ? (
              <strong className="text-success-text">
                La page est publiée (lien dans le pied de page).
              </strong>
            ) : (
              <strong className="text-warning-text">
                La page n&apos;est pas publiée tant que le nom, l&apos;adresse
                et l&apos;email de contact ne sont pas renseignés.
                N&apos;écrivez que des informations exactes.
              </strong>
            )}
          </p>
          <LegalForm values={legal} />
        </Panel>

        <Panel title="Bandeau d'annonce">
          <AnnouncementForm values={announcement} />
        </Panel>

        <Panel title="Coordonnées du site (dans le code)">
          <Facts
            items={[
              { label: "Adresse du site", value: SITE.url },
              { label: "WhatsApp et téléphone", value: SITE.phoneDisplay },
              {
                label: "Email d'envoi",
                value:
                  process.env.BREVO_SENDER_EMAIL ??
                  "hello@reference-informatique.com",
              },
              {
                label: "Alertes envoyées à",
                value: process.env.ADMIN_NOTIFICATION_EMAIL ?? "—",
              },
            ]}
          />
          <p className="text-ink-faint mt-3 text-xs">
            Ces valeurs se changent dans les variables d&apos;environnement de
            Vercel (voir « État du système »).
          </p>
        </Panel>
      </div>
    </>
  );
}
