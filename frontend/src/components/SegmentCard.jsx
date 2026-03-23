const SEGMENT_LABELS = {
  warmup: 'Oppvarming', interval: 'Intervall', rest: 'Pause', cooldown: 'Nedjogg',
}

const BORDER_COLORS = {
  warmup: 'border-l-blue-400', interval: 'border-l-orange-400',
  rest: 'border-l-green-400', cooldown: 'border-l-purple-400',
}

function formatDuration(seg) {
  if (seg.durationType === 'lap') return 'Til Lap'
  if (seg.durationType === 'distance') return `${(seg.duration / 1000).toFixed(1)} km`
  const mins = Math.floor(seg.duration / 60)
  const secs = seg.duration % 60
  return secs > 0 ? `${mins}:${String(secs).padStart(2, '0')} min` : `${mins} min`
}

export default function SegmentCard({ segment, onDelete, onEdit }) {
  const label = SEGMENT_LABELS[segment.type] || segment.type
  const border = BORDER_COLORS[segment.type] || 'border-l-gray-300'
  const repeatLabel = segment.type === 'interval' && segment.repeat > 1
    ? ` ×${segment.repeat}` : ''

  return (
    <div className={`flex items-center gap-3 bg-white border border-gray-100 border-l-4 ${border} rounded-xl px-4 py-3`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}{repeatLabel}</p>
        <p className="text-xs text-gray-400">{formatDuration(segment)}</p>
      </div>
      <button onClick={onEdit} className="text-gray-300 hover:text-gray-600 text-xs px-2 py-1">Rediger</button>
      <button onClick={onDelete} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
    </div>
  )
}
