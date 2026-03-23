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

export default function Settings({ onClose }) {
  const creds = useGarminCreds()
  const [email, setEmail] = useState(creds.email)
  const [password, setPassword] = useState(creds.password)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    creds.save(email, password)
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-1">Innstillinger</h3>
        <p className="text-xs text-gray-400 mb-5">Garmin Connect-innlogging lagres lokalt på enheten.</p>

        <div className="mb-3">
          <label className="text-xs font-medium text-gray-500 mb-1 block">E-post</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            placeholder="din@epost.no" />
        </div>
        <div className="mb-6">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Passord</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
            placeholder="••••••••" />
        </div>

        <button onClick={handleSave} disabled={!email || !password}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 transition-colors">
          {saved ? '✓ Lagret' : 'Lagre'}
        </button>
      </div>
    </div>
  )
}
