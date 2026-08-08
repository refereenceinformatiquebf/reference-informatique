import { iconBaseProps, type IconProps } from "./types";

export function IconPaiement({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <rect x="2.5" y="6" width="19" height="13" rx="2" />
      <path d="M2.5 10.5h19" />
      <path d="M6 15h4" />
    </svg>
  );
}
