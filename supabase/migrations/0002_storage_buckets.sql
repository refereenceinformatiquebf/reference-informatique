-- Référence Informatique V2 — Étape 2 (suite)
-- Buckets Supabase Storage et leurs politiques RLS sur storage.objects.

insert into storage.buckets (id, name, public)
values ('medias', 'medias', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('formations', 'formations', false)
on conflict (id) do nothing;

-- --- Bucket "medias" (images produits, articles, réalisations) ---
-- Lecture publique (bucket public de toute façon, mais on documente
-- explicitement l'intention) ; écriture réservée à ADMIN.

create policy "Lecture publique du bucket medias" on storage.objects
  for select using (bucket_id = 'medias');

create policy "Admin ecrit dans medias" on storage.objects
  for insert with check (bucket_id = 'medias' and public.is_admin());

create policy "Admin modifie medias" on storage.objects
  for update using (bucket_id = 'medias' and public.is_admin());

create policy "Admin supprime medias" on storage.objects
  for delete using (bucket_id = 'medias' and public.is_admin());

-- --- Bucket "formations" (vidéos/PDF de leçon) ---
-- Aucune politique de lecture pour les utilisateurs authentifiés : l'accès
-- ne passe jamais par une requête directe au bucket, uniquement par une URL
-- signée à durée limitée générée côté serveur (Étape 15), après vérification
-- explicite d'un Access réel. Seul ADMIN gère le contenu du bucket.

create policy "Admin gere le bucket formations" on storage.objects
  for all using (bucket_id = 'formations' and public.is_admin());
