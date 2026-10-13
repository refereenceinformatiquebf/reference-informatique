"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevisForm } from "@/components/services/devis-form";
import { ContactForm } from "./contact-form";

/** Deux façons d'écrire : un devis pour un projet, ou une simple question. */
export function ContactTabs({
  defaultTab,
  services,
  defaultServiceSlug,
}: {
  defaultTab: "devis" | "question";
  services: { slug: string; name: string }[];
  defaultServiceSlug?: string;
}) {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList aria-label="Type de message">
        <TabsTrigger value="devis">Demander un devis</TabsTrigger>
        <TabsTrigger value="question">Poser une question</TabsTrigger>
      </TabsList>
      <TabsContent value="devis">
        <p className="text-ink-soft mb-6 text-[0.9375rem] leading-relaxed">
          Pour un projet : site web, agent IA, logiciel, automatisation,
          maintenance. Vous recevez une proposition claire et gratuite.
        </p>
        <DevisForm
          services={services}
          defaultServiceSlug={defaultServiceSlug}
        />
      </TabsContent>
      <TabsContent value="question">
        <p className="text-ink-soft mb-6 text-[0.9375rem] leading-relaxed">
          Pour toute autre demande : une question sur la boutique, un problème
          d&rsquo;accès, une information.
        </p>
        <ContactForm />
      </TabsContent>
    </Tabs>
  );
}
