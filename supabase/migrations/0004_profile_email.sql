-- Référence Informatique V2 — email du client recopié dans profiles
--
-- Pourquoi : l'administration doit chercher un client par email (commandes,
-- fiche client, accès) sans appeler l'API d'authentification pour chaque ligne.
-- La colonne profiles.email est créée par la migration Prisma
-- 20261014000000_admin_v2 ; ce fichier la remplit et la garde à jour.

-- 1. Les nouveaux comptes reçoivent leur email dès la création du profil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    lower(new.email),
    'CLIENT'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- 2. Un changement d'adresse dans l'authentification est répercuté.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set email = lower(new.email) where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute procedure public.sync_profile_email();

-- 3. Rattrapage des comptes existants.
update public.profiles p
  set email = lower(u.email)
  from auth.users u
  where u.id = p.id and p.email is distinct from lower(u.email);
