import { describe, expect, test } from 'vitest'
import { GRAND_MINT_2026_ID, HERO_ROCK_2026_ID, PENTAPORT_2026_ID } from './catalog/ids'
import { SERIES } from './catalog/series'
import { activeFestival, festivalMark, resolveFestival } from './resolve'
import { makeFestival, makePin, makeUserData } from './testFixtures'

describe('resolveFestival', () => {
  test('serves catalog festivals with the user pins added on top and the admin notices', () => {
    const pin = makePin({ id: 'mine' })
    const resolved = resolveFestival(makeUserData({ userPins: { [GRAND_MINT_2026_ID]: [pin] } }), GRAND_MINT_2026_ID)
    expect(resolved?.source).toBe('catalog')
    expect(resolved?.festival.name).toBe('그랜드 민트 페스티벌 2026')
    expect(resolved?.festival.pins.at(-1)).toEqual(pin)
    expect(resolved?.notices.length).toBeGreaterThan(0)
  })

  test('serves archived festivals as they were saved', () => {
    const archived = makeFestival({ id: 'old' })
    const resolved = resolveFestival(makeUserData({ archivedFestivals: [archived] }), 'old')
    expect(resolved).toEqual({
      source: 'archived',
      festival: archived,
      notices: [],
      lineup: [],
      guides: [],
      sources: [],
      tickets: [],
      theme: null,
      edition: null,
    })
  })

  test('carries the official channels of the festival', () => {
    expect(resolveFestival(makeUserData(), PENTAPORT_2026_ID)?.sources.map((s) => s.value)).toEqual(['@pentaportrf', 'https://www.pentaport.co.kr/Notice'])
  })

  test('carries the guide images of a catalog festival', () => {
    expect(resolveFestival(makeUserData(), PENTAPORT_2026_ID)?.guides.map((g) => g.title)).toEqual(['필수 체크리스트', '행사장 안내도'])
    expect(resolveFestival(makeUserData(), GRAND_MINT_2026_ID)?.guides).toEqual([])
  })

  test('carries the official ticket sellers of the edition', () => {
    expect(resolveFestival(makeUserData(), HERO_ROCK_2026_ID)?.tickets.map((s) => s.url)).toEqual(['https://ticket.melon.com/performance/index.htm?prodId=214033'])
    expect(resolveFestival(makeUserData(), PENTAPORT_2026_ID)?.tickets).toEqual([])
  })

  test('carries the line-up images of a catalog festival', () => {
    expect(resolveFestival(makeUserData(), HERO_ROCK_2026_ID)?.lineup.map((image) => image.label)).toEqual(['1차 라인업', '2차 라인업'])
    expect(resolveFestival(makeUserData(), GRAND_MINT_2026_ID)?.lineup).toEqual([])
  })

  test('carries the festival design and the code and year shown above the title', () => {
    const gmf = resolveFestival(makeUserData(), GRAND_MINT_2026_ID)
    expect(gmf?.edition).toEqual({ series: 'gmf', year: '2026' })
    expect(gmf?.theme?.accent).toBe('#0f352f')
    expect(gmf?.theme?.art).toBeTruthy()
    expect(resolveFestival(makeUserData(), PENTAPORT_2026_ID)?.theme?.accent).toBe('#432a73')
    expect(resolveFestival(makeUserData(), HERO_ROCK_2026_ID)?.theme?.accent).toBe('#7d5a1c')
  })

  test('returns null for unknown ids', () => {
    expect(resolveFestival(makeUserData(), 'nope')).toBeNull()
  })
})

describe('activeFestival', () => {
  test('falls back to the first festival in my list, then to nothing', () => {
    expect(activeFestival(makeUserData({ myFestivalIds: [GRAND_MINT_2026_ID], activeFestivalId: 'gone' }))?.festival.id).toBe(GRAND_MINT_2026_ID)
    expect(activeFestival(makeUserData({ myFestivalIds: [], activeFestivalId: null }))).toBeNull()
  })
})

describe('festivalMark', () => {
  test("is the festival's own logo for catalog festivals, none for the ones saved from older versions", () => {
    expect(festivalMark(GRAND_MINT_2026_ID)).toBe(SERIES.gmf?.theme.mark)
    expect(festivalMark(HERO_ROCK_2026_ID)).toBe(SERIES.herorock?.theme.mark)
    expect(festivalMark(GRAND_MINT_2026_ID)).not.toBe(festivalMark(HERO_ROCK_2026_ID))
    expect(festivalMark('old')).toBeNull()
  })
})
