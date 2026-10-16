import { describe, expect, test } from 'vitest'
import { distanceMeters, formatDistance, isInsideBounds } from './geo'

describe('distanceMeters', () => {
  test('is zero for the same point', () => {
    expect(distanceMeters({ lat: 37.5, lng: 127 }, { lat: 37.5, lng: 127 })).toBe(0)
  })

  test('approximates ~111km per degree of latitude', () => {
    const d = distanceMeters({ lat: 37, lng: 127 }, { lat: 38, lng: 127 })
    expect(d).toBeGreaterThan(110_000)
    expect(d).toBeLessThan(112_000)
  })
})

describe('formatDistance', () => {
  test('shows meters rounded to 10m under 1km', () => {
    expect(formatDistance(4)).toBe('10m 이내')
    expect(formatDistance(123)).toBe('120m')
  })

  test('shows kilometers with one decimal from 1km', () => {
    expect(formatDistance(1234)).toBe('1.2km')
  })
})

describe('isInsideBounds', () => {
  const bounds: [[number, number], [number, number]] = [
    [37.5, 127.1],
    [37.6, 127.2],
  ]

  test('is true inside and on the edge', () => {
    expect(isInsideBounds({ lat: 37.55, lng: 127.15 }, bounds)).toBe(true)
    expect(isInsideBounds({ lat: 37.5, lng: 127.2 }, bounds)).toBe(true)
  })

  test('is false outside on any side', () => {
    expect(isInsideBounds({ lat: 37.49, lng: 127.15 }, bounds)).toBe(false)
    expect(isInsideBounds({ lat: 37.55, lng: 127.21 }, bounds)).toBe(false)
  })
})
