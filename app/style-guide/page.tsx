import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as Icons from "@/components/icons";

export const metadata: Metadata = {
  title: "Style guide (interne)",
  robots: { index: false, follow: false },
};

const iconEntries = Object.entries(Icons).filter(([name]) =>
  name.startsWith("Icon"),
) as [string, React.ComponentType<{ size?: number }>][];

/**
 * Page de référence interne — pas liée dans la navigation. Sert à vérifier
 * la cohérence visuelle du système de design (Étape 4) tout au long du
 * développement des pages suivantes. Réservée à l'admin.
 */
export default async function StyleGuidePage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16">
      <h1 className="text-ink text-2xl font-bold">Style guide</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-lg font-bold">
          Icônes ({iconEntries.length})
        </h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {iconEntries.map(([name, Icon]) => (
            <div
              key={name}
              className="border-line text-ink-soft flex flex-col items-center gap-2 rounded-md border p-4 text-xs"
            >
              <Icon size={28} />
              <span>{name.replace("Icon", "")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-lg font-bold">Boutons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primaire</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button disabled>Désactivé</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-lg font-bold">Badges de statut</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="warning">En attente</Badge>
          <Badge variant="success">Payé</Badge>
          <Badge variant="danger">Annulé</Badge>
          <Badge variant="neutral">Nouveau</Badge>
        </div>
      </section>

      <section className="flex max-w-sm flex-col gap-4">
        <h2 className="text-ink text-lg font-bold">Formulaire</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sg-input">Champ texte</Label>
          <Input id="sg-input" placeholder="Exemple" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sg-textarea">Zone de texte</Label>
          <Textarea id="sg-textarea" rows={3} placeholder="Exemple" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-lg font-bold">Carte</h2>
        <Card className="max-w-sm">
          <p className="text-ink-soft text-sm">
            Contenu type d&apos;une carte — fond légèrement surélevé, bordure
            fine.
          </p>
        </Card>
      </section>
    </div>
  );
}
