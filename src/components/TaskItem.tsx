import { useState, type KeyboardEvent } from 'react'
import type { Tarea } from '../types'

interface Props {
  tarea: Tarea
  onToggle: (id: string, completada: boolean) => void
  onEditar: (id: string, titulo: string) => void
  onBorrar: (id: string) => void
}

export function TaskItem({ tarea, onToggle, onEditar, onBorrar }: Props) {
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(tarea.titulo)

  function empezarEdicion() {
    setBorrador(tarea.titulo)
    setEditando(true)
  }

  function guardar() {
    const limpio = borrador.trim()
    if (limpio && limpio !== tarea.titulo) onEditar(tarea.id, limpio)
    setEditando(false)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') guardar()
    if (e.key === 'Escape') setEditando(false)
  }

  return (
    <li className={`task-item${tarea.completada ? ' done' : ''}`}>
      <input
        type="checkbox"
        checked={tarea.completada}
        onChange={(e) => onToggle(tarea.id, e.target.checked)}
        aria-label={tarea.completada ? 'Marcar como faltante' : 'Marcar como completada'}
      />

      {editando ? (
        <input
          className="edit-input"
          type="text"
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          onKeyDown={handleKey}
          onBlur={guardar}
          maxLength={500}
          aria-label="Editar tarea"
          autoFocus
        />
      ) : (
        <span className="titulo" onDoubleClick={empezarEdicion}>
          {tarea.titulo}
        </span>
      )}

      <div className="acciones">
        {editando ? (
          // onMouseDown evita que el blur del input se dispare antes del click.
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={guardar}>
            Guardar
          </button>
        ) : (
          <button type="button" onClick={empezarEdicion}>
            Editar
          </button>
        )}
        <button type="button" className="borrar" onClick={() => onBorrar(tarea.id)}>
          Borrar
        </button>
      </div>
    </li>
  )
}
