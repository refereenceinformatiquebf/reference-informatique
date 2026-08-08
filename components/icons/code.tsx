import { iconBaseProps, type IconProps } from "./types";

export function IconCode({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
      <path d="M13 5l-2 14" />
    </svg>
  );
}
