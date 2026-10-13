import { formatPrice } from "@/lib/format";

type Point = { date: string; total: number; count: number };

/**
 * Ventes des 30 derniers jours : barres en SVG (aucune bibliothèque, aucun
 * JavaScript côté navigateur). Chaque barre porte une infobulle (date,
 * montant, nombre de ventes) et le graphique a un résumé pour les lecteurs
 * d'écran.
 */
export function RevenueChart({ data }: { data: Point[] }) {
  const max = Math.max(...data.map((point) => point.total), 1);
  const totalRevenue = data.reduce((sum, point) => sum + point.total, 0);
  const totalCount = data.reduce((sum, point) => sum + point.count, 0);
  const width = 600;
  const height = 160;
  const gap = 3;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  if (totalCount === 0) {
    return (
      <p className="text-ink-soft py-10 text-center text-sm">
        Aucune vente sur les 30 derniers jours. Dès qu&apos;une commande est
        payée, elle apparaît ici.
      </p>
    );
  }

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height + 22}`}
        role="img"
        aria-label={`Ventes des 30 derniers jours : ${totalCount} vente(s) pour ${formatPrice(totalRevenue)}.`}
        className="h-auto w-full"
      >
        {data.map((point, index) => {
          const barHeight = Math.max(
            point.total > 0 ? 3 : 1,
            (point.total / max) * height,
          );
          const x = index * (barWidth + gap);
          return (
            <g key={point.date}>
              <title>
                {`${new Date(point.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} : ${formatPrice(point.total)} (${point.count} vente${point.count > 1 ? "s" : ""})`}
              </title>
              <rect
                x={x}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                rx={2}
                className={point.total > 0 ? "fill-brand" : "fill-line"}
              />
            </g>
          );
        })}
        <text x={0} y={height + 16} className="fill-ink-faint text-[10px]">
          {new Date(data[0].date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}
        </text>
        <text
          x={width}
          y={height + 16}
          textAnchor="end"
          className="fill-ink-faint text-[10px]"
        >
          Aujourd&apos;hui
        </text>
      </svg>
      <figcaption className="text-ink-faint mt-2 text-xs">
        Jour le plus fort : {formatPrice(max)}.
      </figcaption>
    </figure>
  );
}
