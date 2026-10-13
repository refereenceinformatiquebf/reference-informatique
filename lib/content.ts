import type { Faq } from "@/lib/catalog/types";
import { SITE } from "@/lib/site";

/**
 * Textes communs à plusieurs pages (méthode de travail, FAQ des services).
 * Une seule formulation, relue une seule fois, vraie partout où elle sert.
 */

export const WORK_STEPS = [
  {
    title: "Vous nous écrivez",
    text: "Par WhatsApp, par téléphone ou avec le formulaire. Vous racontez votre besoin avec vos mots, sans vocabulaire technique.",
  },
  {
    title: "Nous vous répondons avec un devis",
    text: "Gratuit, détaillé, sans engagement. Si une solution plus simple ou moins chère vous convient mieux, nous vous le disons.",
  },
  {
    title: "Nous réalisons, vous validez",
    text: "Le travail avance par étapes que vous approuvez. Pas de mauvaise surprise à la fin.",
  },
  {
    title: "Nous livrons et nous restons là",
    text: "Mise en service, prise en main et suivi. Un contrat de maintenance existe si vous le souhaitez.",
  },
] as const;

export const SERVICE_FAQ: Faq[] = [
  {
    question: "Combien coûte un projet ?",
    answer:
      "Cela dépend de votre besoin, et chaque prestation indique son prix d'entrée : à partir de 50 000 F pour un site vitrine, 30 000 F pour une automatisation, 15 000 F par mois pour la maintenance. Le prix exact est écrit dans un devis gratuit, avant tout engagement.",
  },
  {
    question: "Combien de temps faut-il compter ?",
    answer:
      "Cela dépend de la prestation et de la rapidité avec laquelle vous nous fournissez ce dont nous avons besoin (textes, images, accès). Chaque fiche donne un repère ; le délai exact figure dans le devis.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "En général, un acompte au démarrage et le solde à la livraison, par Mobile Money ou virement. Les modalités exactes sont précisées dans le devis.",
  },
  {
    question: "Et si le résultat ne me convient pas ?",
    answer:
      "Le travail avance par étapes que vous validez : vous pouvez corriger le tir avant la livraison, pas seulement après. Les modifications incluses et la période de garantie sont écrites dans le devis.",
  },
  {
    question: "Vais-je dépendre de vous pour toujours ?",
    answer:
      "Non. Nous vous remettons les accès et nous vous expliquons comment ce que nous avons construit fonctionne. La maintenance reste une option, pas une obligation.",
  },
  {
    question: "Travaillez-vous avec des clients hors du Burkina Faso ?",
    answer:
      "Oui, pour la plupart de nos prestations, à distance. Les interventions sur place (installation, dépannage) dépendent de votre localisation : précisez-la dans votre demande.",
  },
  {
    question: "Comment vous contacter le plus vite ?",
    answer: `Par WhatsApp au ${SITE.phoneDisplay}. C'est le canal le plus rapide.`,
  },
];
