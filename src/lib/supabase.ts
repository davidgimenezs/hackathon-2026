import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Mensaje de configuración faltante, o null si las variables están cargadas. */
export const configError: string | null =
  !url || !key
    ? 'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Copiá .env.example a .env.local y completalas.'
    : null

export const supabase = configError ? null : createClient(url!, key!)
