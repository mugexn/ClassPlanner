create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, full_name text,
  role text not null default 'user' check (role in ('user','admin'))
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('regular','makeup')),
  subject text not null,
  course_section text not null,
  class_type text not null check (class_type in ('lab','lecture')),
  weekdays int[],                                
  start_date date,                             
  end_date date,                               
  date date,                                  
  start_time time not null,
  end_time time not null check (end_time > start_time)
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  text text not null
);

create table dtr (
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  am_in time, am_out time, pm_in time, pm_out time,
  primary key (user_id, date)
);

create function is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  admin_email constant text := 'admin@yourschool.edu';  -- <-- CHANGE THIS
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when lower(new.email) = lower(admin_email) then 'admin' else 'user' end
  );
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table classes  enable row level security;
alter table notes    enable row level security;
alter table dtr      enable row level security;

create policy "profiles read"  on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles update own name" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on profiles from anon, authenticated;
grant update (full_name) on profiles to authenticated;  -- users can edit their display name only, never their role
create policy "classes own/admin" on classes for all
  using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());
create policy "notes own/admin" on notes for all
  using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());
create policy "dtr own/admin" on dtr for all
  using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());
