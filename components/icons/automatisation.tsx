import { iconBaseProps, type IconProps } from "./types";

export function IconAutomatisation({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <circle cx="6" cy="8" r="2" />
      <circle cx="18" cy="16" r="2" />
      <path d="M8 9l7.3 5.5" />
      <path d="M15.3 12.7l1.8 1.9-2.3 1" />
      <path d="M6 10v2.5a2 2 0 0 0 2 2h1.5" />
    </svg>
  );
}
