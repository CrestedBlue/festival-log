import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { ARTIST_NAMES } from './artists'
import { THE_GLOW_2026_ID, THE_GLOW_2026_KEY, THE_GLOW_SERIES } from './ids'
import { catalogEntry, festivalMapFor } from './index'
import { THE_GLOW_2026_NOTICES, THE_GLOW_2026_TICKETS, createTheGlow2026 } from './theGlow2026'

describe('createTheGlow2026', () => {
  const festival = createTheGlow2026()
  const on = (day: string, stage: string) =>
    festival.performances.filter((p) => p.day === day && p.stageId === `${THE_GLOW_2026_KEY}-${stage}`).map((p) => `${p.start} ${p.artist}`)

  test('is a schema-valid two-day festival in March 2026', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(THE_GLOW_2026_ID)
    expect(festival.name).toBe('더 글로우 2026')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-03-21', '2026-03-22'])
    expect(festival.venue.name).toBe('킨텍스 제2전시장 7·8·9·10A홀')
  })

  test('has the three stages of the timetable, each with the festival\'s color and icon', () => {
    expect(festival.stages.map((s) => [s.name, s.icon])).toEqual([
      ['STAGE 37', 'radar'],
      ['STAGE 126', 'star'],
      ['STAGE X', 'bolt'],
    ])
  })

  test('has all 38 acts of the line-up, 19 a day, each once', () => {
    expect(festival.performances).toHaveLength(38)
    expect(festival.performances.filter((p) => p.day === '2026-03-21')).toHaveLength(19)
    expect(new Set(festival.performances.map((p) => p.artist)).size).toBe(38)
    expect(new Set(festival.performances.map((p) => p.id)).size).toBe(38)
  })

  test('follows the official timetable', () => {
    expect(on('2026-03-21', 'stage37')).toEqual(['12:20 김승주', '13:45 드래곤포니', '15:20 리도어', '17:00 메이트', '18:50 한로로', '20:50 이승윤'])
    expect(on('2026-03-21', 'stage126')[0]).toBe('11:40 공원')
    expect(on('2026-03-21', 'stageX').at(-1)).toBe('19:30 솔루션스')
    expect(on('2026-03-22', 'stage37').at(-1)).toBe('20:50 혁오')
    expect(on('2026-03-22', 'stage126')).toEqual(['11:40 고고학', '13:00 까치산', '14:30 Kiro Akiyama', '16:10 grentperez', '17:50 터치드', '19:50 이찬혁'])
    expect(on('2026-03-22', 'stageX')).toEqual(['12:00 이십사일', '13:10 제미나이', '14:20 유라', '15:35 HOME', '16:50 봉제인간', '18:10 Cafuné', '19:30 바밍타이거'])
    const headliners = festival.performances.filter((p) => p.end === '22:00')
    expect(headliners.map((p) => [p.day, p.start, p.artist])).toEqual([
      ['2026-03-21', '20:50', '이승윤'],
      ['2026-03-22', '20:50', '혁오'],
    ])
  })

  test('lets every act be found by its name in the other script', () => {
    const normalize = (name: string) => name.replace(/\s+/g, '').toLowerCase() // as the search compares them
    const known = new Set(ARTIST_NAMES.flat().map(normalize))
    expect(festival.performances.filter((p) => !known.has(normalize(p.artist))).map((p) => p.artist)).toEqual([])
  })

  test('pins the venue and the stations on the KINTEX area map, naming THE GLOW', () => {
    expect(festival.pins.filter((p) => !p.group?.endsWith(' 출구')).map((p) => p.name)).toEqual([
      '킨텍스 제2전시장 7·8·9·10A홀 · 공연장',
      '킨텍스역 (GTX-A)',
      '대화역 (3호선)',
    ])
    const map = festivalMapFor(THE_GLOW_2026_ID)
    expect(map?.attribution).toContain('더 글로우')
    expect(festival.pins.every((p) => p.mapIcon && map?.icons[p.mapIcon])).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${THE_GLOW_SERIES}-`))).toBe(true)
  })

  test('has notices from the official site and is sold by Melon Ticket', () => {
    expect(THE_GLOW_2026_NOTICES.join(' ')).toContain('11:00')
    expect(THE_GLOW_2026_NOTICES.join(' ')).toContain('STAGE X는 1층으로만')
    expect(THE_GLOW_2026_TICKETS.map((s) => s.url)).toEqual(['https://ticket.melon.com/performance/index.htm?prodId=212651'])
  })

  test('is in the catalog under its own festival code, all tabs open', () => {
    expect(catalogEntry(THE_GLOW_2026_ID)).toMatchObject({ series: THE_GLOW_SERIES, key: THE_GLOW_2026_KEY, lineup: [], guides: [] })
    expect(catalogEntry(THE_GLOW_2026_ID)?.closedTabs).toBeUndefined()
    expect(THE_GLOW_2026_KEY).toBe('theglow2026')
  })
})
