import type { Product } from "./types";

/**
 * Conversions entre le contenu d'un produit et les champs texte de l'éditeur
 * de l'administration. Le contenu reste structuré (lib/catalog/schema.ts) ;
 * seul le formulaire le présente sous une forme facile à saisir :
 *
 *  - paragraphes : séparés par une ligne vide ;
 *  - listes : une entrée par ligne ;
 *  - contenu détaillé : « ## Titre » puis « - Élément | détail facultatif » ;
 *  - questions : « Q: question » puis « R: réponse » (la réponse peut tenir
 *    sur plusieurs lignes).
 *
 * Pas de dépendance serveur : utilisable aussi par les tests et le navigateur.
 */

export const FACT_ROWS = 6;

export type ProductFormValues = {
  name: string;
  tagline: string;
  summary: string;
  kind: string;
  delivery: string;
  restrictedToBF: boolean;
  restrictedOther: string;
  posterAlt: string;
  coverTone: string;
  coverMotif: string;
  facts: { icon: string; label: string }[];
  story: string;
  highlights: string;
  contents: string;
  forWho: string;
  notForWho: string;
  faq: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialCity: string;
  seoTitle: string;
  seoDescription: string;
};

const lines = (items: string[] | undefined) => (items ?? []).join("\n");

export function productToForm(product: Product): ProductFormValues {
  const restricted = product.restrictedTo ?? [];
  const facts = Array.from({ length: FACT_ROWS }, (_, index) => ({
    icon: product.facts[index]?.icon ?? "",
    label: product.facts[index]?.label ?? "",
  }));
  return {
    name: product.name,
    tagline: product.tagline,
    summary: product.summary,
    kind: product.kind,
    delivery: product.delivery,
    restrictedToBF: restricted.includes("BF"),
    restrictedOther: restricted.filter((code) => code !== "BF").join(", "),
    posterAlt: product.poster?.alt ?? "",
    coverTone: product.cover.tone,
    coverMotif: product.cover.motif,
    facts,
    story: product.story.join("\n\n"),
    highlights: lines(product.highlights),
    contents: (product.contents ?? [])
      .map(
        (group) =>
          `## ${group.title}\n${group.items
            .map((item) =>
              item.detail
                ? `- ${item.name} | ${item.detail}`
                : `- ${item.name}`,
            )
            .join("\n")}`,
      )
      .join("\n\n"),
    forWho: lines(product.forWho),
    notForWho: lines(product.notForWho),
    faq: product.faq
      .map((entry) => `Q: ${entry.question}\nR: ${entry.answer}`)
      .join("\n\n"),
    testimonialQuote: product.testimonial?.quote ?? "",
    testimonialAuthor: product.testimonial?.author ?? "",
    testimonialCity: product.testimonial?.city ?? "",
    seoTitle: product.seo.title,
    seoDescription: product.seo.description,
  };
}

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

function parseContents(text: string) {
  const groups: {
    title: string;
    items: { name: string; detail?: string }[];
  }[] = [];
  for (const line of splitLines(text)) {
    if (line.startsWith("##")) {
      groups.push({ title: line.replace(/^#+\s*/, "").trim(), items: [] });
      continue;
    }
    if (groups.length === 0) groups.push({ title: "Contenu", items: [] });
    const body = line.replace(/^[-•*]\s*/, "");
    const [name, ...rest] = body.split(" | ");
    const detail = rest.join(" | ").trim();
    groups[groups.length - 1].items.push({
      name: name.trim(),
      ...(detail ? { detail } : {}),
    });
  }
  return groups.filter((group) => group.items.length > 0);
}

function parseFaq(text: string) {
  const entries: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string } | null = null;
  let inAnswer = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const q = /^\s*Q\s*:\s*(.*)$/i.exec(line);
    const r = /^\s*R\s*:\s*(.*)$/i.exec(line);
    if (q) {
      if (current) entries.push(current);
      current = { question: q[1].trim(), answer: "" };
      inAnswer = false;
    } else if (r && current) {
      current.answer = r[1].trim();
      inAnswer = true;
    } else if (current && inAnswer && line.trim() !== "") {
      current.answer += `${current.answer ? " " : ""}${line.trim()}`;
    } else if (current && !inAnswer && line.trim() !== "") {
      current.question += ` ${line.trim()}`;
    }
  }
  if (current) entries.push(current);
  return entries.filter((entry) => entry.question && entry.answer);
}

/**
 * Valeurs du formulaire → objet à valider avec productContentSchema.
 * Ne valide rien : c'est le schéma qui décide.
 */
export function formToContent(
  values: ProductFormValues,
  poster?: { src: string },
) {
  const restrictedTo = [
    ...(values.restrictedToBF ? ["BF"] : []),
    ...values.restrictedOther
      .split(/[,\s;]+/)
      .map((code) => code.trim())
      .filter(Boolean),
  ];
  const testimonialFilled =
    values.testimonialQuote.trim() || values.testimonialAuthor.trim();

  return {
    name: values.name,
    tagline: values.tagline,
    summary: values.summary,
    kind: values.kind,
    delivery: values.delivery,
    restrictedTo: restrictedTo.length > 0 ? restrictedTo : undefined,
    poster:
      poster && values.posterAlt.trim()
        ? { src: poster.src, alt: values.posterAlt }
        : undefined,
    cover: { tone: values.coverTone, motif: values.coverMotif },
    facts: values.facts.filter((fact) => fact.icon && fact.label.trim()),
    story: values.story
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) => paragraph.replace(/\r?\n/g, " ").trim())
      .filter(Boolean),
    highlights: splitLines(values.highlights),
    contents: parseContents(values.contents),
    forWho: splitLines(values.forWho),
    notForWho: splitLines(values.notForWho),
    faq: parseFaq(values.faq),
    testimonial: testimonialFilled
      ? {
          quote: values.testimonialQuote,
          author: values.testimonialAuthor,
          city: values.testimonialCity || undefined,
        }
      : undefined,
    seo: { title: values.seoTitle, description: values.seoDescription },
  };
}

/** Lit les champs du formulaire HTML (FormData) en valeurs typées. */
export function readProductForm(formData: FormData): ProductFormValues {
  const get = (name: string) => String(formData.get(name) ?? "");
  return {
    name: get("name"),
    tagline: get("tagline"),
    summary: get("summary"),
    kind: get("kind"),
    delivery: get("delivery"),
    restrictedToBF: formData.get("restrictedToBF") === "on",
    restrictedOther: get("restrictedOther"),
    posterAlt: get("posterAlt"),
    coverTone: get("coverTone"),
    coverMotif: get("coverMotif"),
    facts: Array.from({ length: FACT_ROWS }, (_, index) => ({
      icon: get(`factIcon${index}`),
      label: get(`factLabel${index}`),
    })),
    story: get("story"),
    highlights: get("highlights"),
    contents: get("contents"),
    forWho: get("forWho"),
    notForWho: get("notForWho"),
    faq: get("faq"),
    testimonialQuote: get("testimonialQuote"),
    testimonialAuthor: get("testimonialAuthor"),
    testimonialCity: get("testimonialCity"),
    seoTitle: get("seoTitle"),
    seoDescription: get("seoDescription"),
  };
}
