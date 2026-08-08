import "server-only";
import { BrevoClient } from "@getbrevo/brevo";

let client: BrevoClient | undefined;

/** Client Brevo singleton — évite de recréer une instance à chaque envoi. */
export function getBrevoClient() {
  if (!client) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("BREVO_API_KEY manquant — voir .env.example (Étape 12).");
    }
    client = new BrevoClient({ apiKey });
  }
  return client;
}
