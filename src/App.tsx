import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { configError } from './lib/supabase'
import { useTareas } from './useTareas'

function App() {
  if (configError) {
    return (
      <main className="app">
        <h1>Tareas</h1>
        <p className="error">{configError}</p>
      </main>
    )
  }
  return <Tareas />
}

function Tareas() {
  const { tareas, cargando, error, crear, actualizar, borrar, recargar } = useTareas()

  return (
    <main className="app">
      <h1>Tareas</h1>
      <TaskForm onCrear={crear} />

      {error && (
        <p className="error" role="alert">
          {error}{' '}
          <button type="button" onClick={() => void recargar()}>
            Reintentar
          </button>
        </p>
      )}

      {cargando ? (
        <p className="vacio">Cargando…</p>
      ) : (
        <TaskList
          tareas={tareas}
          onToggle={(id, completada) => void actualizar(id, { completada })}
          onEditar={(id, titulo) => void actualizar(id, { titulo })}
          onBorrar={(id) => void borrar(id)}
        />
      )}
    </main>
  )
}

export default App
