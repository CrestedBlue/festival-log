import { describe, expect, test } from 'vitest'
import { makeData, makeFestival } from '../testFixtures'
import { GRAND_MINT_2026_ID, createGrandMint2026 } from './grandMint2026'
import { syncPresetPins } from './index'

describe('syncPresetPins', () => {
  const fresh = createGrandMint2026()

  test('replaces outdated preset pins and keeps pins the user added', () => {
    const userPin = { id: 'mine', name: '우리 돗자리', kind: 'meet' as const, lat: 37.519, lng: 127.125 }
    const stale = { ...fresh, pins: [{ ...fresh.pins[0]!, lat: 37.5, lng: 127.1 }, userPin] }
    const next = syncPresetPins(makeData({ festivals: [stale], activeFestivalId: GRAND_MINT_2026_ID }))
    const pins = next.festivals[0]?.pins ?? []
    expect(pins.filter((p) => p.id.startsWith(`${GRAND_MINT_2026_ID}-pin-`))).toEqual(fresh.pins)
    expect(pins).toContainEqual(userPin)
  })

  test('returns the same data when preset pins are current, even if the user deleted some', () => {
    const data = makeData({ festivals: [{ ...fresh, pins: fresh.pins.slice(2) }], activeFestivalId: GRAND_MINT_2026_ID })
    expect(syncPresetPins(data)).toBe(data)
  })

  test('leaves data without the preset festival untouched', () => {
    const data = makeData({ festivals: [makeFestival()] })
    expect(syncPresetPins(data)).toBe(data)
  })
})
