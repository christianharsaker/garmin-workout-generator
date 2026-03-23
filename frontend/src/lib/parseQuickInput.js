function toDuration(val, unit) {
  const n = parseInt(val, 10)
  if (unit === 'min') return n * 60
  if (unit === 'sek') return n
  if (unit === 'km') return n * 1000
  return null
}

function unitToDurationType(unit) {
  return unit === 'km' ? 'distance' : 'time'
}

const INVALID_UNIT_RE = /\d+\s*(?!min|sek|km)[a-z]+/

export function parseQuickInput(input) {
  const str = input.trim().toLowerCase()
  const VALID_UNITS = ['min', 'sek', 'km']

  // Reject unrecognised units early - look for digit followed by letters (excluding 'x')
  const unitsRe = /\d+\s*([a-z]+?)(?:\s|$|p:|x)/g
  let unitMatch
  while ((unitMatch = unitsRe.exec(str)) !== null) {
    const unit = unitMatch[1]
    if (unit !== 'x' && !VALID_UNITS.includes(unit)) {
      return { error: `Ukjent enhet "${unit}". Bruk min, sek eller km.` }
    }
  }

  // Pattern: NxVAL UNIT [p:VAL UNIT]
  const intervalRe = /^(\d+)\s*x\s*(\d+)\s*(min|sek|km)(?:\s*p:(\d+)\s*(min|sek|km))?/
  const intervalMatch = str.match(intervalRe)

  if (intervalMatch) {
    const [, repeatStr, intVal, intUnit, restVal, restUnit] = intervalMatch
    const segments = [{
      type: 'interval',
      durationType: unitToDurationType(intUnit),
      duration: toDuration(intVal, intUnit),
      repeat: parseInt(repeatStr, 10),
    }]
    if (restVal && restUnit) {
      segments.push({
        type: 'rest',
        durationType: unitToDurationType(restUnit),
        duration: toDuration(restVal, restUnit),
      })
    }
    return { segments, needsWarmupCooldown: true }
  }

  // Single interval: "20min terskel" or just "20min"
  const singleRe = /^(\d+)\s*(min|sek|km)/
  const singleMatch = str.match(singleRe)
  if (singleMatch) {
    const [, val, unit] = singleMatch
    return {
      segments: [{
        type: 'interval',
        durationType: unitToDurationType(unit),
        duration: toDuration(val, unit),
        repeat: 1,
      }],
      needsWarmupCooldown: true,
    }
  }

  return { error: 'Ugyldig format. Prøv f.eks. "6x6min p:60sek"' }
}
