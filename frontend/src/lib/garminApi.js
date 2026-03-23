// Set this to your Render URL after deploying
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function wakeBackend() {
  try {
    await fetch(`${API_BASE}/health`)
  } catch {
    // Silently ignore — backend will wake up eventually
  }
}

export async function pushWorkout({ garminEmail, garminPassword, workout }) {
  const res = await fetch(`${API_BASE}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ garminEmail, garminPassword, workout }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Push failed')
  return data
}
