import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import { SUPPORT_PHONE_DISPLAY } from "@/lib/support";
import { fr } from "@/lib/typography";

/**
 * Espace d'assistance de la page de réception du pack : un bouton WhatsApp vers
 * l'assistance, avec un message déjà écrit (nom, date d'achat — voir lib/support.ts).
 */
export function AssistanceSection({ href }: { href: string }) {
  return (
    <section className="border-line bg-paper shadow-card mt-6 rounded-xl border p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <IconChip name="support" size={40} />
        <div>
          <p className="font-display text-ink text-lg leading-tight">
            Besoin d&rsquo;aide ?
          </p>
          <p className="text-ink-soft text-sm leading-snug">
            {fr("Une étape vous bloque ? Notre assistance vous accompagne.")}
          </p>
        </div>
      </div>
      <Button asChild variant="whatsapp" size="lg" className="mt-5 w-full">
        <a href={href} target="_blank" rel="noopener noreferrer">
          <IconWhatsapp size={18} />
          Écrire à l&rsquo;assistance sur WhatsApp
        </a>
      </Button>
      <p className="text-ink-faint mt-3 text-center text-xs">
        {SUPPORT_PHONE_DISPLAY}
      </p>
    </section>
  );
}

/** Bouton WhatsApp rond, toujours visible en bas à droite de l'écran. */
export function FloatingAssistance({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Assistance sur WhatsApp"
      title="Assistance sur WhatsApp"
      className="shadow-lift fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white transition-[filter,transform] duration-200 hover:scale-105 hover:brightness-110 focus-visible:shadow-[var(--focus-halo)] focus-visible:outline-none sm:right-6 sm:bottom-6"
    >
      <IconWhatsapp size={28} />
    </a>
  );
}
