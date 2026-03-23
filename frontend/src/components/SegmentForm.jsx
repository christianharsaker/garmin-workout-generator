import { useState } from 'react'

const SEGMENT_TYPES = [
  { value: 'warmup', label: 'Oppvarming' },
  { value: 'interval', label: 'Intervall' },
  { value: 'rest', label: 'Pause' },
  { value: 'cooldown', label: 'Nedjogg' },
]

const empty = () => ({
  type: 'interval', durationType: 'time', durationMins: '', durationSecs: '',
  durationKm: '', repeat: '1', untilLap: false, hrZone: '', paceTarget: '',
})

function toSeconds(mins, secs) {
  return (parseInt(mins || 0) * 60) + parseInt(secs || 0)
}

export default function SegmentForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? segmentToForm(initial) : empty())

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleSave() {
    const seg = { type: form.type }
    if (form.untilLap) {
      seg.durationType = 'lap'
    } else if (form.durationType === 'distance') {
      seg.durationType = 'distance'
      seg.duration = parseFloat(form.durationKm || 0) * 1000
    } else {
      seg.durationType = 'time'
      seg.duration = toSeconds(form.durationMins, form.durationSecs)
    }
    if (form.type === 'interval') seg.repeat = parseInt(form.repeat || 1)
    if (form.hrZone) seg.hrZone = parseInt(form.hrZone)
    if (form.paceTarget) seg.paceTarget = form.paceTarget
    onSave(seg)
  }

  const canSave = form.untilLap ||
    (form.durationType === 'distance' && parseFloat(form.durationKm) > 0) ||
    (form.durationType === 'time' && toSeconds(form.durationMins, form.durationSecs) > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-4">Segment</h3>

        {/* Type */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {SEGMENT_TYPES.map(t => (
            <button key={t.value} onClick={() => set('type', t.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${form.type === t.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Lap toggle */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={form.untilLap} onChange={e => set('untilLap', e.target.checked)} className="w-4 h-4" />
          <span className="text-sm text-gray-700">Til Lap (åpen varighet)</span>
        </label>

        {!form.untilLap && (
          <>
            {/* Duration type */}
            <div className="flex gap-2 mb-3">
              <button onClick={() => set('durationType', 'time')}
                className={`flex-1 py-1.5 rounded-lg text-sm border ${form.durationType === 'time' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
                Tid
              </button>
              <button onClick={() => set('durationType', 'distance')}
                className={`flex-1 py-1.5 rounded-lg text-sm border ${form.durationType === 'distance' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>
                Distanse
              </button>
            </div>

            {form.durationType === 'time' ? (
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Minutter</label>
                  <input type="number" min="0" value={form.durationMins} onChange={e => set('durationMins', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Sekunder</label>
                  <input type="number" min="0" max="59" value={form.durationSecs} onChange={e => set('durationSecs', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Kilometer</label>
                <input type="number" min="0" step="0.1" value={form.durationKm} onChange={e => set('durationKm', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="1.0" />
              </div>
            )}
          </>
        )}

        {/* Repeat (interval only) */}
        {form.type === 'interval' && (
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">Repetisjoner</label>
            <input type="number" min="1" value={form.repeat} onChange={e => set('repeat', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        )}

        {/* Advanced */}
        <details className="mb-4">
          <summary className="text-xs text-gray-400 cursor-pointer">Avansert (pulssone / pace)</summary>
          <div className="mt-2 flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Pulssone (1–5)</label>
              <input type="number" min="1" max="5" value={form.hrZone} onChange={e => set('hrZone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="—" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Pace (mm:ss/km)</label>
              <input type="text" value={form.paceTarget} onChange={e => set('paceTarget', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="4:30" />
            </div>
          </div>
        </details>

        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500">Avbryt</button>
          <button onClick={handleSave} disabled={!canSave}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40">
            Lagre
          </button>
        </div>
      </div>
    </div>
  )
}

function segmentToForm(seg) {
  const f = empty()
  f.type = seg.type
  f.untilLap = seg.durationType === 'lap'
  if (seg.durationType === 'time') {
    f.durationType = 'time'
    f.durationMins = String(Math.floor(seg.duration / 60))
    f.durationSecs = String(seg.duration % 60)
  } else if (seg.durationType === 'distance') {
    f.durationType = 'distance'
    f.durationKm = String(seg.duration / 1000)
  }
  if (seg.repeat) f.repeat = String(seg.repeat)
  if (seg.hrZone) f.hrZone = String(seg.hrZone)
  if (seg.paceTarget) f.paceTarget = seg.paceTarget
  return f
}
