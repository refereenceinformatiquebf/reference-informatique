import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon généré dynamiquement à partir de la marque (voir
 * components/marketing/logo.tsx) — évite de dépendre d'un fichier .ico
 * statique désynchronisé du logo réel. Couleurs en dur (pas de var(--...))
 * car le moteur de rendu de ImageResponse ne résout pas les custom
 * properties CSS.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "linear-gradient(135deg, #0a1e3d, #1f5ba8)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <path
          d="M12 10l6 6-6 6"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 3,
          right: 3,
          width: 7,
          height: 7,
          borderRadius: 999,
          background: "#e8a316",
        }}
      />
    </div>,
    { ...size },
  );
}
