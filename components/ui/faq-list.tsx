import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";
import { fr } from "@/lib/typography";

type FaqItem = { question: string; answer: string };

/** Liste de questions-réponses repliables (charte : filets fins, chevron). */
export function FaqList({
  items,
  withJsonLd = true,
}: {
  items: FaqItem[];
  /** Données structurées FAQPage pour Google. */
  withJsonLd?: boolean;
}) {
  return (
    <>
      {withJsonLd ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
      ) : null}
      <Accordion
        type="single"
        collapsible
        className="border-line bg-paper rounded-lg border px-5"
      >
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger>{fr(item.question)}</AccordionTrigger>
            <AccordionContent>{fr(item.answer)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
