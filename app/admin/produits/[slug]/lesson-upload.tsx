"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  prepareLessonUploadAction,
  saveLessonAction,
} from "@/lib/actions/admin/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MAX_MB = 50;

/**
 * Ajout d'un contenu (livre PDF ou vidéo) : le navigateur envoie le fichier
 * directement au stockage privé avec un jeton limité à ce seul fichier, puis
 * le serveur le contrôle (vrai type, bon produit) avant de créer la leçon.
 */
export function LessonUpload({
  productSlug,
  modules,
}: {
  productSlug: string;
  modules: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [progress, setProgress] = useState<string | null>(null);

  function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const file = data.get("file");
    const title = String(data.get("title") ?? "");
    const type = data.get("type") === "VIDEO" ? "VIDEO" : "PDF";
    const moduleId = String(data.get("moduleId") ?? "");
    const newModuleTitle = String(data.get("newModuleTitle") ?? "");
    if (!(file instanceof File) || file.size === 0) {
      setMessage({ ok: false, text: "Choisissez un fichier." });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      setProgress("Préparation de l'envoi…");
      const prepared = await prepareLessonUploadAction({
        productSlug,
        fileName: file.name,
        size: file.size,
        type,
      });
      if (!prepared.ok) {
        setProgress(null);
        setMessage({ ok: false, text: prepared.message });
        return;
      }
      setProgress(
        `Envoi de « ${file.name} » (${(file.size / 1024 / 1024).toFixed(1)} Mo)…`,
      );
      const { error } = await createClient()
        .storage.from("formations")
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType:
            type === "PDF" ? "application/pdf" : file.type || "video/mp4",
        });
      if (error) {
        setProgress(null);
        setMessage({
          ok: false,
          text: "L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez.",
        });
        return;
      }
      setProgress("Contrôle du fichier…");
      const result = await saveLessonAction({
        productSlug,
        title,
        type,
        path: prepared.path,
        moduleId: moduleId || undefined,
        newModuleTitle: newModuleTitle || undefined,
      });
      setProgress(null);
      setMessage({
        ok: Boolean(result?.ok),
        text: result?.message ?? "Erreur.",
      });
      if (result?.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-title">Titre affiché au client</Label>
          <Input
            id="lesson-title"
            name="title"
            required
            minLength={3}
            placeholder="Ex. : Le guide complet (PDF)"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-type">Type de fichier</Label>
          <Select id="lesson-type" name="type" defaultValue="PDF">
            <option value="PDF">Livre ou document (PDF)</option>
            <option value="VIDEO">Vidéo (MP4 ou WebM)</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-module">Rubrique</Label>
          <Select
            id="lesson-module"
            name="moduleId"
            defaultValue={modules[0]?.id ?? ""}
          >
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
            <option value="">+ Nouvelle rubrique…</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lesson-new-module">Nom de la nouvelle rubrique</Label>
          <Input
            id="lesson-new-module"
            name="newModuleTitle"
            placeholder="Ex. : Votre livre"
          />
          <p className="text-ink-faint text-xs">
            Utilisé seulement si vous choisissez « Nouvelle rubrique ».
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-file">Fichier</Label>
        <input
          id="lesson-file"
          name="file"
          type="file"
          accept=".pdf,.mp4,.webm,application/pdf,video/mp4,video/webm"
          required
          className="text-ink-soft text-sm"
        />
        <p className="text-ink-faint text-xs">
          {MAX_MB} Mo maximum (limite du stockage actuel). Pour des fichiers
          plus lourds, la clé USB ou une remise par WhatsApp reste la bonne
          voie.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Envoi en cours…" : "Ajouter ce contenu"}
        </Button>
        {progress ? (
          <p className="text-ink-soft text-xs" aria-live="polite">
            {progress}
          </p>
        ) : null}
        {message ? (
          <p
            role={message.ok ? "status" : "alert"}
            className={`text-xs ${message.ok ? "text-success-text" : "text-danger-text"}`}
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
