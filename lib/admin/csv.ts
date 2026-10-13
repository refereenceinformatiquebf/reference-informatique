/**
 * Génération de CSV pour Excel (France / Afrique francophone) : séparateur
 * point-virgule, BOM UTF-8 pour que les accents s'ouvrent correctement, et
 * neutralisation des cellules qui commencent par = + - @ (injection de
 * formule dans un tableur).
 */
function cell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[";\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((row) => row.map(cell).join(";"));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
