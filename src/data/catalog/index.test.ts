import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { CATALOG, catalogEntry, catalogEntryForLegacyId, isMapLabelPin } from './index'
import { GRAND_MINT_2026_ID, GRAND_MINT_2026_KEY, HERO_ROCK_2026_ID } from './ids'

describe('catalog', () => {
  test('every festival has a UUID id and builds a festival with that id', () => {
    for (const entry of CATALOG) {
      expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
      expect(entry.create().id).toBe(entry.id)
    }
  })

  test('every festival passes the festival schema and has its own id and key', () => {
    for (const entry of CATALOG) expect(FestivalSchema.safeParse(entry.create()).success).toBe(true)
    expect(new Set(CATALOG.map((e) => e.id)).size).toBe(CATALOG.length)
    expect(new Set(CATALOG.map((e) => e.key)).size).toBe(CATALOG.length)
  })

  test('lists the 2026 Hero Rock Festival, which has no notices yet', () => {
    expect(catalogEntry(HERO_ROCK_2026_ID)?.create().name).toBe('2026 히어로 락페스티벌')
    expect(catalogEntry(HERO_ROCK_2026_ID)?.notices).toEqual([])
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
