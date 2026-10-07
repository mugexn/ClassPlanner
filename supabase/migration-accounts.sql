create policy "profiles update own name" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on profiles from anon, authenticated;
grant update (full_name) on profiles to authenticated;
