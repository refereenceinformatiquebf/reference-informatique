"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Actualise la page toute seule tant que le paiement n'est pas confirmé : le
 * client voit son achat s'activer sans toucher à rien. S'arrête après
 * quelques minutes (la page garde alors son bouton « Actualiser »).
 */
export function AutoRefresh({
  everyMs = 5000,
  maxTimes = 36,
}: {
  everyMs?: number;
  maxTimes?: number;
}) {
  const router = useRouter();
  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      if (count > maxTimes) {
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, everyMs);
    return () => clearInterval(timer);
  }, [router, everyMs, maxTimes]);
  return null;
}
