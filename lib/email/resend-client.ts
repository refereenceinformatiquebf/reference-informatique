import "server-only";
import { Resend } from "resend";

let client: Resend | undefined;

/** Client Resend singleton — évite de recréer une instance à chaque envoi. */
export function getResendClient() {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY manquant.");
    }
    client = new Resend(apiKey);
  }
  return client;
}
