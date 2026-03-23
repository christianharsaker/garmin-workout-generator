import WorkoutDiagram from '../components/WorkoutDiagram'

function segmentSummary(segments) {
  return segments.map(s => {
    if (s.type === 'warmup') return 'Oppv'
    if (s.type === 'cooldown') return 'Nedj'
    if (s.type === 'rest') return `P ${s.durationType === 'time' ? Math.round(s.duration/60)+'min' : (s.duration/1000)+'km'}`
    if (s.type === 'interval') {
      const dur = s.durationType === 'lap' ? 'Lap' : s.durationType === 'time' ? Math.round(s.duration/60)+'min' : (s.duration/1000)+'km'
      return s.repeat > 1 ? `${s.repeat}×${dur}` : dur
    }
    return ''
  }).filter(Boolean).join(' · ')
}

export default function Library({ workouts, onLoad, onDelete }) {
  if (workouts.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-gray-400 text-sm">Ingen lagrede økter ennå.</p>
        <p className="text-gray-300 text-xs mt-1">Bygg en økt og kryss av "Legg til bibliotek".</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-3">
      {workouts.map(w => (
        <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-gray-900">{w.name || 'Uten navn'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{segmentSummary(w.segments)}</p>
            </div>
            <button onClick={() => onDelete(w.id)} className="text-gray-200 hover:text-red-400 text-lg ml-2">×</button>
          </div>
          <WorkoutDiagram segments={w.segments} />
          <button onClick={() => onLoad(w)}
            className="mt-3 w-full py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Last inn i byggeren
          </button>
        </div>
      ))}
    </div>
  )
}
