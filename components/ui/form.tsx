"use client";

import type { ComponentProps } from "react";

/**
 * <form> qui CONSERVE ce que l'utilisateur a saisi quand une action serveur
 * répond par une erreur de validation.
 *
 * Pourquoi : avec React 19, un formulaire dont l'attribut `action` est une
 * fonction est vidé automatiquement à la fin de l'action — même quand
 * l'action renvoie une erreur. Sans ce composant, une faute dans un seul champ
 * efface tout le reste (nom, message, adresse de livraison…).
 *
 * `clearOnSuccess` : à passer à `true` quand l'action a RÉUSSI et que le
 * formulaire doit repartir vide (ajout d'un témoignage, d'un accès…).
 */
export function Form({
  clearOnSuccess = false,
  onReset,
  ...props
}: ComponentProps<"form"> & { clearOnSuccess?: boolean }) {
  return (
    <form
      {...props}
      onReset={(event) => {
        onReset?.(event);
        if (!clearOnSuccess) event.preventDefault();
      }}
    />
  );
}
