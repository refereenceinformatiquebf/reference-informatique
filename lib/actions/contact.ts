"use server";

import { prisma } from "@/lib/prisma/client";
import { contactSchema } from "@/lib/validations/contact";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export type ContactFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function sendContactMessage(
  _state: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  try {
    await enforceRateLimit("contact", 5, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const validated = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.contactMessage.create({ data: validated.data });

  // L'envoi d'un email de notification à l'équipe est branché à l'Étape 12
  // (Brevo) — le message est déjà enregistré et visible dans l'admin
  // (Étape 14) même sans cette étape.

  return {
    success: true,
    message: "Message envoyé. Nous vous répondons rapidement.",
  };
}
