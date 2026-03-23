import WorkoutDiagram from '../components/WorkoutDiagram'

function formatDate(iso) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'I dag'
  return d.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })
}

export default function History({ workouts, onLoad, onAddToLibrary }) {
  if (workouts.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-gray-400 text-sm">Ingen historikk ennå.</p>
        <p className="text-gray-300 text-xs mt-1">Send din første økt til Garmin.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-3">
      {workouts.map(w => (
        <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-gray-900">{w.name || 'Uten navn'}</p>
            <span className="text-xs text-gray-400">{formatDate(w.sentAt)}</span>
          </div>
          <WorkoutDiagram segments={w.segments} />
          <div className="flex gap-2 mt-3">
            <button onClick={() => onLoad(w)}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Last inn
            </button>
            <button onClick={() => onAddToLibrary(w)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
              + Bibliotek
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
