import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { generateAuthLink } from "@/lib/auth/email-links";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";
import { isAccessTokenShape } from "./rules";

/**
 * Lien personnel d'une commande (suivi + accès), pour acheter SANS compte.
 *
 * Principe de sécurité : le jeton n'est envoyé que PAR EMAIL, à l'adresse
 * saisie par l'acheteur. Quiconque le présente prouve donc qu'il lit cette
 * boîte, ce qui suffit à ouvrir l'achat. Il n'est JAMAIS affiché à l'écran :
 * sinon n'importe qui pourrait taper l'adresse d'un autre, payer, et
 * s'ouvrir une session dans le compte de cette personne.
 */

export function newAccessToken() {
  return randomBytes(32).toString("base64url");
}

/** Jeton de la commande, créé à la demande (les commandes plus anciennes n'en ont pas). */
export async function ensureAccessToken(orderId: string): Promise<string> {
  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { accessToken: true },
  });
  if (current?.accessToken) return current.accessToken;

  const token = newAccessToken();
  // `accessToken: null` dans la condition : si deux appels se croisent, un seul
  // écrit, l'autre relit le jeton gagnant.
  const written = await prisma.order.updateMany({
    where: { id: orderId, accessToken: null },
    data: { accessToken: token },
  });
  if (written.count === 1) return token;

  const winner = await prisma.order.findUnique({
    where: { id: orderId },
    select: { accessToken: true },
  });
  if (!winner?.accessToken) throw new Error("jeton d'accès introuvable");
  return winner.accessToken;
}

/** Change le jeton : l'ancien lien cesse de fonctionner (lien transmis par erreur). */
export async function rotateAccessToken(orderId: string): Promise<string> {
  const token = newAccessToken();
  await prisma.order.update({
    where: { id: orderId },
    data: { accessToken: token },
  });
  return token;
}

export function orderTrackingUrl(token: string) {
  return `${SITE.url}/commande/suivi/${token}`;
}

/** Lien de suivi d'une commande, prêt pour un email. */
export async function trackingUrlFor(orderId: string) {
  return orderTrackingUrl(await ensureAccessToken(orderId));
}

/** Commande retrouvée par son jeton, avec ce qu'il faut pour l'afficher. */
export async function findOrderByToken(token: unknown) {
  if (!isAccessTokenShape(token)) return null;
  return prisma.order.findUnique({
    where: { accessToken: token },
    include: { product: true, profile: true, events: true },
  });
}

/**
 * Ouvre une session pour le propriétaire de la commande, sans mot de passe ni
 * email intermédiaire : à n'appeler qu'APRÈS avoir vérifié le jeton (preuve de
 * lecture de la boîte email). Pose les cookies de session sur la réponse.
 */
export async function openSessionForProfile(profile: {
  id: string;
  email: string | null;
}): Promise<boolean> {
  // Email du compte : la copie du profil, sinon l'authentification. (Volontairement
  // pas lib/orders.ts, qui importe ce module : on évite l'import circulaire.)
  const email =
    profile.email ??
    (await createAdminClient()
      .auth.admin.getUserById(profile.id)
      .then(({ data }) => data.user?.email ?? null)
      .catch(() => null));
  if (!email) return false;

  const link = await generateAuthLink({ kind: "magiclink", email });
  if (!link || link.userId !== profile.id) return false;

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: link.tokenHash,
    type: link.verificationType as "magiclink" | "signup",
  });
  if (error) {
    console.error(
      "[checkout] ouverture de session impossible :",
      error.message,
    );
    return false;
  }
  return true;
}
