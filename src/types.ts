export interface Tarea {
  id: string
  titulo: string
  completada: boolean
  fecha_creacion: string
}

export type Filtro = 'todas' | 'faltantes' | 'completadas'
