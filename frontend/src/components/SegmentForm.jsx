import { useState } from 'react'

const SEGMENT_TYPES = [
  { value: 'warmup', label: 'Oppvarming', color: 'var(--warmup)' },
  { value: 'interval', label: 'Intervall', color: 'var(--interval)' },
  { value: 'rest', label: 'Pause', color: 'var(--rest)' },
  { value: 'cooldown', label: 'Nedjogg', color: 'var(--cooldown)' },
]

const empty = () => ({
  type: 'interval', durationType: 'time', durationMins: '', durationSecs: '',
  durationKm: '', repeat: '1', untilLap: false, hrZone: '', paceTarget: '',
})

function toSeconds(mins, secs) {
  return (parseInt(mins || 0) * 60) + parseInt(secs || 0)
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--text-3)',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-2)',
  marginBottom: 6,
  fontFamily: 'var(--font-display)',
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
    if (form.paceTarget) {
      if (/^\d+:\d{2}$/.test(form.paceTarget)) {
        seg.paceTarget = form.paceTarget
      }
    }
    onSave(seg)
  }

  const canSave = form.untilLap ||
    (form.durationType === 'distance' && parseFloat(form.durationKm) > 0) ||
    (form.durationType === 'time' && toSeconds(form.durationMins, form.durationSecs) > 0)

  const activeType = SEGMENT_TYPES.find(t => t.value === form.type)

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: 480,
          padding: '24px 24px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 24px)',
          borderTop: '1px solid var(--text-3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--text-3)', margin: '0 auto 20px' }} />

        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22,
          color: activeType?.color || 'var(--text)',
          letterSpacing: '-0.01em', marginBottom: 20,
          transition: 'color 0.15s',
        }}>
          Segment
        </div>

        {/* Type picker */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {SEGMENT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => set('type', t.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: `1.5px solid ${form.type === t.value ? t.color : 'var(--text-3)'}`,
                background: form.type === t.value ? `${t.color}18` : 'transparent',
                color: form.type === t.value ? t.color : 'var(--text-2)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Lap toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
          <div
            onClick={() => set('untilLap', !form.untilLap)}
            style={{
              width: 20, height: 20, borderRadius: 6,
              background: form.untilLap ? 'var(--accent)' : 'var(--surface-2)',
              border: form.untilLap ? 'none' : '1.5px solid var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            {form.untilLap && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <polyline points="2 6 5 9 10 3" stroke="#0C0C0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Til Lap (åpen varighet)</span>
        </label>

        {!form.untilLap && (
          <>
            {/* Duration type toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['time', 'distance'].map(dt => (
                <button
                  key={dt}
                  onClick={() => set('durationType', dt)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: 10,
                    border: `1.5px solid ${form.durationType === dt ? 'var(--accent-border)' : 'var(--text-3)'}`,
                    background: form.durationType === dt ? 'var(--accent-dim)' : 'transparent',
                    color: form.durationType === dt ? 'var(--accent)' : 'var(--text-2)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {dt === 'time' ? 'Tid' : 'Distanse'}
                </button>
              ))}
            </div>

            {form.durationType === 'time' ? (
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Minutter</label>
                  <input
                    type="number" min="0" value={form.durationMins}
                    onChange={e => set('durationMins', e.target.value)}
                    style={inputStyle} placeholder="0"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Sekunder</label>
                  <input
                    type="number" min="0" max="59" value={form.durationSecs}
                    onChange={e => set('durationSecs', e.target.value)}
                    style={inputStyle} placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Kilometer</label>
                <input
                  type="number" min="0" step="0.1" value={form.durationKm}
                  onChange={e => set('durationKm', e.target.value)}
                  style={inputStyle} placeholder="1.0"
                />
              </div>
            )}
          </>
        )}

        {/* Repeat (interval only) */}
        {form.type === 'interval' && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Repetisjoner</label>
            <input
              type="number" min="1" value={form.repeat}
              onChange={e => set('repeat', e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {/* Advanced */}
        <details style={{ marginBottom: 20 }}>
          <summary style={{
            fontSize: 11, color: 'var(--text-2)', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            userSelect: 'none',
          }}>
            Avansert (pulssone / pace)
          </summary>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pulssone (1–5)</label>
              <input
                type="number" min="1" max="5" value={form.hrZone}
                onChange={e => set('hrZone', e.target.value)}
                style={inputStyle} placeholder="—"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pace (mm:ss/km)</label>
              <input
                type="text" value={form.paceTarget}
                onChange={e => set('paceTarget', e.target.value)}
                style={inputStyle} placeholder="4:30"
              />
            </div>
          </div>
        </details>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px',
              borderRadius: 14,
              border: '1px solid var(--text-3)',
              background: 'transparent',
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: 14,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text-2)', cursor: 'pointer',
            }}
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 2, padding: '13px',
              borderRadius: 14,
              border: 'none',
              background: 'var(--accent)',
              color: '#0C0C0E',
              fontFamily: 'var(--font-display)',
              fontWeight: 900, fontSize: 16,
              letterSpacing: '0.04em',
              cursor: canSave ? 'pointer' : 'default',
              opacity: canSave ? 1 : 0.35,
              transition: 'opacity 0.15s',
            }}
          >
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
