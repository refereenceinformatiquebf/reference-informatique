import {
  IconCode,
  IconAgentIa,
  IconAutomatisation,
  IconMaintenance,
  type IconProps,
} from "@/components/icons";

/** Fait le lien entre ServiceCategory.iconKey (en base) et le composant
 * d'icône réel — mapping explicite plutôt qu'une résolution par nom de
 * chaîne, pour qu'une clé mal orthographiée soit une erreur TypeScript,
 * pas un trou silencieux dans l'interface. */
const ICONS_BY_KEY = {
  code: IconCode,
  "agent-ia": IconAgentIa,
  automatisation: IconAutomatisation,
  maintenance: IconMaintenance,
} as const;

export function ServiceCategoryIcon({
  iconKey,
  ...props
}: IconProps & { iconKey: string }) {
  const Icon = ICONS_BY_KEY[iconKey as keyof typeof ICONS_BY_KEY];
  return Icon ? <Icon {...props} /> : null;
}
