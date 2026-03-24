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
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📚</div>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>Ingen lagrede økter ennå.</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Bygg en økt og aktiver "Lagre i bibliotek".</p>
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                {w.name || 'Uten navn'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, letterSpacing: '0.02em' }}>
                {segmentSummary(w.segments)}
              </div>
            </div>
            <button
              onClick={() => onDelete(w.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 20, cursor: 'pointer', padding: '0 0 0 8px', lineHeight: 1, flexShrink: 0 }}
            >
              ×
            </button>
          </div>
          <WorkoutDiagram segments={w.segments} />
          <button
            onClick={() => onLoad(w)}
            style={{
              marginTop: 12,
              width: '100%',
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
        </div>
      ))}
    </div>
  )
}
