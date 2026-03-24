const COLORS = {
  warmup: '#60A5FA',
  interval: '#FB923C',
  rest: '#4ADE80',
  cooldown: '#C084FC',
}

const LABELS = {
  warmup: 'Oppvarming',
  interval: 'Intervall',
  rest: 'Pause',
  cooldown: 'Nedjogg',
}

function formatDuration(seg) {
  if (seg.durationType === 'lap') return 'Til Lap'
  if (seg.durationType === 'distance') return `${(seg.duration / 1000).toFixed(1)} km`
  const mins = Math.floor(seg.duration / 60)
  const secs = seg.duration % 60
  return secs > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${mins} min`
}

export default function SegmentCard({ segment, onDelete, onEdit }) {
  const color = COLORS[segment.type] || '#666'
  const label = LABELS[segment.type] || segment.type
  const repeatLabel = segment.type === 'interval' && segment.repeat > 1 ? ` ×${segment.repeat}` : ''

  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: '11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: color,
          marginBottom: 1,
        }}>
          {label}{repeatLabel}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--text)',
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}>
          {formatDuration(segment)}
        </div>
      </div>
      <button
        onClick={onEdit}
        style={{
          background: 'var(--surface-2)',
          border: 'none',
          borderRadius: 7,
          padding: '5px 10px',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-2)',
          cursor: 'pointer',
        }}
      >
        Rediger
      </button>
      <button
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-3)',
          fontSize: 22,
          lineHeight: 1,
          cursor: 'pointer',
          padding: '0 2px',
        }}
      >
        ×
      </button>
    </div>
  )
}
