import Image from "next/image";

/**
 * Marque réelle de Référence Informatique (ordinateur, engrenages,
 * flèche de progression) — le vrai logo de l'entreprise, pas une
 * réinvention. Fond blanc d'origine géré par le cadre arrondi ci-dessous,
 * qui reste lisible tant que le logo est posé sur un fond clair (header,
 * footer) ; voir Étape 4bis.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/images/logo.jpeg"
      alt="Référence Informatique"
      width={size}
      height={size}
      className="rounded-md object-cover"
      priority
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="font-display text-ink text-base leading-tight font-semibold">
        Référence
      </span>
      <span className="text-ink-soft block text-[0.6875rem] leading-tight font-medium tracking-wide uppercase">
        Informatique
      </span>
    </span>
  );
}
