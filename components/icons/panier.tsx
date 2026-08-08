import { iconBaseProps, type IconProps } from "./types";

export function IconPanier({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="9.5" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
