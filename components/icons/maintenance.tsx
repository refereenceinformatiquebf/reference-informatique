import { iconBaseProps, type IconProps } from "./types";

export function IconMaintenance({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M14.5 6.5a3.5 3.5 0 0 0-4.8 4.2L4 16.4V20h3.6l5.7-5.7a3.5 3.5 0 0 0 4.2-4.8l-2.6 2.6-2-2 2.6-2.6Z" />
    </svg>
  );
}
