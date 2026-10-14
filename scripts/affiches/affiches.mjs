/**
 * Les affiches des produits : une composition par produit, à la charte
 * (marine #0B1F3A / bleu #1565C0, DM Serif Display + DM Sans, aucun décor
 * circulaire), au format 4:5 de la boutique (1200 x 1500).
 *
 * Règles de rédaction, comme pour le catalogue :
 *  - AUCUN prix sur l'image : il change, l'image non (le prix vit sur la fiche) ;
 *  - AUCUN chiffre ni promesse hors catalogue : tout nombre affiché est celui
 *    de la fiche produit (lib/catalog/products.ts) ;
 *  - AUCUN témoignage, note ou logo de marque tiers.
 *
 * Si un chiffre change dans le catalogue, il faut le changer ici puis relancer
 * `node scripts/affiches/generer.mjs` (voir README).
 */

import * as Art from "./illustrations.mjs";
import { check } from "./illustrations.mjs";

export const SITE_DOMAIN = "reference-informatique.com";

const GRADIENTS = {
  navy: "linear-gradient(150deg, #0b1f3a 0%, #0d4fa0 100%)",
  blue: "linear-gradient(150deg, #063a80 0%, #1565c0 100%)",
  deep: "linear-gradient(150deg, #032660 0%, #0b1f3a 100%)",
  sky: "linear-gradient(150deg, #0d4fa0 0%, #2a7bdc 100%)",
};

export const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:1500px;overflow:hidden}
body{font-family:'DM Sans',system-ui,sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
.serif{font-family:'DM Serif Display',Georgia,serif;font-weight:400}
.poster{position:relative;width:1200px;height:1500px;display:flex;flex-direction:column;padding:72px 72px 0;overflow:hidden}
.poster::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:60px 60px;-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 75%);mask-image:linear-gradient(180deg,#000 0%,transparent 75%)}
.poster::after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,0) 38%)}
.poster>*{position:relative;z-index:1}

.top{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:20px}
.mark{width:76px;height:76px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px -8px rgba(2,10,25,.5)}
.mark img{width:60px;height:auto;display:block}
.word{display:flex;flex-direction:column;gap:7px}
.word b{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:42px;line-height:1;letter-spacing:-.01em}
.word i{font-style:normal;font-size:15px;line-height:1;font-weight:500;letter-spacing:.17em;text-transform:uppercase;color:rgba(255,255,255,.75)}
.kind{display:inline-flex;align-items:center;gap:12px;padding:15px 28px;border-radius:999px;background:rgba(255,255,255,.13);border:2px solid rgba(255,255,255,.32);font-size:26px;font-weight:500;letter-spacing:.04em}
.kind svg{width:28px;height:28px}

.art{flex:1;position:relative;margin:24px 0 24px;display:flex;align-items:center;justify-content:center;min-height:0}
.stage{position:relative;width:1056px;flex:none}

.copy h1{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:104px;line-height:1.03;letter-spacing:-.02em;text-wrap:balance}
.copy h1.m{font-size:90px}
.copy p{margin-top:24px;font-size:36px;line-height:1.32;color:rgba(255,255,255,.86);max-width:980px;text-wrap:balance}

.facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:36px}
.fact{padding:22px 22px 20px;border-radius:20px;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.22)}
.fact b{display:block;font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:50px;line-height:1.05;letter-spacing:-.01em}
.fact b.s{font-size:38px;line-height:1.15;padding-top:6px}
.fact span{display:block;margin-top:8px;font-size:22px;line-height:1.25;font-weight:500;color:rgba(255,255,255,.8)}

.foot{display:flex;align-items:center;justify-content:space-between;margin:34px -72px 0;padding:27px 72px 29px;background:rgba(4,14,30,.55);border-top:1.5px solid rgba(255,255,255,.16);font-size:27px}
.foot .ok{display:flex;align-items:center;gap:14px;font-weight:500}
.foot .ok svg{width:34px;height:34px;padding:6px;border-radius:9px;background:#fff;color:#1565c0}
.foot .dom{font-weight:700;letter-spacing:.02em}

/* briques d'illustration */
.card{background:#fff;color:#0b1f3a;border-radius:24px;box-shadow:0 34px 60px -24px rgba(2,10,25,.6),0 0 0 1px rgba(11,31,58,.05)}
.glass{background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.28);border-radius:24px}
.b{display:block;border-radius:999px}
.abs{position:absolute}
.muted{color:#46576f}
.chk{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:11px;background:#1565c0;color:#fff;flex:none}
.chk svg{width:26px;height:26px}
`;

/** Pictos des familles (même dessin que les icônes du site, simplifiés). */
const KIND_ICON = {
  formation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2.5"/><path d="M10 8.5l5 2.5-5 2.5z" fill="currentColor"/><path d="M8 21h8"/></svg>`,
  ebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/></svg>`,
  pack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>`,
  modele: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>`,
  outil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/></svg>`,
};
const KIND_LABEL = {
  formation: "Formation",
  ebook: "Livre numérique",
  pack: "Pack d'outils",
  modele: "Modèles",
  outil: "Outil",
};

/* ---------------------------------------------------------------------- */
/* Définition des affiches                                                 */
/* ---------------------------------------------------------------------- */

const OK_NUM = "Accès immédiat après paiement";

export const AFFICHES = [
  {
    slug: "pack-formations-completes-office-ia",
    tone: "navy",
    kind: "formation",
    title: "Pack de Formations Complètes",
    lead: "Excel, Word, PowerPoint, Access et intelligence artificielle, réunis dans un seul accès.",
    facts: [
      ["6", "formations réunies"],
      ["À vie", "accès sans limite"],
      ["Vidéos", "et supports"],
      ["Votre", "rythme, partout"],
    ],
    footer: OK_NUM,
    art: Art.artPackFormations,
    artH: 640,
    alt: "Pack de Formations Complètes : Excel de A à Z, Excel et IA, Word, PowerPoint, Access et intelligence artificielle réunis dans un seul accès à vie.",
  },
  {
    slug: "pack-120-logiciels-excel",
    tone: "blue",
    kind: "pack",
    title: "Plus de 120 logiciels Excel",
    lead: "Facturation, stock, comptabilité, paie : des fichiers prêts à l'emploi, sans repartir de zéro.",
    facts: [
      ["120+", "outils prêts à l'emploi"],
      ["100 %", "modifiables"],
      ["100", "livres PDF en bonus"],
      ["Bonus", "formation Excel"],
    ],
    footer: OK_NUM,
    art: Art.artExcel,
    artH: 610,
    alt: "Pack de plus de 120 logiciels Excel : facturation, stock, paie, budget et comptabilité, avec une formation Excel et 100 livres PDF en bonus.",
  },
  {
    slug: "pack-5500-diapositives-powerpoint",
    tone: "sky",
    kind: "modele",
    title: "Plus de 5 500 diapositives PowerPoint",
    lead: "Votre présentation est pour demain ? Choisissez un modèle, ajoutez votre contenu : c'est prêt.",
    facts: [
      ["5 500+", "diapositives"],
      ["100 %", "modifiables"],
      ["Tous", "secteurs d'activité"],
      ["Bonus", "formation PowerPoint"],
    ],
    footer: OK_NUM,
    art: Art.artSlides,
    artH: 640,
    alt: "Pack de plus de 5 500 diapositives PowerPoint : des modèles modernes et modifiables pour vos réunions et vos soutenances.",
    titleSize: "m",
  },
  {
    slug: "prise-de-parole-en-public",
    tone: "navy",
    kind: "formation",
    title: "Prise de Parole en Public",
    lead: "Transformez le trac en énergie : structurez votre discours et convainquez.",
    facts: [
      ["Le trac", "et les émotions"],
      ["Le discours", "sa construction"],
      ["Persuasion", "verbal et non verbal"],
      ["10", "livres et audios en bonus"],
    ],
    footer: OK_NUM,
    art: Art.artWave,
    factsSmall: true,
    artH: 600,
    alt: "Pack Prise de Parole en Public : le trac et les émotions, la construction du discours, la persuasion, avec 10 livres et audios en bonus.",
  },
  {
    slug: "formation-anglais-professionnel",
    tone: "blue",
    kind: "formation",
    title: "Formation en Anglais",
    lead: "De l'anglais de tous les jours à l'anglais des affaires, du niveau débutant au niveau avancé.",
    facts: [
      ["250", "vidéos"],
      ["200", "exercices"],
      ["250", "audios"],
      ["150", "fiches PDF"],
    ],
    footer: OK_NUM,
    art: Art.artAnglais,
    artH: 740,
    alt: "Pack de Formation en Anglais : 250 vidéos, 200 exercices, 250 audios et 150 fiches PDF, du niveau débutant au niveau avancé.",
  },
  {
    slug: "le-chercheur-augmente",
    tone: "deep",
    kind: "ebook",
    title: "Le Chercheur Augmenté",
    lead: "Guide IA pour la recherche académique : gagnez du temps sans jamais sacrifier la rigueur.",
    facts: [
      ["PDF", "guide pratique"],
      ["Prompts", "prêts à copier"],
      ["Revue", "de littérature flash"],
      ["Éthique", "checklist de vérification"],
    ],
    footer: OK_NUM,
    art: Art.artChercheur,
    artH: 610,
    alt: "Le Chercheur Augmenté : guide IA pour la recherche académique, avec des prompts, une revue de littérature flash et une checklist de vérification.",
  },
  {
    slug: "comprends-ce-quelle-traverse",
    tone: "sky",
    kind: "ebook",
    title: "Comprends ce qu'elle traverse",
    lead: "Guide de bien-être féminin : comprendre ce que le corps essaie de dire, simplement et avec bienveillance.",
    facts: [
      ["PDF", "guide simple"],
      ["Sans", "jargon médical"],
      ["Sommeil", "alimentation, stress"],
      ["Savoir", "quand consulter"],
    ],
    footer: "Accès immédiat · pas un avis médical",
    art: Art.artBienEtre,
    artH: 660,
    alt: "Comprends ce qu'elle traverse : guide de bien-être féminin sur la fatigue, la tristesse, les bouffées de chaleur et l'irritabilité. Ne remplace pas un avis médical.",
    titleSize: "m",
  },
  {
    slug: "verites-cachees-couples",
    tone: "deep",
    kind: "ebook",
    title: "Les Vérités Cachées qui Détruisent les Couples",
    lead: "Ce n'est pas la dispute qui abîme un couple : c'est le silence d'avant.",
    facts: [
      ["76", "pages en PDF"],
      ["Besoins", "rarement exprimés"],
      ["Dialogue", "qui répare"],
      ["Rituels", "des couples qui durent"],
    ],
    footer: OK_NUM,
    art: Art.artCouples,
    artH: 640,
    alt: "Les Vérités Cachées qui Détruisent les Couples : un livre PDF de 76 pages sur les non-dits et la communication qui répare.",
    titleSize: "m",
  },
  {
    slug: "formation-maintenance-logicielle",
    tone: "deep",
    kind: "formation",
    title: "Formation Maintenance Logicielle",
    lead: "Devenez autonome sur votre PC : dépanner, sécuriser et optimiser, en direct et 100 % en ligne.",
    facts: [
      ["12", "modules pratiques"],
      ["20", "jours de formation"],
      ["15", "personnes maximum"],
      ["Attestation", "de participation"],
    ],
    footer: "Formation en direct · aide sur WhatsApp",
    art: Art.artMaintenance,
    artH: 610,
    alt: "Formation Maintenance Logicielle : 12 modules en direct sur 20 jours, groupes de 15 personnes maximum, attestation de participation.",
  },
  {
    slug: "performance-pc",
    tone: "navy",
    kind: "outil",
    title: "Performance PC",
    lead: "Diagnostiquez votre ordinateur en 30 secondes, puis réglez le problème vous-même.",
    facts: [
      ["30 s", "pour lancer le scan"],
      ["8", "causes courantes repérées"],
      ["Aucune", "compétence technique"],
      ["Windows", "ordinateurs compatibles"],
    ],
    footer: "Remise de l'outil sur WhatsApp",
    art: Art.artPerformance,
    artH: 710,
    alt: "Performance PC : un scan d'environ 30 secondes pour savoir pourquoi votre ordinateur ralentit, puis la marche à suivre.",
  },
  {
    slug: "licence-expert-office-365-windows-11",
    tone: "navy",
    kind: "pack",
    title: "Licence Expert — Office 365 & Windows 11",
    lead: "Une seule licence active Microsoft Office 365 et Windows 11 — générée automatiquement après paiement.",
    facts: [
      ["Minutes", "licence générée"],
      ["Office", "+ Windows 11"],
      ["À vie", "aucun abonnement"],
      ["Guide +", "aide WhatsApp"],
    ],
    footer: OK_NUM,
    art: Art.artLicence,
    artH: 650,
    alt: "Licence Expert — Office 365 et Windows 11 : une licence générée automatiquement après paiement, pour activer les deux en quelques minutes.",
  },
];

/* ---------------------------------------------------------------------- */
/* Assemblage de la page                                                   */
/* ---------------------------------------------------------------------- */

export function pageHtml(affiche, logoDataUri) {
  const facts = affiche.facts
    .map(
      ([big, small]) =>
        `<div class="fact"><b class="${affiche.factsSmall || big.length > 8 ? "s" : ""}">${big}</b><span>${small}</span></div>`,
    )
    .join("");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body><div class="poster" style="background:${GRADIENTS[affiche.tone]}">
  <header class="top">
    <div class="brand"><span class="mark"><img src="${logoDataUri}" alt=""></span><span class="word"><b>Référence</b><i>Informatique</i></span></div>
    <span class="kind">${KIND_ICON[affiche.kind]}${KIND_LABEL[affiche.kind]}</span>
  </header>
  <section class="art"><div class="stage" style="height:${affiche.artH}px">${affiche.art()}</div></section>
  <section class="copy"><h1 class="${affiche.titleSize ?? ""}">${affiche.title}</h1><p>${affiche.lead}</p></section>
  <section class="facts">${facts}</section>
  <footer class="foot"><span class="ok">${check}${affiche.footer}</span><span class="dom">${SITE_DOMAIN}</span></footer>
</div></body></html>`;
}
