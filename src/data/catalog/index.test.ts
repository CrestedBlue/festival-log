import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { seriesMapFor } from '../../features/map/festivalMaps'
import { CATALOG, catalogEntry, catalogEntryForLegacyId, festivalMapFor, isMapLabelPin } from './index'
import { GRAND_MINT_2026_ID, GRAND_MINT_2026_KEY, GRAND_MINT_SERIES, HERO_ROCK_2026_ID } from './ids'
import { SERIES } from './series'

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

  test('every festival has a festival code, and its yearly code is that code plus the year it starts in', () => {
    for (const entry of CATALOG) {
      expect(entry.series).toMatch(/^[a-z0-9]+$/)
      expect(entry.key).toBe(`${entry.series}${entry.create().startDate.slice(0, 4)}`)
    }
    expect(catalogEntry(HERO_ROCK_2026_ID)).toMatchObject({ series: 'herorock', key: 'herorock2026' })
    expect(catalogEntry(GRAND_MINT_2026_ID)).toMatchObject({ series: 'gmf', key: 'gmf2026' })
  })

  test('every festival takes its venue and map pins from its festival code, the same every year', () => {
    for (const entry of CATALOG) {
      const series = SERIES[entry.series]
      expect(series, entry.series).toBeDefined()
      const festival = entry.create()
      expect(festival.venue).toEqual(series?.venue)
      expect(festival.pins).toEqual(series?.pins())
      expect(festival.pins.every((pin) => pin.id.startsWith(`${entry.series}-`))).toBe(true)
    }
  })

  test('lists the 2026 Hero Rock Festival with its notices', () => {
    expect(catalogEntry(HERO_ROCK_2026_ID)?.create().name).toBe('2026 히어로 락 페스티벌 - 인천')
    expect(catalogEntry(HERO_ROCK_2026_ID)?.notices.length).toBeGreaterThan(0)
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

describe('festivalMapFor', () => {
  test('finds a festival map through the festival code, so every year of it shares one map', () => {
    expect(festivalMapFor(GRAND_MINT_2026_ID)).not.toBeNull()
    expect(festivalMapFor(GRAND_MINT_2026_ID)).toBe(seriesMapFor(GRAND_MINT_SERIES))
    expect(festivalMapFor(HERO_ROCK_2026_ID)).toBeNull()
    expect(festivalMapFor('someone-else')).toBeNull()
  })
})

describe('isMapLabelPin', () => {
  test('is true only for catalog zone pins, which the illustrated map already labels', () => {
    const pins = catalogEntry(GRAND_MINT_2026_ID)?.create().pins ?? []
    const zone = pins.find((p) => p.id.startsWith(`${GRAND_MINT_SERIES}-zone-`))
    const mark = pins.find((p) => p.id.startsWith(`${GRAND_MINT_SERIES}-mark-`))
    expect(zone && isMapLabelPin(zone)).toBe(true)
    expect(mark && isMapLabelPin(mark)).toBe(false)
    expect(isMapLabelPin({ id: 'b9f5c3a0-user-pin' })).toBe(false)
  })
})
