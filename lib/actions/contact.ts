"use server";

import { prisma } from "@/lib/prisma/client";
import { contactSchema } from "@/lib/validations/contact";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/honeypot";
import { sendContactMessage as sendContactEmails } from "@/lib/email/send";

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

  // Robot détecté par le champ piège : on fait semblant, sans rien enregistrer.
  if (isHoneypotFilled(formData)) {
    return {
      success: true,
      message: "Message envoyé. Nous vous répondons rapidement.",
    };
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

  const saved = await prisma.contactMessage.create({ data: validated.data });

  // Le message est déjà enregistré : un échec d'envoi ne doit jamais le perdre
  // ni faire croire au client que rien n'est parti. L'équipe le retrouve de
  // toute façon dans l'administration (Messages).
  await sendContactEmails({
    name: saved.name,
    email: saved.email,
    phone: saved.phone,
    message: saved.message,
  }).catch((error) => console.error("[contact] email", error));

  return {
    success: true,
    message: "Message envoyé. Nous vous répondons rapidement.",
  };
}
