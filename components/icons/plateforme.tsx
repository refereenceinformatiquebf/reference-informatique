import { iconBaseProps, type IconProps } from "./types";

export function IconPlateforme({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 13.5l2.5 2-2.5 2" />
      <path d="M13 17.5h3" />
    </svg>
  );
}
