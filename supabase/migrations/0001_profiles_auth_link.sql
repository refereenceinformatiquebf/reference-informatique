-- Référence Informatique V2 — Étape 2
-- Cette migration est appliquée manuellement (SQL Editor de Supabase, ou
-- `supabase db push` avec la CLI Supabase), séparément des migrations
-- Prisma : elle touche au schéma `auth`, géré par Supabase Auth et hors
-- périmètre de Prisma.
--
-- Contenu :
--   1. Lien entre profiles.id et auth.users.id (clé étrangère + trigger de
--      création automatique du profil métier à chaque inscription).
--   2. Activation de Row Level Security sur toutes les tables métier, avec
--      des politiques explicites — filet de sécurité valable même si une
--      requête passe un jour par le client Supabase plutôt que par l'API
--      Next.js (voir PLAYBOOK-CONSTRUCTION.md, section 4).

-- ============================================================
-- 1. Lien profiles <-> auth.users
-- ============================================================

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- Crée automatiquement la ligne "profiles" métier à chaque inscription,
-- pour qu'aucun code applicatif n'ait à s'en souvenir.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    'CLIENT'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. Fonction utilitaire : l'utilisateur courant est-il admin ?
-- ============================================================
-- Évite de dupliquer le sous-select "exists(...)" dans chaque politique.

create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- ============================================================
-- 3. Row Level Security — tables personnelles
--    (lecture/écriture limitées au propriétaire, accès total pour ADMIN)
-- ============================================================

alter table public.profiles enable row level security;

create policy "Lire son propre profil" on public.profiles
  for select using (auth.uid() = id);

create policy "Modifier son propre profil" on public.profiles
  for update using (auth.uid() = id);

create policy "Admin lit tous les profils" on public.profiles
  for select using (public.is_admin());

create policy "Admin modifie tous les profils" on public.profiles
  for update using (public.is_admin());

alter table public.orders enable row level security;

create policy "Lire ses propres commandes" on public.orders
  for select using (auth.uid() = profile_id);

create policy "Admin lit toutes les commandes" on public.orders
  for select using (public.is_admin());

create policy "Admin modifie toutes les commandes" on public.orders
  for update using (public.is_admin());

alter table public.payments enable row level security;

create policy "Lire les paiements de ses propres commandes" on public.payments
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id and orders.profile_id = auth.uid()
    )
  );

create policy "Admin lit tous les paiements" on public.payments
  for select using (public.is_admin());

alter table public.access enable row level security;

create policy "Lire ses propres accès" on public.access
  for select using (auth.uid() = profile_id);

create policy "Admin gère tous les accès" on public.access
  for all using (public.is_admin());

alter table public.progress enable row level security;

create policy "Lire et écrire sa propre progression" on public.progress
  for all using (auth.uid() = profile_id);

create policy "Admin lit toute la progression" on public.progress
  for select using (public.is_admin());

alter table public.quote_requests enable row level security;

create policy "Lire ses propres demandes de devis" on public.quote_requests
  for select using (auth.uid() = profile_id);

create policy "Créer une demande de devis" on public.quote_requests
  for insert with check (true);

create policy "Admin gère toutes les demandes de devis" on public.quote_requests
  for all using (public.is_admin());

alter table public.contact_messages enable row level security;

create policy "Créer un message de contact" on public.contact_messages
  for insert with check (true);

create policy "Admin lit tous les messages de contact" on public.contact_messages
  for select using (public.is_admin());

create policy "Admin modifie les messages de contact" on public.contact_messages
  for update using (public.is_admin());

-- ============================================================
-- 4. Row Level Security — catalogue public
--    (lecture ouverte à tous, écriture réservée à ADMIN)
-- ============================================================

alter table public.products enable row level security;
create policy "Lecture publique des produits" on public.products for select using (true);
create policy "Admin gère les produits" on public.products for all using (public.is_admin());

alter table public.service_categories enable row level security;
create policy "Lecture publique des familles de services" on public.service_categories for select using (true);
create policy "Admin gère les familles de services" on public.service_categories for all using (public.is_admin());

alter table public.services enable row level security;
create policy "Lecture publique des services" on public.services for select using (true);
create policy "Admin gère les services" on public.services for all using (public.is_admin());

alter table public.modules enable row level security;
create policy "Lecture publique de la structure des modules" on public.modules for select using (true);
create policy "Admin gère les modules" on public.modules for all using (public.is_admin());

-- Les leçons elles-mêmes (titre, structure) sont lisibles publiquement,
-- mais storage_path ne donne accès à rien sans une URL signée générée
-- côté serveur après vérification d'un Access réel (voir Étape 15).
alter table public.lessons enable row level security;
create policy "Lecture publique de la structure des leçons" on public.lessons for select using (true);
create policy "Admin gère les leçons" on public.lessons for all using (public.is_admin());

alter table public.testimonials enable row level security;
create policy "Lecture publique des témoignages publiés" on public.testimonials
  for select using (published = true);
create policy "Admin gère tous les témoignages" on public.testimonials
  for all using (public.is_admin());

alter table public.articles enable row level security;
create policy "Lecture publique des articles publiés" on public.articles
  for select using (published_at is not null and published_at <= now());
create policy "Admin gère tous les articles" on public.articles
  for all using (public.is_admin());

alter table public.case_studies enable row level security;
create policy "Lecture publique des réalisations publiées" on public.case_studies
  for select using (published_at is not null and published_at <= now());
create policy "Admin gère toutes les réalisations" on public.case_studies
  for all using (public.is_admin());
