-- Référence Informatique V2 — Verrouillage de l'API publique Supabase (PostgREST)
--
-- À APPLIQUER MANUELLEMENT (SQL Editor de Supabase) après relecture.
--
-- Pourquoi (audit du 13/10/2026) :
--   1. La politique « Modifier son propre profil » n'a ni WITH CHECK ni
--      restriction de colonne, et le rôle `authenticated` a UPDATE sur toute
--      la table `profiles`. Un utilisateur connecté pouvait donc, depuis son
--      navigateur, avec la clé publique du site, exécuter
--        PATCH /rest/v1/profiles?id=eq.<son id>   { "role": "ADMIN" }
--      et devenir administrateur (le site fait confiance à profiles.role).
--   2. `quote_requests` et `contact_messages` acceptaient des INSERT anonymes
--      directs (WITH CHECK true) : contournement du rate limit et de la
--      validation, donc spam possible.
--   3. `_prisma_migrations` n'a pas de RLS et était lisible par `anon`.
--
-- Principe : le site n'écrit JAMAIS dans la base par l'API publique. Toutes
-- les écritures passent par Prisma (rôle `postgres`, non concerné par ces
-- révocations). Le navigateur ne fait qu'une lecture : son propre profil
-- (components/marketing/use-current-profile.ts), filtrée par RLS.
-- Les politiques RLS existantes restent en place comme seconde barrière.

begin;

-- 1. Plus aucune écriture via l'API publique, pour tous les rôles exposés.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon, authenticated;

-- 2. Le visiteur anonyme ne lit que le catalogue public (déjà filtré par RLS
--    pour les témoignages, articles et réalisations).
revoke select on all tables in schema public from anon;
grant select on
  public.products,
  public.services,
  public.service_categories,
  public.modules,
  public.lessons,
  public.testimonials,
  public.articles,
  public.case_studies
to anon;

-- 3. Table technique de Prisma : inaccessible depuis l'API publique.
revoke all on public._prisma_migrations from anon, authenticated;

-- 4. Les tables créées plus tard héritent de ces restrictions.
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate, references, trigger on tables
  from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke select on tables from anon;

-- 5. Ceinture et bretelles : même si un droit d'écriture revenait un jour,
--    un utilisateur de l'API publique ne pourrait pas changer un rôle.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated') then
    raise exception 'Modification du rôle interdite.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_role_escalation();

commit;

-- ============================================================
-- Vérifications à lancer APRÈS application (doivent toutes répondre « 0 ligne »
-- pour les deux premières, et la liste attendue pour la troisième) :
--
-- select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'profiles'
--     and grantee in ('anon', 'authenticated')
--     and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');
--
-- select grantee, table_name from information_schema.role_table_grants
--   where table_schema = 'public' and grantee = 'anon'
--     and privilege_type = 'SELECT'
--     and table_name not in ('products','services','service_categories',
--       'modules','lessons','testimonials','articles','case_studies');
--
-- select tgname from pg_trigger
--   where tgrelid = 'public.profiles'::regclass and not tgisinternal;
--   -- attendu : profiles_prevent_role_escalation
-- ============================================================
