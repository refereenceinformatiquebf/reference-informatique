/**
 * Génère les affiches des produits (public/produits/affiches/<slug>.webp).
 *
 *   node scripts/affiches/generer.mjs              # toutes les affiches
 *   node scripts/affiches/generer.mjs performance-pc   # une seule
 *
 * Il faut Google Chrome et le paquet `puppeteer-core` (qui n'est PAS une
 * dépendance du site : `npm i --no-save puppeteer-core`). Chemins réglables :
 *   CHROME_PATH         (défaut : Chrome de Windows)
 *   PUPPETEER_CORE_URL  (adresse d'import du module, si installé ailleurs)
 *   AFFICHES_APERCU=1   (écrit aussi un PNG sans perte dans ./scripts/affiches/apercu)
 *
 * Les polices (DM Serif Display, DM Sans) sont chargées depuis Google Fonts :
 * une connexion internet est nécessaire.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { AFFICHES, pageHtml } from "./affiches.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const outDir = path.join(root, "public", "produits", "affiches");
const previewDir = path.join(here, "apercu");

const chrome =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const { default: puppeteer } = await import(
  process.env.PUPPETEER_CORE_URL ?? "puppeteer-core"
);

const logo = `data:image/png;base64,${fs
  .readFileSync(path.join(root, "public", "brand", "logo-icon.png"))
  .toString("base64")}`;

const only = process.argv.slice(2);
const list = only.length
  ? AFFICHES.filter((a) => only.includes(a.slug))
  : AFFICHES;
if (list.length === 0) {
  console.error("Aucune affiche ne correspond à :", only.join(", "));
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
if (process.env.AFFICHES_APERCU) fs.mkdirSync(previewDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--no-sandbox"],
});
try {
  for (const affiche of list) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 1 });
    await page.setContent(pageHtml(affiche, logo), {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => ({
      serif: document.fonts.check("40px 'DM Serif Display'"),
      sans: document.fonts.check("700 20px 'DM Sans'"),
    }));
    if (!fonts.serif || !fonts.sans) {
      throw new Error(
        "Les polices de la charte ne se sont pas chargées (connexion internet ?).",
      );
    }
    // Contrôle de mise en page : rien ne doit déborder de l'affiche.
    const overflow = await page.evaluate(() => {
      const poster = document.querySelector(".poster");
      const foot = document.querySelector(".foot").getBoundingClientRect();
      const art = document.querySelector(".art").getBoundingClientRect();
      const stage = document.querySelector(".stage");
      const copy = document.querySelector(".copy").getBoundingClientRect();
      return {
        scroll: poster.scrollHeight - poster.clientHeight,
        footBottom: Math.round(foot.bottom),
        artHeight: Math.round(art.height),
        stageHeight: Math.round(stage.getBoundingClientRect().height),
        copyHeight: Math.round(copy.height),
      };
    });
    const png = await page.screenshot({ type: "png" });
    await page.close();

    const file = path.join(outDir, `${affiche.slug}.webp`);
    await sharp(png).webp({ quality: 88, effort: 6 }).toFile(file);
    if (process.env.AFFICHES_APERCU) {
      fs.writeFileSync(path.join(previewDir, `${affiche.slug}.png`), png);
    }
    const kb = Math.round(fs.statSync(file).size / 1024);
    console.log(
      `${affiche.slug}.webp  ${kb} Ko  (illustration : ${overflow.artHeight} px, texte : ${overflow.copyHeight} px, débordement : ${overflow.scroll} px)`,
    );
  }
} finally {
  await browser.close();
}
