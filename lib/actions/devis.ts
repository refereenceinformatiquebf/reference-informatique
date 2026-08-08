"use server";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { devisSchema } from "@/lib/validations/devis";

export type DevisFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function requestDevis(
  _state: DevisFormState,
  formData: FormData,
): Promise<DevisFormState> {
  const validated = devisSchema.safeParse({
    serviceId: formData.get("serviceId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message"),
    budget: formData.get("budget"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  // Rattache la demande au compte connecté si l'utilisateur est authentifié
  // — n'affecte pas le mode de rendu de la page appelante (une Server
  // Action n'est exécutée qu'à la soumission, jamais au rendu).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await prisma.quoteRequest.create({
    data: { ...validated.data, profileId: user?.id },
  });

  // Les emails de confirmation (client + admin) sont branchés à l'Étape 12.

  return {
    success: true,
    message:
      "Votre demande a bien été reçue. Nous revenons vers vous sous 24h ouvrées.",
  };
}
