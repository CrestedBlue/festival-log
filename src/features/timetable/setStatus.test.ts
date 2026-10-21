import { describe, expect, test } from 'vitest'
import { SOON_WITHIN_MIN, setStatus } from './setStatus'

const span = { start: 17 * 60 + 10, end: 18 * 60 }

describe('setStatus', () => {
  test('marks the set playing now, up to its last minute', () => {
    expect(setStatus(span, span.start)).toEqual({ kind: 'live' })
    expect(setStatus(span, span.end - 1)).toEqual({ kind: 'live' })
    expect(setStatus(span, span.end)).toBeNull()
  })

  test('counts down the sets starting soon', () => {
    expect(setStatus(span, 17 * 60)).toEqual({ kind: 'soon', minutes: 10 })
    expect(setStatus(span, span.start - SOON_WITHIN_MIN)).toEqual({ kind: 'soon', minutes: SOON_WITHIN_MIN })
    expect(setStatus(span, span.start - SOON_WITHIN_MIN - 1)).toBeNull()
  })

  test('says nothing on other days', () => {
    expect(setStatus(span, null)).toBeNull()
  })
})
