import { describe, expect, test } from 'vitest'
import { GRAND_MINT_2026_ID, HERO_ROCK_2026_ID } from './catalog/ids'
import { isSameFestival, mergeCatalogTwins } from './twins'
import { makeFestival, makePin, makeUserData } from './testFixtures'

const HERO_DATES = { startDate: '2026-12-18', endDate: '2026-12-20' }
const SONGDO = { name: '송도컨벤시아', lat: 37.388776, lng: 126.646738 }
// The old editor left the venue pin wherever the previous festival was: only the name was typed.
const TYPED_SONGDO = { name: '송도 컨벤시아', lat: 37.5195, lng: 127.1265 }

describe('isSameFestival', () => {
  const catalog = makeFestival({ ...HERO_DATES, venue: SONGDO })

  test('same dates at the same venue name (spacing ignored) are one festival, wherever its pin was', () => {
    expect(isSameFestival(catalog, makeFestival({ id: 'x', name: '히어로 락페', ...HERO_DATES, venue: TYPED_SONGDO }))).toBe(true)
  })

  test('same dates at venues less than 1 km apart are one festival', () => {
    expect(isSameFestival(catalog, makeFestival({ ...HERO_DATES, venue: { name: '컨벤시아 앞', lat: 37.3895, lng: 126.6475 } }))).toBe(true)
  })

  test('other dates, or the same dates somewhere else, are different festivals', () => {
    expect(isSameFestival(catalog, makeFestival({ startDate: '2026-12-19', endDate: '2026-12-20', venue: SONGDO }))).toBe(false)
    expect(isSameFestival(catalog, makeFestival({ ...HERO_DATES, venue: { name: '올림픽공원', lat: 37.5195, lng: 127.1265 } }))).toBe(false)
  })

  test('placeholder dates of a festival whose dates are not out never match', () => {
    expect(isSameFestival(makeFestival({ ...HERO_DATES, datesTbd: true, venue: SONGDO }), catalog)).toBe(false)
  })
})

describe('mergeCatalogTwins', () => {
  const meetPin = makePin({ id: 'meet', name: '만날 곳' })
  const laterPin = makePin({ id: 'later', name: '나중에 꽂은 핀' })
  const own = makeFestival({ id: 'mine-hero', name: '히어로 락페', ...HERO_DATES, venue: TYPED_SONGDO, performances: [], pins: [meetPin] })

  test('folds a festival the user made into the catalog festival on the same dates at the same place', () => {
    const merged = mergeCatalogTwins(
      makeUserData({
        myFestivalIds: [GRAND_MINT_2026_ID, 'mine-hero'],
        activeFestivalId: 'mine-hero',
        archivedFestivals: [own],
        userPins: { 'mine-hero': [laterPin] },
        ticketLinks: { 'mine-hero': 'https://ticket.melon.com/performance/index.htm?prodId=214033' },
      }),
    )
    expect(merged.archivedFestivals).toEqual([])
    expect(merged.myFestivalIds).toEqual([GRAND_MINT_2026_ID, HERO_ROCK_2026_ID])
    expect(merged.activeFestivalId).toBe(HERO_ROCK_2026_ID)
    expect(merged.userPins).toEqual({ [HERO_ROCK_2026_ID]: [meetPin, laterPin] })
    expect(merged.ticketLinks).toEqual({ [HERO_ROCK_2026_ID]: 'https://ticket.melon.com/performance/index.htm?prodId=214033' })
  })

  test('keeps one entry when both are in my list, and the link saved on the catalog festival wins', () => {
    const merged = mergeCatalogTwins(
      makeUserData({
        myFestivalIds: ['mine-hero', HERO_ROCK_2026_ID],
        activeFestivalId: HERO_ROCK_2026_ID,
        archivedFestivals: [own],
        userPins: { [HERO_ROCK_2026_ID]: [laterPin] },
        ticketLinks: { 'mine-hero': 'https://example.com/old', [HERO_ROCK_2026_ID]: 'https://example.com/new' },
      }),
    )
    expect(merged.myFestivalIds).toEqual([HERO_ROCK_2026_ID])
    expect(merged.userPins).toEqual({ [HERO_ROCK_2026_ID]: [laterPin, meetPin] })
    expect(merged.ticketLinks).toEqual({ [HERO_ROCK_2026_ID]: 'https://example.com/new' })
  })

  test('returns the very same data when no festival the user made has a catalog twin', () => {
    const data = makeUserData({ myFestivalIds: ['f1'], activeFestivalId: 'f1', archivedFestivals: [makeFestival()] })
    expect(mergeCatalogTwins(data)).toBe(data)
  })
})
