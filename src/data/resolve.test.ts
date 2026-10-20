import { describe, expect, test } from 'vitest'
import { GRAND_MINT_2026_ID } from './catalog/ids'
import { activeFestival, resolveFestival } from './resolve'
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
    expect(resolved).toEqual({ source: 'archived', festival: archived, notices: [] })
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
