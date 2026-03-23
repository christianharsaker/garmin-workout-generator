import { renderHook, act } from '@testing-library/react'
import { useWorkouts } from './useWorkouts'

beforeEach(() => localStorage.clear())

test('library starts empty', () => {
  const { result } = renderHook(() => useWorkouts())
  expect(result.current.library).toEqual([])
})

test('addToLibrary adds workout and persists', () => {
  const { result } = renderHook(() => useWorkouts())
  act(() => result.current.addToLibrary({ id: '1', name: 'Test', segments: [] }))
  expect(result.current.library).toHaveLength(1)
  expect(result.current.library[0].name).toBe('Test')
  expect(localStorage.getItem('gwg_library')).toContain('Test')
})

test('addToLibrary deduplicates by id', () => {
  const { result } = renderHook(() => useWorkouts())
  act(() => result.current.addToLibrary({ id: '1', name: 'First', segments: [] }))
  act(() => result.current.addToLibrary({ id: '1', name: 'Updated', segments: [] }))
  expect(result.current.library).toHaveLength(1)
  expect(result.current.library[0].name).toBe('Updated')
})

test('removeFromLibrary removes by id', () => {
  const { result } = renderHook(() => useWorkouts())
  act(() => result.current.addToLibrary({ id: '1', name: 'A', segments: [] }))
  act(() => result.current.removeFromLibrary('1'))
  expect(result.current.library).toHaveLength(0)
})

test('addToHistory prepends and caps at 50', () => {
  const { result } = renderHook(() => useWorkouts())
  for (let i = 0; i < 55; i++) {
    act(() => result.current.addToHistory({ name: `W${i}`, segments: [] }))
  }
  expect(result.current.history).toHaveLength(50)
  expect(result.current.history[0].name).toBe('W54')
})
