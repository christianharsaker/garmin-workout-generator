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
    <div className="px-4 py-5 max-w-lg mx-auto">
      {showForm && (
        <SegmentForm
          initial={editIndex !== null ? segments[editIndex] : null}
          onSave={handleSaveSegment}
          onCancel={() => { setShowForm(false); setEditIndex(null) }}
        />
      )}

      {/* Name */}
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="Navn på økt (valgfritt)"
        className="w-full text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none mb-4 bg-transparent"
      />

      {/* Quick input */}
      <div className="bg-gray-50 rounded-2xl p-3 mb-4">
        <div className="flex gap-2">
          <input
            value={quickInput} onChange={e => { setQuickInput(e.target.value); setQuickError('') }}
            onKeyDown={e => e.key === 'Enter' && handleQuickParse()}
            placeholder='F.eks. "6x6min p:60sek"'
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          <button onClick={handleQuickParse} className="text-sm font-semibold text-gray-900 px-3 py-1.5 rounded-xl bg-white border border-gray-200">
            ⚡ Parse
          </button>
        </div>
        {quickError && <p className="text-xs text-red-500 mt-1.5">{quickError}</p>}
      </div>

      {/* Diagram */}
      {segments.length > 0 && (
        <div className="mb-4">
          <WorkoutDiagram segments={segments} />
        </div>
      )}

      {/* Segments */}
      <div className="flex flex-col gap-2 mb-3">
        {segments.map((seg, i) => (
          <SegmentCard
            key={seg._id || i} segment={seg}
            onDelete={() => deleteSegment(i)}
            onEdit={() => { setEditIndex(i); setShowForm(true) }}
          />
        ))}
      </div>

      <button onClick={() => { setEditIndex(null); setShowForm(true) }}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 font-medium mb-5">
        + Legg til segment
      </button>

      {segments.length > 0 && (
        <>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={addToLib} onChange={e => setAddToLib(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-gray-600">Legg til bibliotek</span>
          </label>

          {pushResult?.ok && (
            <p className="text-sm text-green-600 font-medium mb-3 text-center">✓ Sendt til Garmin!</p>
          )}
          {pushResult?.error && (
            <p className="text-sm text-red-500 mb-3 text-center">{pushResult.error}</p>
          )}

          {mfaRequired ? (
            <div className="bg-gray-50 rounded-2xl p-4 mb-2">
              <p className="text-sm font-semibold text-gray-900 mb-1">Bekreft med engangskode</p>
              <p className="text-xs text-gray-400 mb-3">Garmin sendte en kode til din e-post.</p>
              <div className="flex gap-2">
                <input
                  type="text" inputMode="numeric" value={mfaInput}
                  onChange={e => setMfaInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMfaSubmit()}
                  placeholder="123456"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center tracking-widest"
                  autoFocus
                />
                <button onClick={handleMfaSubmit} disabled={pushing || !mfaInput}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-50">
                  {pushing ? '...' : 'OK'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => handlePush()} disabled={pushing}
              className="w-full py-3.5 rounded-2xl bg-gray-900 text-white text-base font-semibold disabled:opacity-50">
              {pushing ? 'Sender...' : 'Send til Garmin 🏃'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
