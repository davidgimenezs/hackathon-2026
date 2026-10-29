import { useState, type FormEvent } from 'react'

interface Props {
  onCrear: (titulo: string) => Promise<void>
}

export function TaskForm({ onCrear }: Props) {
  const [titulo, setTitulo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const limpio = titulo.trim()
    if (!limpio || enviando) return
    setEnviando(true)
    try {
      await onCrear(limpio)
      setTitulo('')
    } catch {
      // El hook ya muestra el error; se conserva el texto para reintentar.
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="¿Qué hay que hacer?"
        aria-label="Nueva tarea"
        maxLength={500}
        disabled={enviando}
      />
      <button type="submit" disabled={!titulo.trim() || enviando}>
        {enviando ? 'Agregando…' : 'Agregar'}
      </button>
    </form>
  )
}
