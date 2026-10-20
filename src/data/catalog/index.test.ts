import { describe, expect, test } from 'vitest'
import { CATALOG, catalogEntry, catalogEntryForLegacyId, isMapLabelPin } from './index'
import { GRAND_MINT_2026_ID, GRAND_MINT_2026_KEY } from './ids'

describe('catalog', () => {
  test('every festival has a UUID id and builds a festival with that id', () => {
    for (const entry of CATALOG) {
      expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
      expect(entry.create().id).toBe(entry.id)
    }
  })

  test('finds entries by id and by the id older versions used', () => {
    expect(catalogEntry(GRAND_MINT_2026_ID)?.key).toBe(GRAND_MINT_2026_KEY)
    expect(catalogEntryForLegacyId('gmf2026')?.id).toBe(GRAND_MINT_2026_ID)
    expect(catalogEntryForLegacyId('someone-else')).toBeUndefined()
  })

  test('has admin notices for the Grand Mint Festival', () => {
    expect(catalogEntry(GRAND_MINT_2026_ID)?.notices.length).toBeGreaterThan(0)
  })
})

describe('isMapLabelPin', () => {
  test('is true only for catalog zone pins, which the illustrated map already labels', () => {
    const pins = catalogEntry(GRAND_MINT_2026_ID)?.create().pins ?? []
    const zone = pins.find((p) => p.id.startsWith(`${GRAND_MINT_2026_KEY}-zone-`))
    const mark = pins.find((p) => p.id.startsWith(`${GRAND_MINT_2026_KEY}-mark-`))
    expect(zone && isMapLabelPin(zone)).toBe(true)
    expect(mark && isMapLabelPin(mark)).toBe(false)
    expect(isMapLabelPin({ id: 'b9f5c3a0-user-pin' })).toBe(false)
  })
})
