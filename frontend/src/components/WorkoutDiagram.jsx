const SEGMENT_COLORS = {
  warmup:   'bg-blue-400',
  interval: 'bg-orange-400',
  rest:     'bg-green-400',
  cooldown: 'bg-purple-400',
}

const LAP_WEIGHT = 0.15  // lap segments get 15% of total width each

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
    const color = SEGMENT_COLORS[seg.type] || 'bg-gray-300'
    if (seg.durationType === 'lap') {
      return [{ color, flex: LAP_WEIGHT, label: seg.type === 'warmup' ? 'Oppv' : 'Nedj' }]
    }
    if (seg.type === 'interval' && seg.repeat > 1) {
      // Show alternating interval + rest blocks if there are many repeats, else one block
      return Array.from({ length: seg.repeat }, (_, i) => ({
        color,
        flex: seg.duration,
        label: i === 0 ? `×${seg.repeat}` : '',
      }))
    }
    return [{ color, flex: seg.duration || 0, label: '' }]
  })

  return (
    <div className="w-full rounded-lg overflow-hidden flex h-8 gap-0.5">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`${bar.color} flex items-center justify-center text-white text-[9px] font-bold overflow-hidden`}
          style={{ flex: bar.flex / total }}
          title={bar.label}
        >
          {bar.label}
        </div>
      ))}
    </div>
  )
}
