import "server-only";
import nodemailer from "nodemailer";

/**
 * Secours total d'envoi, independant de Brevo : passe par la boite mail personnelle de
 * l'admin (SMTP standard — Gmail, Outlook...) via nodemailer. A utiliser uniquement quand
 * Brevo est en panne/suspendu — voir le formulaire "Envoi manuel" sur /admin/commandes/[id].
 */
const HOST = process.env.MANUAL_SMTP_HOST;
const PORT = Number(process.env.MANUAL_SMTP_PORT ?? 465);
const USER = process.env.MANUAL_SMTP_USER;
const PASS = process.env.MANUAL_SMTP_PASS;
const FROM = process.env.MANUAL_SMTP_FROM || USER;

export function isManualEmailConfigured(): boolean {
  return Boolean(HOST && USER && PASS);
}

export async function sendManualFallbackEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isManualEmailConfigured()) {
    return {
      ok: false,
      error:
        "Envoi manuel non configuré sur ce serveur (variables MANUAL_SMTP_* absentes).",
    };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
    await transporter.sendMail({
      from: FROM,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Envoi impossible",
    };
  }
}
