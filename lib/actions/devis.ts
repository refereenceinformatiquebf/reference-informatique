"use server";

import { prisma } from "@/lib/prisma/client";
import { ensureServiceRow } from "@/lib/catalog/db-sync";
import { createClient } from "@/lib/supabase/server";
import { devisSchema } from "@/lib/validations/devis";
import { sendDevisReceived } from "@/lib/email/send";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

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
  try {
    await enforceRateLimit("devis", 5, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const validated = devisSchema.safeParse({
    serviceSlug: formData.get("serviceSlug"),
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

  // La prestation vient du catalogue : on crée sa ligne de base si besoin
  // pour pouvoir y rattacher la demande.
  const service = await ensureServiceRow(validated.data.serviceSlug);
  if (!service) {
    return {
      errors: {
        serviceSlug: ["Cette prestation n'existe pas ou n'est plus proposée."],
      },
    };
  }
  const { serviceSlug: _serviceSlug, ...contact } = validated.data;
  void _serviceSlug;

  // Rattache la demande au compte connecté si l'utilisateur est authentifié
  // — n'affecte pas le mode de rendu de la page appelante (une Server
  // Action n'est exécutée qu'à la soumission, jamais au rendu). Ce
  // rattachement est un bonus, pas une condition : si la vérification de
  // session échoue (Supabase indisponible), la demande de devis doit tout
  // de même être enregistrée, simplement sans compte associé.
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;
  } catch (error) {
    console.error("[requestDevis] Vérification de session impossible :", error);
  }

  const quoteRequest = await prisma.quoteRequest.create({
    data: { ...contact, serviceId: service.id, profileId: userId },
    include: { service: true },
  });

  await sendDevisReceived({
    clientEmail: quoteRequest.email,
    clientName: quoteRequest.name,
    clientPhone: quoteRequest.phone,
    serviceName: quoteRequest.service.name,
    message: quoteRequest.message,
    budget: quoteRequest.budget ?? undefined,
  }).catch((error) => console.error("[requestDevis] email", error));

  return {
    success: true,
    message:
      "Merci, votre demande est bien reçue. Nous revenons vers vous avec une proposition sous 24 h ouvrées. Vous pouvez aussi nous écrire sur WhatsApp pour aller plus vite.",
  };
}
