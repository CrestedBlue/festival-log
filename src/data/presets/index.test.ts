import { describe, expect, test } from 'vitest'
import { makeData, makeFestival } from '../testFixtures'
import { GRAND_MINT_2026_ID, createGrandMint2026 } from './grandMint2026'
import { isMapLabelPin, syncPresetPins } from './index'

describe('syncPresetPins', () => {
  const fresh = createGrandMint2026()

  test('replaces outdated preset pins and keeps pins the user added', () => {
    const userPin = { id: 'mine', name: '우리 돗자리', kind: 'meet' as const, lat: 37.519, lng: 127.125 }
    const stale = { ...fresh, pins: [{ ...fresh.pins[0]!, lat: 37.5, lng: 127.1 }, userPin] }
    const next = syncPresetPins(makeData({ festivals: [stale], activeFestivalId: GRAND_MINT_2026_ID }))
    const pins = next.festivals[0]?.pins ?? []
    expect(pins.filter((p) => p.id.startsWith(`${GRAND_MINT_2026_ID}-`))).toEqual(fresh.pins)
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

describe('syncPresetPins with pins from an older app version', () => {
  test('swaps old-style preset pins for the current set', () => {
    const fresh = createGrandMint2026()
    const old = { id: `${GRAND_MINT_2026_ID}-pin-0`, name: 'Mint Breeze · 88잔디마당', kind: 'stage' as const, lat: 37.519, lng: 127.125 }
    const next = syncPresetPins(makeData({ festivals: [{ ...fresh, pins: [old] }], activeFestivalId: GRAND_MINT_2026_ID }))
    expect(next.festivals[0]?.pins).toEqual(fresh.pins)
  })
})

describe('isMapLabelPin', () => {
  test('is true only for preset zone pins, which the illustrated map already labels', () => {
    const pins = createGrandMint2026().pins
    const zone = pins.find((p) => p.id.startsWith(`${GRAND_MINT_2026_ID}-zone-`))
    const mark = pins.find((p) => p.id.startsWith(`${GRAND_MINT_2026_ID}-mark-`))
    expect(zone && isMapLabelPin(GRAND_MINT_2026_ID, zone)).toBe(true)
    expect(mark && isMapLabelPin(GRAND_MINT_2026_ID, mark)).toBe(false)
    expect(isMapLabelPin(GRAND_MINT_2026_ID, { id: 'mine' })).toBe(false)
  })
})
