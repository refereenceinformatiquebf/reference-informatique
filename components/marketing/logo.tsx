import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Marque de Référence Informatique, composée comme le logo de la charte
 * Boulga AI : pastille-icône + nom en DM Serif Display + sous-titre en
 * petites capitales.
 *
 * L'icône est le vrai logo de l'entreprise (écran, engrenages, flèche de
 * progression), détouré. La pastille est blanche pour rester lisible quel
 * que soit le fond (clair, marine, bleu).
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(11,31,58,0.08)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/logo-icon.png"
        alt=""
        width={Math.round(size * 0.78)}
        height={Math.round(size * 0.78 * (450 / 760))}
        priority
        className="h-auto"
        style={{ width: Math.round(size * 0.78) }}
      />
    </span>
  );
}

export function Wordmark({
  tone = "default",
  className,
}: {
  tone?: "default" | "light";
  className?: string;
}) {
  return (
    <span className={cn("flex flex-col", className)}>
      <span
        className={cn(
          "font-display text-[1.375rem] leading-none tracking-[-0.01em]",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        Référence
      </span>{" "}
      <span
        className={cn(
          "mt-[3px] text-[0.5625rem] leading-none font-medium tracking-[0.15em] uppercase",
          tone === "light" ? "text-white/70" : "text-brand-text",
        )}
      >
        Informatique
      </span>
    </span>
  );
}

/** Marque complète : pastille + nom. */
export function Brand({
  tone = "default",
  size = 40,
  className,
}: {
  tone?: "default" | "light";
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <Wordmark tone={tone} />
    </span>
  );
}
