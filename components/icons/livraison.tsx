import { iconBaseProps, type IconProps } from "./types";

export function IconLivraison({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M3 8l9-4.5L21 8v8l-9 4.5L3 16V8Z" />
      <path d="M3 8l9 4.5L21 8" />
      <path d="M12 12.5V21" />
    </svg>
  );
}
