"use client";

import { useEffect, useRef } from "react";
import { trackMeta, type MetaEventName } from "@/lib/meta-pixel";

/**
 * Envoie UN événement au pixel Meta quand la page s'affiche (rien ne s'affiche
 * lui-même). `onceKey` : l'événement ne part qu'une fois par navigateur — pour
 * un achat, afin qu'actualiser la page de confirmation ne le recompte pas.
 */
export function MetaEvent({
  name,
  params,
  eventId,
  onceKey,
}: {
  name: MetaEventName;
  params?: Record<string, unknown>;
  eventId?: string;
  onceKey?: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (onceKey) {
      try {
        if (localStorage.getItem(onceKey)) return;
        localStorage.setItem(onceKey, "1");
      } catch {
        // Stockage indisponible (navigation privée) : on envoie quand même.
      }
    }
    trackMeta(name, params, eventId);
    // Un événement par affichage : les paramètres ne changent pas pendant la vie du composant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
