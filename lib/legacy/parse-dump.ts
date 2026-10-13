/**
 * Lecture d'un export MySQL (phpMyAdmin) de l'ancien site et construction des
 * fiches « clients RI01 ». Fonctions pures : aucune base, aucun réseau, donc
 * testables avec un petit export fictif (tests/legacy.test.ts).
 *
 * Ce qu'on NE garde volontairement PAS : les mots de passe (hash), les jetons
 * de session, et les adresses email fictives créées par l'ancien import
 * automatique (@ri-client.bf) qui ne reçoivent aucun message.
 */
import { findProduct } from "@/lib/catalog";

export type SqlValue = string | number | null;
export type SqlRow = Record<string, SqlValue>;

const BACKSLASH = String.fromCharCode(92);
const SIMPLE_ESCAPES: Record<string, string> = {
  n: "\n",
  r: "\r",
  t: "\t",
  "0": String.fromCharCode(0),
};

/** Lit « (a, 'b', NULL), (c, …); » à partir de `start`. */
function parseTuples(sql: string, start: number) {
  const rows: SqlValue[][] = [];
  let i = start;

  const skipBlanks = () => {
    while (i < sql.length && " \r\n\t".includes(sql[i])) i += 1;
  };

  while (i < sql.length) {
    skipBlanks();
    if (sql[i] === ",") {
      i += 1;
      continue;
    }
    if (i >= sql.length || sql[i] === ";") break;
    if (sql[i] !== "(") {
      throw new Error(`Export SQL illisible près de : ${sql.slice(i, i + 40)}`);
    }
    i += 1;

    const row: SqlValue[] = [];
    for (;;) {
      skipBlanks();
      if (sql[i] === "'") {
        i += 1;
        let text = "";
        for (;;) {
          const ch = sql[i];
          if (ch === undefined) throw new Error("Chaîne SQL non terminée.");
          if (ch === BACKSLASH) {
            const next = sql[i + 1];
            text += SIMPLE_ESCAPES[next] ?? next;
            i += 2;
          } else if (ch === "'") {
            if (sql[i + 1] === "'") {
              text += "'";
              i += 2;
            } else {
              i += 1;
              break;
            }
          } else {
            text += ch;
            i += 1;
          }
        }
        row.push(text);
      } else {
        const token = /^(NULL|-?\d+(?:\.\d+)?)/.exec(sql.slice(i, i + 40));
        if (!token) {
          throw new Error(`Valeur SQL inattendue : ${sql.slice(i, i + 40)}`);
        }
        i += token[0].length;
        row.push(token[0] === "NULL" ? null : Number(token[0]));
      }
      skipBlanks();
      if (sql[i] === ",") {
        i += 1;
        continue;
      }
      if (sql[i] === ")") {
        i += 1;
        break;
      }
      throw new Error(`Valeur SQL inattendue : ${sql.slice(i, i + 40)}`);
    }
    rows.push(row);
  }
  return { rows, end: i };
}

/** Toutes les lignes des instructions INSERT, par table. */
export function parseSqlInserts(sql: string): Record<string, SqlRow[]> {
  const tables: Record<string, SqlRow[]> = {};
  const header = /INSERT INTO `(\w+)` \(([^)]*)\) VALUES\s*/g;
  let match: RegExpExecArray | null;
  while ((match = header.exec(sql))) {
    const columns = match[2].split(",").map((c) => c.trim().replace(/`/g, ""));
    const { rows, end } = parseTuples(sql, header.lastIndex);
    const list = (tables[match[1]] ??= []);
    for (const row of rows) {
      list.push(
        Object.fromEntries(columns.map((c, index) => [c, row[index] ?? null])),
      );
    }
    header.lastIndex = end;
  }
  return tables;
}

/* ------------------------------ Fiches clients ------------------------------ */

export type LegacyPurchase = {
  product: string;
  productSlug: string | null;
  amount: number;
  status: "ACCES_ACTIVE" | "PAIEMENT_RECU";
  date: string;
};

export type LegacyClientInput = {
  legacyUserId: number;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  signedUpAt: Date | null;
  purchases: LegacyPurchase[];
  adminNote: string | null;
};

/** Produits de l'ancien site -> produits du catalogue actuel. */
const LEGACY_PRODUCT_SLUGS: Record<number, string> = {
  1: "cle-formations-completes",
  2: "cle-formations-smart",
  3: "cle-enfants",
  4: "cle-tout-en-un",
};

/** Domaine des adresses fictives créées par l'ancien import automatique. */
const SYNTHETIC_EMAIL_DOMAIN = "@ri-client.bf";

/** Format international : 8 chiffres = numéro burkinabè local, on ajoute +226. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return null;
  if (digits.length === 8) return `+226${digits}`;
  return `+${digits}`;
}

const asString = (value: SqlValue | undefined) =>
  typeof value === "string" ? value.trim() : "";

/** MySQL « 2026-03-20 14:09:26 » (sans fuseau) lu comme UTC. */
function parseDate(value: SqlValue | undefined): Date | null {
  const text = asString(value);
  if (!text) return null;
  const date = new Date(`${text.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Clients à reprendre : les utilisateurs « client » qui ont au moins un accès
 * activé ou un paiement reçu. Les comptes sans achat et les administrateurs
 * sont ignorés. Triés par date d'inscription (puis identifiant) : l'ordre sert
 * à numéroter les codes RI01-001, RI01-002…
 */
export function buildLegacyClients(
  tables: Record<string, SqlRow[]>,
): LegacyClientInput[] {
  const users = tables.users ?? [];
  const orders = tables.commandes ?? [];
  const access = tables.acces_formations ?? [];
  const products = new Map(
    (tables.produits ?? []).map((p) => [Number(p.id), asString(p.nom)]),
  );

  const paidUsers = new Set(
    orders
      .filter(
        (o) => o.statut === "acces_active" || o.statut === "paiement_recu",
      )
      .map((o) => Number(o.user_id)),
  );
  const accessUsers = new Set(access.map((a) => Number(a.user_id)));

  const clients = users
    .filter(
      (u) =>
        u.role === "client" &&
        (paidUsers.has(Number(u.id)) || accessUsers.has(Number(u.id))),
    )
    .sort((a, b) => {
      const byDate =
        (parseDate(a.created_at)?.getTime() ?? 0) -
        (parseDate(b.created_at)?.getTime() ?? 0);
      return byDate !== 0 ? byDate : Number(a.id) - Number(b.id);
    });

  return clients.map((u) => {
    const userId = Number(u.id);
    const userOrders = orders
      .filter(
        (o) =>
          Number(o.user_id) === userId &&
          (o.statut === "acces_active" || o.statut === "paiement_recu"),
      )
      .sort(
        (a, b) =>
          (parseDate(a.created_at)?.getTime() ?? 0) -
          (parseDate(b.created_at)?.getTime() ?? 0),
      );

    const purchases: LegacyPurchase[] = userOrders.map((o) => {
      const productId = Number(o.produit_id);
      const slug = LEGACY_PRODUCT_SLUGS[productId] ?? null;
      return {
        product:
          (slug ? findProduct(slug)?.name : undefined) ??
          products.get(productId) ??
          "Produit de l'ancien site",
        productSlug: slug,
        amount: Number(o.montant),
        status: o.statut === "acces_active" ? "ACCES_ACTIVE" : "PAIEMENT_RECU",
        date: parseDate(o.created_at)?.toISOString() ?? "",
      };
    });

    const email = asString(u.email).toLowerCase();
    const notes = [
      ...new Set(userOrders.map((o) => asString(o.note_admin)).filter(Boolean)),
    ];

    return {
      legacyUserId: userId,
      name: asString(u.name),
      email: email && !email.endsWith(SYNTHETIC_EMAIL_DOMAIN) ? email : null,
      phone: normalizePhone(asString(u.telephone)),
      city: asString(u.ville) || null,
      signedUpAt: parseDate(u.created_at),
      purchases,
      adminNote: notes.length > 0 ? notes.join(" · ") : null,
    };
  });
}

/** Code lisible : RI01-001. */
export function legacyClientCode(batch: string, rank: number) {
  return `${batch}-${String(rank).padStart(3, "0")}`;
}
