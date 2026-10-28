import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { CDF_2026_LINEUP, CDF_2026_NOTICES, CDF_2026_TICKETS, createCdf2026 } from './cdf2026'
import { CDF_2026_ID, CDF_2026_KEY, CDF_SERIES } from './ids'
import { catalogEntry, festivalMapFor } from './index'

describe('createCdf2026', () => {
  const festival = createCdf2026()

  test('is a schema-valid one-night festival on New Year\'s Eve', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(CDF_2026_ID)
    expect(festival.name).toBe('카운트다운 판타지 2026-2027')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-12-31', '2026-12-31'])
  })

  test('is in halls 7 and 8 of KINTEX\'s second exhibition centre and has no timetable yet', () => {
    expect(festival.venue.name).toBe('킨텍스 제2전시장 7·8홀')
    expect(festival.venue.lat).toBeCloseTo(37.6647, 3)
    expect(festival.venue.lng).toBeCloseTo(126.7419, 3)
    expect(festival.stages).toEqual([])
    expect(festival.performances).toEqual([])
  })

  test('pins the venue and the stations near it on the KINTEX area map, as the map\'s icons', () => {
    expect(festival.pins.filter((p) => !p.group?.endsWith(' 출구')).map((p) => [p.name, p.group ?? null])).toEqual([
      ['킨텍스 제2전시장 7·8홀', null],
      ['킨텍스역 (GTX-A)', '가까운 역'],
      ['대화역 (3호선)', '가까운 역'],
    ])
    expect(festival.pins.every((p) => p.detail)).toBe(true)
    const map = festivalMapFor(CDF_2026_ID)
    expect(map?.attribution).toContain('카운트다운 판타지')
    expect(festival.pins.every((p) => p.mapIcon && map?.icons[p.mapIcon])).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${CDF_SERIES}-`))).toBe(true)
  })

  test('has notices from the official posts and the NOL ticket page', () => {
    expect(CDF_2026_NOTICES.length).toBeGreaterThan(0)
    expect(CDF_2026_NOTICES.join(' ')).toContain('13:30')
  })

  test('has the first line-up poster, every act named for screen readers', () => {
    expect(CDF_2026_LINEUP.map((l) => l.label)).toEqual(['1차 라인업'])
    const [first] = CDF_2026_LINEUP
    expect(first).toMatchObject({ width: 700, height: 875 })
    for (const act of ['극동아시아타이거즈', 'LOW HIGH LOW', 'FTISLAND', '포져군단', '혁오']) expect(first?.alt).toContain(act)
  })

  test('is sold by the four sellers the official posts name', () => {
    expect(CDF_2026_TICKETS.map((s) => s.name)).toEqual(['NOL 티켓', 'YES24', '네이버 예약', '2TM'])
  })

  test('is in the catalog under its own festival code', () => {
    expect(catalogEntry(CDF_2026_ID)).toMatchObject({ series: CDF_SERIES, key: CDF_2026_KEY, lineup: CDF_2026_LINEUP })
    expect(CDF_2026_KEY).toBe('cdf2026')
  })
})
