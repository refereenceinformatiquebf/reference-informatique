"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, isTrackablePath } from "@/lib/meta-pixel";

/**
 * Charge le pixel Meta (voir lib/meta-pixel.ts pour les pages exclues et
 * l'absence d'identifiant : sans identifiant, rien n'est chargé).
 *
 * Le pixel envoie lui-même une vue de page à chaque changement de page du site ;
 * on ne la déclenche pas à la main (testé : le désactiver pour la renvoyer
 * soi-même fait ignorer toutes les vues suivantes). Une page exclue n'est donc
 * protégée que si elle est la PREMIÈRE page de la visite — ce qui est le cas des
 * liens à jeton, ouverts depuis un e-mail.
 */
export function MetaPixel() {
  const pathname = usePathname();
  if (!META_PIXEL_ID || !isTrackablePath(pathname)) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">{`
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init',${JSON.stringify(META_PIXEL_ID)});
      fbq('track','PageView');
      (window.__metaPending||[]).forEach(function(send){send()});
      window.__metaPending=[];
    `}</Script>
  );
}
