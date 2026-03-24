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
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>🕐</div>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>Ingen historikk ennå.</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Send din første økt til Garmin.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {workouts.map(w => (
        <div
          key={w.id}
          className="fade-up"
          style={{
            background: 'var(--surface)',
            borderRadius: 16,
            padding: '14px 16px',
            border: '1px solid var(--text-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {w.name || 'Uten navn'}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)',
              color: 'var(--text-2)',
              background: 'var(--surface-2)',
              padding: '3px 8px',
              borderRadius: 6,
            }}>
              {formatDate(w.sentAt)}
            </span>
          </div>
          <WorkoutDiagram segments={w.segments} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => onLoad(w)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 10,
                border: '1px solid var(--text-3)',
                background: 'transparent',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              Last inn →
            </button>
            <button
              onClick={() => onAddToLibrary(w)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--text-3)',
                background: 'transparent',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              + Lib
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
