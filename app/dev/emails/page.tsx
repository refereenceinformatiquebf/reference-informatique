import { notFound } from "next/navigation";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { PaymentConfirmationEmail } from "@/lib/email/templates/payment-confirmation";
import { AccessGrantedEmail } from "@/lib/email/templates/access-granted";
import { NewOrderAdminEmail } from "@/lib/email/templates/new-order-admin";
import {
  DevisReceivedClientEmail,
  DevisReceivedAdminEmail,
} from "@/lib/email/templates/devis-received";

/**
 * Aperçu visuel de chaque gabarit d'email, sans envoi réel — pour itérer
 * sur le design sans consommer de crédit Brevo. Exclue de la production.
 */
export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const sampleProduct = "Clé de Formations Complètes";

  return (
    <div className="flex flex-col gap-16 bg-neutral-200 px-4 py-10">
      <Preview title="Confirmation de commande">
        <OrderConfirmationEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          amount={12000}
        />
      </Preview>
      <Preview title="Confirmation de paiement">
        <PaymentConfirmationEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          amount={12000}
        />
      </Preview>
      <Preview title="Accès activé">
        <AccessGrantedEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          siteUrl="http://localhost:3000"
        />
      </Preview>
      <Preview title="Nouvelle commande (admin)">
        <NewOrderAdminEmail
          clientName="Awa Compaoré"
          clientPhone="+226 70 00 00 00"
          productName={sampleProduct}
          amount={12000}
          channel="BOUTIQUE"
        />
      </Preview>
      <Preview title="Devis reçu (client)">
        <DevisReceivedClientEmail
          clientName="Issa Ouédraogo"
          serviceName="Site vitrine professionnel"
        />
      </Preview>
      <Preview title="Devis reçu (admin)">
        <DevisReceivedAdminEmail
          clientName="Issa Ouédraogo"
          clientEmail="issa@example.com"
          clientPhone="+226 70 00 00 00"
          serviceName="Site vitrine professionnel"
          message="Bonjour, je voudrais un site pour mon restaurant avec un menu en ligne."
          budget="50 000 – 150 000 F"
        />
      </Preview>
    </div>
  );
}

function Preview({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-center text-xs font-bold tracking-wide text-neutral-500 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}
