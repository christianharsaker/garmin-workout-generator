import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const LIBRARY_KEY = 'gwg_library'
const HISTORY_KEY = 'gwg_history'

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') }
  catch { return [] }
}

function persist(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function useWorkouts() {
  const [library, setLibrary] = useState(() => load(LIBRARY_KEY))
  const [history, setHistory] = useState(() => load(HISTORY_KEY))

  function addToLibrary(workout) {
    const entry = { ...workout, id: workout.id || uuidv4() }
    setLibrary(prev => {
      const updated = [entry, ...prev.filter(w => w.id !== entry.id)]
      persist(LIBRARY_KEY, updated)
      return updated
    })
  }

  function removeFromLibrary(id) {
    setLibrary(prev => {
      const updated = prev.filter(w => w.id !== id)
      persist(LIBRARY_KEY, updated)
      return updated
    })
  }

  function addToHistory(workout) {
    const entry = { ...workout, id: uuidv4(), sentAt: new Date().toISOString() }
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 50)
      persist(HISTORY_KEY, updated)
      return updated
    })
    return entry
  }

  return { library, history, addToLibrary, removeFromLibrary, addToHistory }
}
