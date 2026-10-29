-- Tabla principal del CRUD de tareas.
-- Probar antes envuelto en BEGIN ... ROLLBACK si se aplica sobre una base con datos.

create table if not exists public.tareas (
  id             uuid        primary key default gen_random_uuid(),
  titulo         text        not null check (char_length(btrim(titulo)) between 1 and 500),
  completada     boolean     not null default false,
  fecha_creacion timestamptz not null default now()
);

create index if not exists tareas_fecha_creacion_idx
  on public.tareas (fecha_creacion desc);

-- RLS activado con acceso público explícito: la app no tiene login, así que
-- cualquiera con la URL puede leer y modificar las tareas. Para un demo de
-- hackathon está bien; si se agrega autenticación, reemplazar estas políticas
-- por unas que filtren por auth.uid().
alter table public.tareas enable row level security;

drop policy if exists "tareas_select_publico" on public.tareas;
drop policy if exists "tareas_insert_publico" on public.tareas;
drop policy if exists "tareas_update_publico" on public.tareas;
drop policy if exists "tareas_delete_publico" on public.tareas;

create policy "tareas_select_publico" on public.tareas
  for select to anon, authenticated using (true);
create policy "tareas_insert_publico" on public.tareas
  for insert to anon, authenticated with check (true);
create policy "tareas_update_publico" on public.tareas
  for update to anon, authenticated using (true) with check (true);
create policy "tareas_delete_publico" on public.tareas
  for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.tareas to anon, authenticated;
