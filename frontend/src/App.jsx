import { useState, useEffect } from 'react'
import Builder from './pages/Builder'
import Library from './pages/Library'
import History from './pages/History'
import Settings from './components/Settings'
import { useWorkouts } from './hooks/useWorkouts'
import { wakeBackend } from './lib/garminApi'

const TABS = ['build', 'library', 'history']
const TAB_LABELS = { build: 'Bygg', library: 'Bibliotek', history: 'Historikk' }

function IconBuild({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-3)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="4" x2="12" y2="20"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
    </svg>
  )
}

function IconLibrary({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-3)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

function IconHistory({ active }) {
  const c = active ? 'var(--accent)' : 'var(--text-3)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15.5 14"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

const TAB_ICONS = { build: IconBuild, library: IconLibrary, history: IconHistory }

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
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: 'calc(env(safe-area-inset-top, 44px) + 8px)',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 12,
        background: 'var(--bg)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
          lineHeight: 1,
        }}>
          {TAB_LABELS[tab]}
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', lineHeight: 0, borderRadius: 8 }}
        >
          <IconSettings />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'build' && (
          <Builder key={loadedWorkout?.id} initialWorkout={loadedWorkout} onSaved={handleSaved} />
        )}
        {tab === 'library' && (
          <Library workouts={library} onLoad={handleLoad} onDelete={removeFromLibrary} />
        )}
        {tab === 'history' && (
          <History workouts={history} onLoad={handleLoad} onAddToLibrary={addToLibrary} />
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--text-3)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>
        {TABS.map(t => {
          const Icon = TAB_ICONS[t]
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 6,
                gap: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon active={active} />
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: active ? 'var(--accent)' : 'var(--text-3)',
              }}>
                {TAB_LABELS[t]}
              </span>
              {active && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 0 }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
