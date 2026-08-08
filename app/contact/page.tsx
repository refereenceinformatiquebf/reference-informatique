import type { Metadata } from "next";
import { IconWhatsapp } from "@/components/icons";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Référence Informatique par WhatsApp ou par message.",
};

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22675789737";

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-2">
      <div>
        <h1 className="text-ink text-2xl font-bold">Contactez-nous</h1>
        <p className="text-ink-soft mt-3 leading-relaxed">
          Une question sur une formation, un projet de site web ou un besoin de
          maintenance ? Écrivez-nous, nous répondons rapidement.
        </p>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-line hover:border-success mt-8 flex items-center gap-3 rounded-lg border p-4 transition-colors"
        >
          <span className="bg-success/10 text-success flex h-10 w-10 items-center justify-center rounded-md">
            <IconWhatsapp size={20} />
          </span>
          <div>
            <p className="text-ink text-sm font-semibold">WhatsApp</p>
            <p className="text-ink-soft text-xs">Réponse la plus rapide</p>
          </div>
        </a>
      </div>

      <ContactForm />
    </div>
  );
}
