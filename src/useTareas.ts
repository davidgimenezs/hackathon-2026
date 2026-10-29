import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Tarea } from './types'

const TABLA = 'tareas'
const COLUMNAS = 'id, titulo, completada, fecha_creacion'
// PostgREST devuelve como máximo 1000 filas por respuesta sin importar el .limit().
const TAM_PAGINA = 1000
// Techo de seguridad: si hay más tareas, fallar en vez de mostrar una lista parcial.
const MAX_TAREAS = 10_000

async function leerTodas(): Promise<Tarea[]> {
  if (!supabase) throw new Error('Supabase no está configurado')
  const todas: Tarea[] = []
  for (let desde = 0; ; desde += TAM_PAGINA) {
    const { data, error } = await supabase
      .from(TABLA)
      .select(COLUMNAS)
      .order('fecha_creacion', { ascending: false })
      .order('id', { ascending: true }) // desempate estable entre páginas
      .range(desde, desde + TAM_PAGINA - 1)
    if (error) throw error
    todas.push(...(data as Tarea[]))
    if (data.length < TAM_PAGINA) return todas
    if (todas.length >= MAX_TAREAS) {
      throw new Error(`Hay más de ${MAX_TAREAS} tareas; la lista no se puede mostrar completa.`)
    }
  }
}

function mensaje(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

export function useTareas() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tareasRef = useRef(tareas)
  useEffect(() => {
    tareasRef.current = tareas
  }, [tareas])

  const cargar = useCallback(async () => {
    try {
      setTareas(await leerTodas())
      setError(null)
    } catch (e) {
      setError(mensaje(e))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    let cancelado = false
    leerTodas()
      .then((data) => {
        if (cancelado) return
        setTareas(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (!cancelado) setError(mensaje(e))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const recargar = useCallback(async () => {
    setCargando(true)
    await cargar()
  }, [cargar])

  const crear = useCallback(async (titulo: string) => {
    if (!supabase) return
    const { data, error } = await supabase.from(TABLA).insert({ titulo }).select(COLUMNAS).single()
    if (error) {
      setError(mensaje(error))
      throw error
    }
    setError(null)
    setTareas((prev) => [data as Tarea, ...prev])
  }, [])

  /** Aplica el cambio en pantalla al instante y lo revierte si la base lo rechaza. */
  const actualizar = useCallback(
    async (id: string, cambios: Partial<Pick<Tarea, 'titulo' | 'completada'>>) => {
      if (!supabase) return
      const original = tareasRef.current.find((t) => t.id === id)
      if (!original) return
      setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, ...cambios } : t)))
      const { error } = await supabase.from(TABLA).update(cambios).eq('id', id)
      if (error) {
        setError(mensaje(error))
        // Revertir sólo los campos que este cambio tocó.
        const revertir = Object.fromEntries(
          Object.keys(cambios).map((k) => [k, original[k as keyof typeof cambios]]),
        )
        setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, ...revertir } : t)))
        return
      }
      setError(null)
    },
    [],
  )

  const borrar = useCallback(async (id: string) => {
    if (!supabase) return
    const original = tareasRef.current.find((t) => t.id === id)
    if (!original) return
    setTareas((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from(TABLA).delete().eq('id', id)
    if (error) {
      setError(mensaje(error))
      // Reinsertar en su lugar según fecha_creacion (orden descendente).
      setTareas((prev) => {
        const fecha = Date.parse(original.fecha_creacion)
        const i = prev.findIndex((t) => Date.parse(t.fecha_creacion) < fecha)
        const copia = [...prev]
        copia.splice(i === -1 ? copia.length : i, 0, original)
        return copia
      })
      return
    }
    setError(null)
  }, [])

  return { tareas, cargando, error, crear, actualizar, borrar, recargar }
}
