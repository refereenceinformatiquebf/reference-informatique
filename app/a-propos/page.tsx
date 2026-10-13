import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { IconFleche, IconWhatsapp } from "@/components/icons";
import { whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "À propos : une entreprise burkinabè au service de votre numérique",
  description:
    "Référence Informatique accompagne particuliers et entreprises au Burkina Faso : sites web, agents IA, automatisation, maintenance et formations accessibles.",
  alternates: { canonical: "/a-propos" },
};

const VALEURS = [
  {
    icon: "formation",
    title: "Pédagogie",
    text: "Nous expliquons avant de faire. Nos formations partent de zéro et progressent vraiment ; nos projets commencent par vous faire comprendre ce que nous allons construire.",
  },
  {
    icon: "verifie",
    title: "Exigence",
    text: "Un travail soigné, pas la première version qui marche à peu près. Nous préférons livrer plus tard que livrer mal.",
  },
  {
    icon: "agent-ia",
    title: "Utilité",
    text: "Nous suivons les outils, dont l'intelligence artificielle, qui font vraiment gagner du temps, et nous ignorons ceux qui ne servent qu'à faire du bruit.",
  },
  {
    icon: "support",
    title: "Fiabilité",
    text: "Un support qui répond, avant comme après la vente. Quand vous nous écrivez, une personne vous répond.",
  },
] as const;

export default function AProposPage() {
  return (
    <div className="flex flex-col">
      {/* ============================== Entrée ============================== */}
      <section className="illus-zone">
        <Container className="py-16 sm:py-24">
          <div className="rise-in max-w-3xl">
            <Eyebrow className="text-brand-200">À propos</Eyebrow>
            <h1 className="mt-4 text-[2.25rem] leading-[1.05] tracking-[-0.02em] sm:text-[3.25rem]">
              {fr("Le numérique doit être à la portée de tous.")}
            </h1>
            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85 sm:text-lg">
              {fr(
                "Référence Informatique est une entreprise burkinabè. Nous aidons les particuliers et les entreprises à mieux travailler avec le numérique : des solutions sur mesure quand il le faut, des formations abordables quand on veut apprendre.",
              )}
            </p>
          </div>
        </Container>
      </section>

      {/* ============================== Mission ============================== */}
      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Notre mission"
            title={fr("Rendre l'informatique utile, simple et accessible")}
          />
          <div className="text-ink-soft flex flex-col gap-5 text-[1.0625rem] leading-relaxed">
            <p>
              {fr(
                "Trop de gens pensent que l'informatique est réservée aux spécialistes. Trop d'entreprises se débrouillent avec des outils mal adaptés, parce qu'on ne leur a jamais expliqué ce qui existe, ni ce que ça coûte vraiment.",
              )}
            </p>
            <p>
              {fr(
                "Nous faisons deux métiers qui se nourrissent l'un l'autre. D'un côté, nous concevons des sites web, des agents IA, des logiciels et des automatisations pour des entreprises. De l'autre, nous proposons des formations et des ressources numériques à des prix qui permettent à chacun d'apprendre.",
              )}
            </p>
            <p>
              {fr(
                "Dans les deux cas, la règle est la même : vous expliquer clairement, vous dire le prix avant de commencer, et rester joignable ensuite.",
              )}
            </p>
          </div>
        </Container>
      </section>

      {/* ============================== Valeurs ============================== */}
      <section className="bg-paper border-line border-y py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Nos valeurs"
            title="Ce qui guide notre travail"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((valeur, index) => (
              <div
                key={valeur.title}
                className="rise-in flex flex-col gap-4"
                style={{ "--i": index } as React.CSSProperties}
              >
                <IconChip name={valeur.icon} size={52} />
                <h3 className="font-display text-ink text-[1.375rem] leading-tight">
                  {valeur.title}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(valeur.text)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Chiffre vérifié ============================== */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="border-line bg-paper grid gap-8 rounded-xl border p-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12 sm:p-12">
            <p className="font-display text-brand tabular text-[4rem] leading-none sm:text-[5.5rem]">
              170+
            </p>
            <div>
              <h2 className="font-display text-ink text-[1.5rem] leading-tight sm:text-[1.875rem]">
                {fr("clients ont déjà activé leur accès à nos formations")}
              </h2>
              <p className="text-ink-soft mt-3 max-w-xl text-[1rem] leading-relaxed">
                {fr(
                  "Chaque accès correspond à une vraie commande. C'est le chiffre exact de notre base de clients, pas une estimation.",
                )}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================== Appel final ============================== */}
      <section className="px-4 pb-16 sm:pb-24">
        <div className="illus-zone mx-auto max-w-6xl rounded-xl px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-xl text-[1.75rem] leading-[1.15] sm:text-[2.25rem]">
            {fr("Travaillons ensemble.")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-white/85">
            {fr(
              "Un projet, une question, une envie d'apprendre : écrivez-nous.",
            )}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="inverse" size="lg">
              <Link href="/contact">
                Nous contacter
                <IconFleche size={18} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/16"
            >
              <a
                href={whatsappLink("Bonjour, j'aimerais discuter avec vous.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
