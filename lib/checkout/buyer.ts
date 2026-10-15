import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAuthUser, normalizeEmail } from "@/lib/auth/email-links";
import type { BuyerInput } from "@/lib/validations/order";

type Profile = NonNullable<
  Awaited<ReturnType<typeof prisma.profile.findUnique>>
>;

/**
 * Qui achète ? Réponse à « le client n'est pas obligé de créer un compte ».
 *
 *  - Connecté : son compte, tel quel.
 *  - Pas connecté : un compte SANS mot de passe est préparé à partir de son
 *    email (ou retrouvé s'il existe déjà). Le client ne le voit pas, ne
 *    choisit rien : il paie, puis reçoit par email un lien personnel pour
 *    ouvrir son achat. S'il revient plus tard, son adresse email suffit.
 *
 * Sécurité : ce compte n'ouvre AUCUNE session ici. Rien n'est accessible
 * avant que l'acheteur prouve qu'il lit la boîte email (lien reçu). Sinon,
 * taper l'adresse d'une autre personne suffirait à entrer dans son compte.
 */
export async function resolveBuyer(
  input: BuyerInput,
  signedIn: Profile | null,
): Promise<{ profile: Profile; createdAccount: boolean }> {
  if (signedIn) {
    return {
      profile: await completeProfile(signedIn, input),
      createdAccount: false,
    };
  }
  const { profile, createdAccount } = await ensureAccount({
    email: input.email,
    name: input.name,
    phone: input.phone,
  });
  return { profile: await completeProfile(profile, input), createdAccount };
}

/**
 * Compte (sans mot de passe) pour cette adresse : retrouvé s'il existe, créé
 * sinon. Sert à la commande sans compte ET à l'administration (commande
 * manuelle ou accès donné à un client qui n'a jamais ouvert de compte).
 */
export async function ensureAccount(input: {
  email: string;
  name?: string;
  phone?: string;
}): Promise<{ profile: Profile; createdAccount: boolean }> {
  const email = normalizeEmail(input.email);
  const admin = createAdminClient();
  let existing = await findAuthUser(email);

  // Un compte JAMAIS confirmé vient d'une inscription avec mot de passe que
  // personne n'a validée par email : quelqu'un d'autre a pu l'ouvrir avec cette
  // adresse et SON mot de passe. On le supprime (s'il est vide) et on repart
  // d'un compte propre, comme le fait l'inscription (voir lib/actions/auth.ts).
  if (existing && !existing.confirmed) {
    const [orders, access] = await Promise.all([
      prisma.order.count({ where: { profileId: existing.id } }),
      prisma.access.count({ where: { profileId: existing.id } }),
    ]);
    if (orders === 0 && access === 0) {
      const { error } = await admin.auth.admin.deleteUser(existing.id);
      if (error) {
        throw new Error(`compte non confirmé non supprimé : ${error.message}`);
      }
      existing = null;
    }
  }

  let userId: string;
  let createdAccount = false;
  if (existing) {
    userId = existing.id;
  } else {
    // `email_confirm: true` : le compte n'a pas de mot de passe, donc personne
    // ne peut s'y connecter autrement que par un lien envoyé à cette adresse.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
      },
    });
    if (error || !data.user) {
      // Deux demandes simultanées avec la même adresse : l'autre a gagné.
      const again = await findAuthUser(email);
      if (!again) {
        throw new Error(
          `création du compte impossible : ${error?.message ?? "inconnue"}`,
        );
      }
      userId = again.id;
    } else {
      userId = data.user.id;
      createdAccount = true;
    }
  }

  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) {
    throw new Error("profil introuvable après la création du compte");
  }
  return { profile, createdAccount };
}

/** Complète (sans jamais écraser) le nom et le téléphone du profil. */
async function completeProfile(profile: Profile, input: BuyerInput) {
  const data: { name?: string; phone?: string } = {};

  // Un compte créé par simple lien porte comme « nom » la partie locale de
  // son email : on le remplace par le vrai nom. Un nom saisi par le client,
  // lui, n'est jamais écrasé.
  const placeholderName =
    profile.email !== null && profile.name === profile.email.split("@")[0];
  if (placeholderName && input.name && input.name !== profile.name) {
    data.name = input.name;
  }
  if (!profile.phone && input.phone) data.phone = input.phone;

  if (Object.keys(data).length === 0) return profile;
  return prisma.profile.update({ where: { id: profile.id }, data });
}
