import { iconBaseProps, type IconProps } from "./types";

export function IconVideo({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M10.5 9l5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
