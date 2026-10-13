import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/icon-by-key";
import type { IconKey } from "@/lib/catalog/types";

/** Conteneur de page : largeur maximale 1152 px, gouttières 16 px. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4", className)}>
      {children}
    </div>
  );
}

/** Étiquette de section de la charte : 11 px, capitales, espacée. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-brand-text text-[0.6875rem] font-medium tracking-[0.12em] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Titre de section : étiquette, titre en DM Serif Display, chapeau. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "mx-auto max-w-2xl items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Tag className="text-ink text-[1.625rem] leading-[1.15] sm:text-[2.25rem]">
        {title}
      </Tag>
      {lead ? (
        <p className="text-ink-soft max-w-2xl text-[1.0625rem] leading-relaxed">
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/** Pastille d'icône de la charte : carré arrondi 12 px, icône bleue. */
export function IconChip({
  name,
  size = 44,
  tone = "soft",
  className,
}: {
  name: IconKey;
  size?: number;
  tone?: "soft" | "solid";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[12px]",
        tone === "soft"
          ? "border-line bg-paper-raised text-brand-text border"
          : "bg-white/12 text-white ring-1 ring-white/20",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={Math.round(size * 0.5)} />
    </span>
  );
}

/** Liste à puces de la charte : petit point bleu, jamais de puce standard. */
export function CheckList({
  items,
  className,
  tone = "default",
}: {
  items: string[];
  className?: string;
  tone?: "default" | "light";
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-start gap-3 text-[0.9375rem] leading-relaxed",
            tone === "light" ? "text-white/85" : "text-ink-soft",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-[0.55rem] h-[7px] w-[7px] shrink-0 rounded-full",
              tone === "light" ? "bg-brand-200" : "bg-brand",
            )}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
