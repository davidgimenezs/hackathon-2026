# hackathon-2026 · Tareas

CRUD de tareas con React + Vite + TypeScript y Supabase.

## Estructura

```
supabase/migrations/0001_tareas.sql   tabla `tareas`, índice y políticas RLS
src/lib/supabase.ts                   cliente de Supabase (lee las variables VITE_*)
src/useTareas.ts                      estado: carga, crear, actualizar, borrar (optimista con rollback)
src/components/TaskForm.tsx           input + botón para crear
src/components/TaskItem.tsx           checkbox, edición en línea (Enter guarda, Esc cancela), borrar
src/components/TaskList.tsx           filtros Todas / Faltantes / Completadas con sus conteos
```

## Puesta en marcha

1. **Base de datos.** En el proyecto de Supabase, abrir *SQL Editor* y ejecutar
   `supabase/migrations/0001_tareas.sql`.
2. **Variables.** Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (*Project Settings → API*). Usar la key pública, nunca la `service_role`.
3. **Correr.**
   ```
   npm install
   npm run dev
   ```

Scripts: `npm run build` (typecheck + build), `npm run lint` (oxlint), `npm run preview`.

## Despliegue en Vercel

1. *Add New → Project* e importar `davidgimenezs/hackathon-2026`. Vercel detecta Vite solo
   (build `npm run build`, salida `dist`).
2. En *Settings → Environment Variables* cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Cada push a `main` deploya a producción; cada rama o PR genera un preview.

## Limitaciones

- **Sin login.** Las políticas RLS dan acceso total al rol `anon`: cualquiera con la URL puede ver
  y modificar las tareas. Para algo más que un demo, agregar Supabase Auth, una columna `user_id`
  y políticas que filtren por `auth.uid()`.
- La lista se lee paginada de a 1000 filas (el techo de PostgREST) y se niega a mostrar más de
  10.000 tareas, para no presentar una lista ni unos conteos parciales.
