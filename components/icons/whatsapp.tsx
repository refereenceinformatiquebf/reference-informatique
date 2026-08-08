import { iconBaseProps, type IconProps } from "./types";

/**
 * Icône générique de conversation pour le canal WhatsApp — un simple bulle
 * de dialogue, pas le logo de marque déposé (à ne jamais reproduire).
 * Le contexte (couleur verte, libellé "WhatsApp") suffit à l'identifier.
 */
export function IconWhatsapp({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M4 20l1.2-3.6A8 8 0 1 1 8.6 19L4 20Z" />
      <path d="M9 10.3c0 2.6 2.1 4.7 4.7 4.7" />
    </svg>
  );
}
