import { iconBaseProps, type IconProps } from "./types";

export function IconVeille({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
