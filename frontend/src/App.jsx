import { useState, useEffect } from 'react'
import Builder from './pages/Builder'
import Library from './pages/Library'
import History from './pages/History'
import Settings from './components/Settings'
import { useWorkouts } from './hooks/useWorkouts'
import { wakeBackend } from './lib/garminApi'

const TABS = [
  { id: 'build', label: 'Bygg', icon: '➕' },
  { id: 'library', label: 'Bibliotek', icon: '📚' },
  { id: 'history', label: 'Historikk', icon: '🕐' },
]

export default function App() {
  const [tab, setTab] = useState('build')
  const [showSettings, setShowSettings] = useState(false)
  const [loadedWorkout, setLoadedWorkout] = useState(null)
  const { library, history, addToLibrary, removeFromLibrary, addToHistory } = useWorkouts()

  useEffect(() => { wakeBackend() }, [])

  function handleSaved(workout, addToLib) {
    addToHistory(workout)
    if (addToLib) addToLibrary(workout)
  }

  function handleLoad(workout) {
    setTab('build')
    setLoadedWorkout(workout)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 bg-white border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-900">
          {TABS.find(t => t.id === tab)?.label}
        </h1>
        <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-gray-700 text-xl">⚙️</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'build' && (
          <Builder
            key={loadedWorkout?.id}
            initialWorkout={loadedWorkout}
            onSaved={handleSaved}
          />
        )}
        {tab === 'library' && (
          <Library workouts={library} onLoad={handleLoad} onDelete={removeFromLibrary} />
        )}
        {tab === 'history' && (
          <History workouts={history} onLoad={handleLoad} onAddToLibrary={addToLibrary} />
        )}
      </div>

      {/* Tab bar */}
      <div className="bg-white border-t border-gray-100 flex pb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 transition-colors
              ${tab === t.id ? 'text-gray-900' : 'text-gray-300'}`}>
            <span className="text-xl">{t.icon}</span>
            <span className={`text-[10px] font-medium ${tab === t.id ? 'text-gray-900' : 'text-gray-400'}`}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
