import { parseQuickInput } from './parseQuickInput'

test('6x6min p:60sek', () => {
  const result = parseQuickInput('6x6min p:60sek')
  expect(result.error).toBeUndefined()
  expect(result.segments[0]).toMatchObject({ type: 'interval', durationType: 'time', duration: 360, repeat: 6 })
  expect(result.segments[1]).toMatchObject({ type: 'rest', durationType: 'time', duration: 60 })
  expect(result.needsWarmupCooldown).toBe(true)
})

test('4x4min p:3min', () => {
  const result = parseQuickInput('4x4min p:3min')
  expect(result.segments[0]).toMatchObject({ repeat: 4, duration: 240 })
  expect(result.segments[1]).toMatchObject({ duration: 180 })
})

test('5x1km p:2min', () => {
  const result = parseQuickInput('5x1km p:2min')
  expect(result.segments[0]).toMatchObject({ durationType: 'distance', duration: 1000, repeat: 5 })
  expect(result.segments[1]).toMatchObject({ durationType: 'time', duration: 120 })
})

test('interval with no rest', () => {
  const result = parseQuickInput('3x8min')
  expect(result.segments).toHaveLength(1)
  expect(result.segments[0]).toMatchObject({ repeat: 3, duration: 480 })
})

test('single interval terskel', () => {
  const result = parseQuickInput('20min terskel')
  expect(result.segments[0]).toMatchObject({ type: 'interval', duration: 1200, repeat: 1 })
})

test('invalid input returns error', () => {
  const result = parseQuickInput('abc123')
  expect(result.error).toBeTruthy()
})

test('unrecognised unit returns error', () => {
  const result = parseQuickInput('6x6s p:60s')
  expect(result.error).toBeTruthy()
})
