import { Button, Link, Text } from "@react-email/components";
import {
  EMAIL_COLORS,
  EmailLayout,
  emailButtonStyle,
  emailTextStyle,
} from "./layout";

export type AuthLinkKind = "signup" | "magiclink" | "recovery";

const COPY: Record<
  AuthLinkKind,
  {
    preview: string;
    heading: string;
    intro: (name?: string) => string;
    button: string;
  }
> = {
  signup: {
    preview: "Confirmez votre adresse email pour activer votre compte",
    heading: "Confirmez votre adresse email",
    intro: (name) =>
      `${name ? `Bienvenue, ${name}.` : "Bienvenue."} Un dernier geste pour activer votre compte : confirmez que cette adresse email est bien la vôtre.`,
    button: "Confirmer mon adresse",
  },
  magiclink: {
    preview: "Votre lien de connexion à Référence Informatique",
    heading: "Votre lien de connexion",
    intro: (name) =>
      `${name ? `Bonjour ${name}, v` : "V"}oici votre lien pour accéder à votre espace : formations, commandes et demandes de devis. Aucun mot de passe à retenir.`,
    button: "Accéder à mon espace",
  },
  recovery: {
    preview: "Choisissez un nouveau mot de passe",
    heading: "Réinitialiser votre mot de passe",
    intro: (name) =>
      `${name ? `Bonjour ${name}, v` : "V"}ous avez demandé à changer votre mot de passe. Le bouton ci-dessous vous permet d'en choisir un nouveau.`,
    button: "Choisir un nouveau mot de passe",
  },
};

/**
 * Email de connexion / confirmation / réinitialisation, envoyé par Brevo
 * (jamais par Supabase). Le lien mène à /auth/confirm, qui demande un clic
 * avant d'utiliser le jeton : les antivirus et aperçus de messagerie qui
 * ouvrent les liens ne peuvent donc pas le consommer à la place du client.
 */
export function AuthLinkEmail({
  kind,
  url,
  name,
}: {
  kind: AuthLinkKind;
  url: string;
  name?: string;
}) {
  const copy = COPY[kind];
  return (
    <EmailLayout preview={copy.preview} heading={copy.heading}>
      <Text style={emailTextStyle}>{copy.intro(name)}</Text>
      <Button href={url} style={emailButtonStyle}>
        {copy.button}
      </Button>
      <Text style={{ ...emailTextStyle, marginTop: 22, fontSize: 13 }}>
        Ce lien ne fonctionne qu&apos;une seule fois et pendant un temps limité.
        S&apos;il a expiré, demandez-en simplement un nouveau depuis la page de
        connexion.
      </Text>
      <Text style={{ ...emailTextStyle, fontSize: 13 }}>
        Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet
        email : personne ne peut accéder à votre compte sans ce lien.
      </Text>
      <Text
        style={{
          ...emailTextStyle,
          fontSize: 12,
          color: "#8795ad",
          wordBreak: "break-all",
        }}
      >
        Le bouton ne s&apos;affiche pas ? Copiez cette adresse dans votre
        navigateur :{" "}
        <Link href={url} style={{ color: EMAIL_COLORS.brand }}>
          {url}
        </Link>
      </Text>
    </EmailLayout>
  );
}
