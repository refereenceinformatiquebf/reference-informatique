import { iconBaseProps, type IconProps } from "./types";

export function IconPdf({ size = 24, className }: IconProps) {
  return (
    <svg {...iconBaseProps} width={size} height={size} className={className}>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13h5M9.5 16h3.5" />
    </svg>
  );
}
