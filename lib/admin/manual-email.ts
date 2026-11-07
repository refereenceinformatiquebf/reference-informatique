import "server-only";
import { prisma } from "@/lib/prisma/client";
import { getProduct } from "@/lib/catalog/live";
import { getClientEmail } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export interface ManualEmailPrefill {
  to: string;
  subject: string;
  text: string;
}

/**
 * Message de secours prerempli (destinataire/objet/texte), construit a partir des donnees
 * DEJA enregistrees pour cette commande (lecture seule — ne cree rien). IMPORTANT : ne contient
 * JAMAIS le jeton d'acces personnel de la commande (order.accessToken) — ce jeton ouvre la
 * session du client sans mot de passe (voir lib/checkout/access.ts) et ne doit jamais
 * apparaitre a l'ecran admin. Le lien reel est ajoute automatiquement, cote serveur, au moment
 * de l'envoi (voir sendManualFallbackEmailAction) — jamais renvoye au navigateur.
 */
export async function buildManualEmailPrefill(
  orderId: string,
): Promise<ManualEmailPrefill> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, service: true, profile: true },
  });
  if (!order) throw new Error("Commande introuvable.");

  const email = await getClientEmail(order.profile);
  const productName =
    order.product?.name ?? order.service?.name ?? "votre commande";
  const catalogProduct = order.product
    ? await getProduct(order.product.slug)
    : null;

  const lines: string[] = [];
  lines.push(`Bonjour ${order.profile.name},`);
  lines.push("");
  lines.push(
    `Merci pour votre commande — ${productName} (${formatPrice(order.amount)}).`,
  );
  lines.push("Votre paiement est confirmé.");
  lines.push("");

  if (catalogProduct?.delivery === "licence-edn" && order.product) {
    const access = await prisma.access.findUnique({
      where: {
        profileId_productId: {
          profileId: order.profileId,
          productId: order.product.id,
        },
      },
    });
    if (access?.licenseKey) {
      lines.push(`Votre licence : ${access.licenseKey}`);
      if (access.installerUrl) {
        lines.push(`Application d'activation : ${access.installerUrl}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "Un lien personnel pour accéder à votre commande sera ajouté automatiquement à la fin de cet email lors de l'envoi.",
  );
  lines.push("");
  lines.push(SITE.name);

  return {
    to: email ?? "",
    subject: `Commande confirmée — ${productName}`,
    text: lines.join("\n"),
  };
}
