import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import SegmentCard from '../components/SegmentCard'
import SegmentForm from '../components/SegmentForm'
import WorkoutDiagram from '../components/WorkoutDiagram'
import { parseQuickInput } from '../lib/parseQuickInput'
import { pushWorkout } from '../lib/garminApi'
import { useGarminCreds } from '../components/Settings'

const DEFAULT_WARMUP = { type: 'warmup', durationType: 'lap' }
const DEFAULT_COOLDOWN = { type: 'cooldown', durationType: 'lap' }

export default function Builder({ onSaved, initialWorkout }) {
  const [segments, setSegments] = useState(initialWorkout?.segments || [])
  const [name, setName] = useState(initialWorkout?.name || '')
  const [quickInput, setQuickInput] = useState('')
  const [quickError, setQuickError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [addToLib, setAddToLib] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [pushResult, setPushResult] = useState(null)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaInput, setMfaInput] = useState('')
  const [pendingSessionId, setPendingSessionId] = useState(null)
  const [pendingWorkout, setPendingWorkout] = useState(null)
  const creds = useGarminCreds()

  function handleQuickParse() {
    const result = parseQuickInput(quickInput)
    if (result.error) { setQuickError(result.error); return }
    setQuickError('')
    const newSegs = [DEFAULT_WARMUP, ...result.segments, DEFAULT_COOLDOWN].map(s => ({
      ...s, _id: uuidv4()
    }))
    setSegments(newSegs)
    setQuickInput('')
    if (!name) setName(quickInput.trim())
  }

  function handleSaveSegment(seg) {
    if (editIndex !== null) {
      setSegments(prev => prev.map((s, i) => i === editIndex ? seg : s))
      setEditIndex(null)
    } else {
      setSegments(prev => [...prev, { ...seg, _id: uuidv4() }])
    }
    setShowForm(false)
  }

  function deleteSegment(i) {
    setSegments(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handlePush(mfaCode = null, sessionId = null) {
    if (segments.length === 0) return
    if (!creds.email || !creds.password) {
      setPushResult({ error: 'Ingen Garmin-innlogging. Åpne Innstillinger.' })
      return
    }
    const workout = pendingWorkout || { id: uuidv4(), name: name || 'Treningsøkt', segments }
    setPushing(true)
    setPushResult(null)
    try {
      const data = await pushWorkout({
        garminEmail: creds.email, garminPassword: creds.password,
        workout, mfaCode, sessionId,
      })
      if (data.status === 'mfa_required') {
        setPendingSessionId(data.sessionId)
        setPendingWorkout(workout)
        setMfaRequired(true)
        return
      }
      setPushResult({ ok: true })
      setMfaRequired(false)
      setPendingSessionId(null)
      setPendingWorkout(null)
      setMfaInput('')
      onSaved(workout, addToLib)
    } catch (e) {
      setPushResult({ error: e.message })
    } finally {
      setPushing(false)
    }
  }

  function handleMfaSubmit() {
    handlePush(mfaInput, pendingSessionId)
  }

  return (
    <div style={{ padding: '16px 20px 32px', maxWidth: 480, margin: '0 auto' }}>
      {showForm && (
        <SegmentForm
          initial={editIndex !== null ? segments[editIndex] : null}
          onSave={handleSaveSegment}
          onCancel={() => { setShowForm(false); setEditIndex(null) }}
        />
      )}

      {/* Name */}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Navn på økt"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
          marginBottom: 16,
        }}
      />

      {/* Quick input */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 14,
        padding: '12px 16px',
        marginBottom: 16,
        border: quickError ? '1px solid var(--danger)' : '1px solid var(--text-3)',
        transition: 'border-color 0.15s',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', flexShrink: 0 }}>→</span>
          <input
            value={quickInput}
            onChange={e => { setQuickInput(e.target.value); setQuickError('') }}
            onKeyDown={e => e.key === 'Enter' && handleQuickParse()}
            placeholder='6x6min p:60sek'
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 14,
              color: 'var(--text)',
              letterSpacing: '0.02em',
            }}
          />
          <button
            onClick={handleQuickParse}
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              borderRadius: 8,
              padding: '5px 12px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Parse
          </button>
        </div>
        {quickError && (
          <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 8, paddingLeft: 22 }}>{quickError}</p>
        )}
      </div>

      {/* Diagram */}
      {segments.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <WorkoutDiagram segments={segments} />
        </div>
      )}

      {/* Segments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {segments.map((seg, i) => (
          <SegmentCard
            key={seg._id || i}
            segment={seg}
            onDelete={() => deleteSegment(i)}
            onEdit={() => { setEditIndex(i); setShowForm(true) }}
          />
        ))}
      </div>

      {/* Add segment */}
      <button
        onClick={() => { setEditIndex(null); setShowForm(true) }}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: 12,
          border: '1.5px dashed var(--text-3)',
          background: 'transparent',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-2)',
          cursor: 'pointer',
          marginBottom: 20,
        }}
      >
        + Legg til segment
      </button>

      {segments.length > 0 && (
        <>
          {/* Library toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
            <div
              onClick={() => setAddToLib(!addToLib)}
              style={{
                width: 20, height: 20, borderRadius: 6,
                background: addToLib ? 'var(--accent)' : 'var(--surface-2)',
                border: addToLib ? 'none' : '1.5px solid var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              {addToLib && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="2 6 5 9 10 3" stroke="#0C0C0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Lagre i bibliotek</span>
          </label>

          {/* Feedback */}
          {pushResult?.ok && (
            <div style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 12,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--rest)',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}>
              ✓ Sendt til Garmin Connect
            </div>
          )}
          {pushResult?.error && (
            <div style={{
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 12,
              fontSize: 12,
              color: 'var(--danger)',
              textAlign: 'center',
            }}>
              {pushResult.error}
            </div>
          )}

          {/* MFA */}
          {mfaRequired ? (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--accent-border)',
              borderRadius: 14,
              padding: '16px',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--accent)', marginBottom: 4, letterSpacing: '0.04em' }}>
                Bekreft med engangskode
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14 }}>
                Garmin sendte en kode til din e-post.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={mfaInput}
                  onChange={e => setMfaInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMfaSubmit()}
                  placeholder="123456"
                  autoFocus
                  style={{
                    flex: 1,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 18,
                    letterSpacing: '0.3em',
                    color: 'var(--text)',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleMfaSubmit}
                  disabled={pushing || !mfaInput}
                  style={{
                    padding: '11px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#0C0C0E',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 16,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    opacity: (pushing || !mfaInput) ? 0.4 : 1,
                  }}
                >
                  {pushing ? '...' : 'OK'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handlePush()}
              disabled={pushing}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                border: 'none',
                background: 'var(--accent)',
                color: '#0C0C0E',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: '0.04em',
                cursor: pushing ? 'wait' : 'pointer',
                opacity: pushing ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {pushing ? 'Sender...' : 'Send til Garmin →'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
