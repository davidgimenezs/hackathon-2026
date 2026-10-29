import { useState } from 'react'
import type { Filtro, Tarea } from '../types'
import { TaskItem } from './TaskItem'

interface Props {
  tareas: Tarea[]
  onToggle: (id: string, completada: boolean) => void
  onEditar: (id: string, titulo: string) => void
  onBorrar: (id: string) => void
}

const ETIQUETAS: Record<Filtro, string> = {
  todas: 'Todas',
  faltantes: 'Faltantes',
  completadas: 'Completadas',
}

export function TaskList({ tareas, onToggle, onEditar, onBorrar }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todas')

  // Las listas y sus conteos salen del mismo array, así el número siempre coincide con lo que se ve.
  const listas: Record<Filtro, Tarea[]> = {
    todas: tareas,
    faltantes: tareas.filter((t) => !t.completada),
    completadas: tareas.filter((t) => t.completada),
  }
  const visibles = listas[filtro]

  return (
    <section>
      <div className="filtros" role="tablist">
        {(Object.keys(ETIQUETAS) as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filtro === f}
            className={filtro === f ? 'activo' : ''}
            onClick={() => setFiltro(f)}
          >
            {ETIQUETAS[f]} ({listas[f].length})
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">
          {filtro === 'todas' ? 'No hay tareas todavía.' : `No hay tareas ${ETIQUETAS[filtro].toLowerCase()}.`}
        </p>
      ) : (
        <ul className="task-list">
          {visibles.map((t) => (
            <TaskItem key={t.id} tarea={t} onToggle={onToggle} onEditar={onEditar} onBorrar={onBorrar} />
          ))}
        </ul>
      )}
    </section>
  )
}
