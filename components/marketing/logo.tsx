/**
 * Marque Référence Informatique — un chevron (progression, code) surmonté
 * d'une étincelle or (l'IA, l'insight), sur un carré dégradé marine. Remplace
 * l'ancien badge "RI" texte seul, jugé trop générique.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="logo-mark-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="var(--brand-900)" />
          <stop offset="1" stopColor="var(--brand-500)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-mark-grad)" />
      <path
        d="M12 10l6 6-6 6"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="8" r="3.25" fill="var(--gold-600)" />
    </svg>
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
