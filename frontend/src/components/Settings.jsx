import { useState } from 'react'

const EMAIL_KEY = 'gwg_garmin_email'
const PASS_KEY = 'gwg_garmin_password'

export function useGarminCreds() {
  return {
    email: localStorage.getItem(EMAIL_KEY) || '',
    password: localStorage.getItem(PASS_KEY) || '',
    save(email, password) {
      localStorage.setItem(EMAIL_KEY, email)
      localStorage.setItem(PASS_KEY, password)
    },
  }
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--text-3)',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-2)',
  marginBottom: 6,
  fontFamily: 'var(--font-display)',
}

export default function Settings({ onClose }) {
  const creds = useGarminCreds()
  const [email, setEmail] = useState(creds.email)
  const [password, setPassword] = useState(creds.password)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    creds.save(email, password)
    setSaved(true)
    setTimeout(onClose, 900)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
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
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--text-3)',
          margin: '0 auto 20px',
        }} />

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.01em' }}>
          Innstillinger
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 24 }}>
          Garmin-innlogging lagres lokalt på enheten.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>E-post</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="din@epost.no"
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Passord</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!email || !password}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            background: saved ? 'var(--rest)' : 'var(--accent)',
            color: '#0C0C0E',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            opacity: (!email || !password) ? 0.4 : 1,
            transition: 'background 0.2s, opacity 0.2s',
          }}
        >
          {saved ? '✓ Lagret' : 'Lagre'}
        </button>
      </div>
    </div>
  )
}
