import { iconBaseProps, type IconProps } from "./types";

export function IconCleUsb({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <rect x="3" y="10" width="5" height="4" rx="0.5" />
      <rect x="8" y="7" width="13" height="10" rx="2" />
      <path d="M12 11v2M15 11v2" />
    </svg>
  );
}
