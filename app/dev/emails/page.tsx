import { notFound } from "next/navigation";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { PaymentConfirmationEmail } from "@/lib/email/templates/payment-confirmation";
import { AccessGrantedEmail } from "@/lib/email/templates/access-granted";
import { NewOrderAdminEmail } from "@/lib/email/templates/new-order-admin";
import {
  DevisReceivedClientEmail,
  DevisReceivedAdminEmail,
} from "@/lib/email/templates/devis-received";
import {
  ContactMessageAdminEmail,
  ContactReceivedClientEmail,
} from "@/lib/email/templates/contact-message";
import { DeliveryUpdateEmail } from "@/lib/email/templates/delivery-update";
import { RefundNoticeEmail } from "@/lib/email/templates/refund-notice";
import { AdminReplyEmail } from "@/lib/email/templates/admin-reply";
import { AuthLinkEmail } from "@/lib/email/templates/auth-link";
import { OrderLinksEmail } from "@/lib/email/templates/order-links";
import { PaymentReminderEmail } from "@/lib/email/templates/payment-reminder";

/**
 * Aperçu visuel de chaque gabarit d'email, sans envoi réel — pour itérer
 * sur le design sans consommer de crédit Brevo. Exclue de la production.
 */
export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const sampleProduct = "Clé de Formations Complètes";
  const shipping = {
    city: "Ouagadougou",
    address: "Cissin, près de la station",
  };

  return (
    <div className="flex flex-col gap-16 bg-neutral-200 px-4 py-10">
      <Preview title="Connexion : lien de connexion">
        <AuthLinkEmail
          kind="magiclink"
          url="http://localhost:3000/auth/confirm?token_hash=exemple&type=magiclink"
          name="Awa"
        />
      </Preview>
      <Preview title="Connexion : confirmation d'inscription">
        <AuthLinkEmail
          kind="signup"
          url="http://localhost:3000/auth/confirm?token_hash=exemple&type=signup"
          name="Awa Compaoré"
        />
      </Preview>
      <Preview title="Connexion : mot de passe oublié">
        <AuthLinkEmail
          kind="recovery"
          url="http://localhost:3000/auth/confirm?token_hash=exemple&type=recovery"
        />
      </Preview>
      <Preview title="Commande reçue : clé USB (paiement en ligne)">
        <OrderConfirmationEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          amount={12000}
          delivery="cle-physique"
          shipping={shipping}
          trackUrl="http://localhost:3000/commande/suivi/exemple"
        />
      </Preview>
      <Preview title="Commande reçue : produit numérique (WhatsApp)">
        <OrderConfirmationEmail
          clientName="Awa Compaoré"
          productName="Le Chercheur Augmenté"
          amount={6000}
          delivery="numerique"
          channel="WHATSAPP"
          trackUrl="http://localhost:3000/commande/suivi/exemple"
        />
      </Preview>
      <Preview title="Relance : paiement non terminé">
        <PaymentReminderEmail
          clientName="Awa Compaoré"
          productName="Le Chercheur Augmenté"
          amount={6000}
          trackUrl="http://localhost:3000/commande/suivi/exemple"
        />
      </Preview>
      <Preview title="Retrouver ma commande : liens des commandes récentes">
        <OrderLinksEmail
          name="Awa"
          items={[
            {
              productName: "Le Chercheur Augmenté",
              amount: 6000,
              paid: true,
              url: "http://localhost:3000/commande/suivi/exemple",
            },
            {
              productName: "Performance PC",
              amount: 10000,
              paid: false,
              url: "http://localhost:3000/commande/suivi/exemple2",
            },
          ]}
        />
      </Preview>
      <Preview title="Paiement confirmé : clé USB">
        <PaymentConfirmationEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          amount={12000}
          delivery="cle-physique"
          orderRef="3F9A2C71"
          ctaUrl="http://localhost:3000/commande/suivi/exemple"
        />
      </Preview>
      <Preview title="Paiement confirmé : produit numérique">
        <PaymentConfirmationEmail
          clientName="Awa Compaoré"
          productName="Le Chercheur Augmenté"
          amount={6000}
          delivery="numerique"
          orderRef="3F9A2C71"
          ctaUrl="http://localhost:3000/commande/suivi/exemple"
        />
      </Preview>
      <Preview title="Accès accordé par l'équipe">
        <AccessGrantedEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          siteUrl="http://localhost:3000"
        />
      </Preview>
      <Preview title="Livraison : en route">
        <DeliveryUpdateEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          status="EN_LIVRAISON"
        />
      </Preview>
      <Preview title="Remboursement">
        <RefundNoticeEmail
          clientName="Awa Compaoré"
          productName={sampleProduct}
          amount={12000}
        />
      </Preview>
      <Preview title="Alerte équipe : paiement reçu, clé à livrer">
        <NewOrderAdminEmail
          event="paid"
          clientName="Awa Compaoré"
          clientPhone="+226 70 00 00 00"
          clientEmail="awa@example.com"
          productName={sampleProduct}
          amount={12000}
          channel="BOUTIQUE"
          shipping={{ ...shipping, phone: "+226 70 00 00 00" }}
          adminUrl="http://localhost:3000/admin/commandes/exemple"
        />
      </Preview>
      <Preview title="Alerte équipe : nouvelle commande WhatsApp">
        <NewOrderAdminEmail
          event="created"
          clientName="Awa Compaoré"
          clientPhone="+226 70 00 00 00"
          productName="Le Chercheur Augmenté"
          amount={6000}
          channel="WHATSAPP"
          adminUrl="http://localhost:3000/admin/commandes/exemple"
        />
      </Preview>
      <Preview title="Devis reçu (client)">
        <DevisReceivedClientEmail
          clientName="Issa Ouédraogo"
          serviceName="Site vitrine professionnel"
        />
      </Preview>
      <Preview title="Devis reçu (équipe)">
        <DevisReceivedAdminEmail
          clientName="Issa Ouédraogo"
          clientEmail="issa@example.com"
          clientPhone="+226 70 00 00 00"
          serviceName="Site vitrine professionnel"
          message="Bonjour, je voudrais un site pour mon restaurant avec un menu en ligne."
          budget="50 000 – 150 000 F"
        />
      </Preview>
      <Preview title="Message reçu (client)">
        <ContactReceivedClientEmail clientName="Issa Ouédraogo" />
      </Preview>
      <Preview title="Message reçu (équipe)">
        <ContactMessageAdminEmail
          name="Issa Ouédraogo"
          email="issa@example.com"
          phone="+226 70 00 00 00"
          message="Bonjour, la clé tout-en-un est-elle compatible avec un Mac ?"
          adminUrl="http://localhost:3000/admin/messages"
        />
      </Preview>
      <Preview title="Réponse de l'équipe (devis / message)">
        <AdminReplyEmail
          heading="Votre demande de devis — Site vitrine"
          body={
            "Bonjour Issa,\n\nMerci pour votre demande. Voici notre proposition : ...\n\nCordialement,\nL'équipe Référence Informatique"
          }
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
