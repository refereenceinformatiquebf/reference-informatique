import { iconBaseProps, type IconProps } from "./types";

export function IconFormation({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M12 6.5c-2-1.5-5-1.5-7-1v11.5c2-0.5 5-0.5 7 1 2-1.5 5-1.5 7-1V5.5c-2-0.5-5-0.5-7 1Z" />
      <path d="M12 6.5v11.5" />
    </svg>
  );
}
