export type IconProps = {
  size?: number;
  className?: string;
};

/** Attributs SVG communs à toutes les icônes — un seul jeu de réglages
 * (trait, arrondis) pour que les 18 icônes se lisent comme un seul dessin. */
export const iconBaseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
