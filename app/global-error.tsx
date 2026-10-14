"use client";

/**
 * Dernier filet : une erreur dans le cadre même du site (là où `error.tsx` ne
 * peut pas s'afficher). Ce composant remplace toute la page, il doit donc
 * contenir ses propres balises <html> et <body>, sans dépendre du reste du site.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#f5f7fa",
          color: "#0b1f3a",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>
              Un incident est survenu
            </h1>
            <p
              style={{ lineHeight: 1.6, color: "#46576f", margin: "0 0 24px" }}
            >
              Ce n&apos;est pas de votre faute. Réessayez dans un instant ; si
              le problème continue, écrivez-nous sur WhatsApp.
            </p>
            {error.digest ? (
              <p style={{ fontSize: 12, color: "#5b6a82" }}>
                Référence : {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#1565c0",
                color: "#ffffff",
                border: 0,
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
