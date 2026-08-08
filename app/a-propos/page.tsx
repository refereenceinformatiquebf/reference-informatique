import type { Metadata } from "next";
import {
  IconFormation,
  IconCode,
  IconAgentIa,
  IconMaintenance,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Référence Informatique accompagne particuliers et entreprises au Burkina Faso : formations, conception web, agents IA et maintenance.",
};

const VALEURS = [
  {
    icon: IconFormation,
    title: "Pédagogie",
    text: "Des contenus qui partent de zéro et progressent réellement.",
  },
  {
    icon: IconCode,
    title: "Exigence",
    text: "Un travail soigné, pas la première version qui marche à peu près.",
  },
  {
    icon: IconAgentIa,
    title: "Innovation",
    text: "Nous suivons les outils qui font vraiment gagner du temps.",
  },
  {
    icon: IconMaintenance,
    title: "Fiabilité",
    text: "Un support qui répond, avant et après la vente.",
  },
] as const;

export default function AProposPage() {
  return (
    <div className="flex flex-col">
      <section className="border-line border-b px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-ink text-2xl font-bold">À propos de nous</h1>
          <p className="text-ink-soft mt-4 leading-relaxed">
            Référence Informatique est une entreprise burkinabè qui accompagne
            particuliers et entreprises dans leur montée en compétences et leur
            transformation numérique — de la formation individuelle à la
            conception de solutions sur mesure.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALEURS.map((valeur) => (
            <div
              key={valeur.title}
              className="border-line rounded-lg border p-6 text-center"
            >
              <span className="bg-brand/10 text-brand mx-auto flex h-11 w-11 items-center justify-center rounded-md">
                <valeur.icon size={22} />
              </span>
              <h2 className="text-ink mt-4 text-sm font-semibold">
                {valeur.title}
              </h2>
              <p className="text-ink-soft mt-1.5 text-xs leading-relaxed">
                {valeur.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-line border-t px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-ink text-lg font-bold">Notre mission</h2>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Rendre l&apos;informatique et le numérique accessibles à tous les
            Burkinabè — que ce soit par une formation à prix abordable livrée à
            domicile, ou par une solution web et logicielle pensée pour faire
            grandir une activité.
          </p>
        </div>
      </section>
    </div>
  );
}
