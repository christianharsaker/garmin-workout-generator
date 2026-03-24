const COLORS = {
  warmup:   '#60A5FA',
  interval: '#FB923C',
  rest:     '#4ADE80',
  cooldown: '#C084FC',
}

const LABELS = {
  warmup: 'Oppv', interval: 'Int', rest: 'Pause', cooldown: 'Nedj',
}

const LAP_WEIGHT = 0.15

function totalWeight(segments) {
  return segments.reduce((acc, seg) => {
    if (seg.durationType === 'lap') return acc + LAP_WEIGHT
    const effective = seg.type === 'interval'
      ? seg.duration * (seg.repeat || 1)
      : seg.duration || 0
    return acc + effective
  }, 0)
}

export default function WorkoutDiagram({ segments }) {
  if (!segments || segments.length === 0) return null
  const total = totalWeight(segments)
  if (total === 0) return null

  const bars = segments.flatMap(seg => {
    const color = COLORS[seg.type] || '#555'
    if (seg.durationType === 'lap') {
      return [{ color, flex: LAP_WEIGHT, label: LABELS[seg.type] || seg.type, dim: false }]
    }
    if (seg.type === 'interval' && seg.repeat > 1) {
      return Array.from({ length: seg.repeat }, (_, i) => ({
        color, flex: seg.duration,
        label: i === 0 ? `×${seg.repeat}` : '',
        dim: i % 2 !== 0,
      }))
    }
    return [{ color, flex: seg.duration || 0, label: LABELS[seg.type] || '', dim: false }]
  })

  return (
    <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden', display: 'flex', height: 52, gap: 2 }}>
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            flex: bar.flex / total,
            background: bar.color,
            opacity: bar.dim ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {bar.label && (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 11,
              color: 'rgba(0,0,0,0.65)',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'clip',
            }}>
              {bar.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
