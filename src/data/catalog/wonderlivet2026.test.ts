import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { WONDERLIVET_2026_ID, WONDERLIVET_2026_KEY, WONDERLIVET_SERIES } from './ids'
import { WONDERLIVET_2026_NOTICES, WONDERLIVET_2026_NOTICE_BLOCKS, createWonderlivet2026 } from './wonderlivet2026'
import { catalogEntry, festivalMapFor } from './index'
import { SERIES } from './series'
import { isInsideBounds } from '../../lib/geo'

const DAYS = ['2026-11-20', '2026-11-21', '2026-11-22']

describe('createWonderlivet2026', () => {
  const festival = createWonderlivet2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)

  test('is a schema-valid three-day festival at KINTEX', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(WONDERLIVET_2026_ID)
    expect(festival.name).toBe('원더리벳 2026')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-11-20', '2026-11-22'])
    expect(festival.venue.name).toBe('킨텍스 제2전시장 7–10홀')
  })

  test('has the two stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['WONDER STAGE', 'LIVET STAGE'])
  })

  test('lists all 42 acts, 14 a day, taking turns on the two stages', () => {
    expect(festival.performances).toHaveLength(42)
    for (const day of DAYS) {
      const sets = festival.performances.filter((p) => p.day === day).sort((a, b) => a.start.localeCompare(b.start))
      expect(sets).toHaveLength(14)
      sets.slice(1).forEach((set, i) => {
        expect(set.start).toBe(sets[i]?.end) // back to back
        expect(set.stageId).not.toBe(sets[i]?.stageId) // on the other stage
      })
    }
  })

  test('places the openers and closers on the right stage, day, and time', () => {
    expect(find('A I W E O')).toMatchObject({ day: '2026-11-20', start: '12:00', end: '12:30' })
    expect(stageName(find('A I W E O')?.stageId)).toBe('LIVET STAGE')
    expect(find('THE ORAL CIGARETTES')).toMatchObject({ day: '2026-11-20', start: '21:00', end: '22:00' })
    expect(stageName(find('THE ORAL CIGARETTES')?.stageId)).toBe('WONDER STAGE')
    expect(find('[Alexandros]')).toMatchObject({ day: '2026-11-21', start: '21:00' })
    expect(find('HANRORO')).toMatchObject({ day: '2026-11-21', start: '19:10', end: '20:00' })
    expect(find('NELL')).toMatchObject({ day: '2026-11-22', start: '19:10', end: '20:00' })
    expect(stageName(find('SUKIMASWITCH')?.stageId)).toBe('LIVET STAGE')
    expect(find('YUZU')).toMatchObject({ day: '2026-11-22', start: '21:00', end: '22:00' })
  })

  test('uses the yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${WONDERLIVET_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${WONDERLIVET_SERIES}-`))).toBe(true)
  })

  test('pins the booths, gates and facilities of its festival map inside the halls, and the stations', () => {
    const named = (name: string) => festival.pins.filter((p) => p.name === name)
    expect(named('WONDER STAGE 게이트')).toHaveLength(1)
    expect(named('LIVET STAGE 게이트')).toHaveLength(1)
    expect(named('음식·음료 부스')).toHaveLength(2)
    expect(named('주류 부스')).toHaveLength(2)
    expect(named('콘텐츠 부스')).toHaveLength(2)
    expect(named('휠체어존').map((p) => p.detail)).toEqual(['2층 로비 · 7홀 쪽', '2층 로비 · 가운데'])
    expect(named('물품보관소')[0]?.detail).toContain('2층 9홀 앞 로비')
    expect(named('화장실')).toHaveLength(7)
    // the ticket booth is outside the halls (the official posts), the photo booth inside hall 9
    expect(named('티켓부스 (대략)')[0]?.detail).toContain('공연장 밖')
    expect(named('포토부스 (대략)')[0]).toMatchObject({ kind: 'photo', detail: expect.stringContaining('9홀 안') })
    expect(named('포토부스 (대략)')[0]?.detail).toContain('5,000원')
    expect(festival.pins.filter((p) => p.kind === 'wristband').map((p) => p.name)).toEqual(['티켓부스 (대략)'])
    // stages are named on the map, not pinned
    expect(festival.pins.some((p) => p.kind === 'stage')).toBe(false)
    expect(festival.pins.filter((p) => !p.group && p.name.endsWith(')') && p.name.includes('역')).map((p) => p.name)).toEqual(['킨텍스역 (GTX-A)', '대화역 (3호선)'])
    const exits = (group: string) => festival.pins.filter((p) => p.group === group).map((p) => p.name)
    expect(exits('킨텍스역 출구')).toHaveLength(5) // the numbered ones (one entrance has no number in OSM)
    expect(exits('대화역 출구')).toHaveLength(6)
    expect(exits('킨텍스역 출구')).toContain('킨텍스역 5번 출구')
    const map = festivalMapFor(WONDERLIVET_2026_ID)
    expect(map?.layers).toHaveLength(3) // the big map, the ground floor, the 2F lobby
    // every pin on the map, the halls' ones on the venue map
    for (const pin of festival.pins) expect(map && isInsideBounds(pin, map.bounds), pin.name).toBe(true)
    for (const pin of festival.pins.filter((p) => !p.group?.endsWith(' 출구') && !p.name.includes('역'))) {
      expect(map && isInsideBounds(pin, map.layers[1]!.bounds), pin.name).toBe(true)
    }
  })

  test('puts the lockers and the wheelchair zones on the 2F lobby, everything else on the ground floor', () => {
    const upstairs = festival.pins.filter((p) => p.floor === 2).map((p) => p.name)
    expect(upstairs.sort()).toEqual(['물품보관소', '휠체어존', '휠체어존'])
    expect(festival.pins.filter((p) => (p.floor ?? 1) === 1).length).toBeGreaterThan(15)
    expect(festival.pins.every((p) => p.floor === undefined || p.floor === 2)).toBe(true)
  })

  test('has a map of two floors, the 2F lobby drawn as its own layer over the same ground', () => {
    const map = festivalMapFor(WONDERLIVET_2026_ID)
    const floors = map?.layers.filter((l) => l.floor !== undefined) ?? []
    expect(floors.map((l) => l.floor)).toEqual([1, 2])
    expect(new Set(floors.map((l) => JSON.stringify(l.bounds))).size).toBe(1)
    // the stages and the halls' names are on the ground floor only
    expect(map?.labels.filter((l) => l.kind === 'stage' || l.kind === 'place').every((l) => l.floor === 1)).toBe(true)
  })

  test('comes with notices from the official FAQ, and the design of its own', () => {
    expect(WONDERLIVET_2026_NOTICES.length).toBeGreaterThan(0)
    expect(WONDERLIVET_2026_NOTICES.join(' ')).toContain('공연장 밖 티켓부스')
    expect(catalogEntry(WONDERLIVET_2026_ID)?.guides).toEqual([])
    expect(Object.keys(SERIES[WONDERLIVET_SERIES]?.theme.stages ?? {})).toEqual(['wonder', 'livet'])
    expect(SERIES[WONDERLIVET_SERIES]?.sources.map((s) => s.value)).toEqual(['@wonderlivet'])
  })

  describe('notice blocks (the zigzag part of the info tab)', () => {
    const blocks = WONDERLIVET_2026_NOTICE_BLOCKS

    test('has the four topics in order, each with a picture and a main color', () => {
      expect(blocks.map((b) => b.id)).toEqual(['ticket', 'lockers', 'food', 'photo'])
      for (const block of blocks) {
        expect(block.art).toBeTruthy()
        expect(block.tone).toMatch(/^#[0-9a-f]{6}$/)
        expect(block.title.length).toBeGreaterThan(0)
      }
    })

    test('keeps every line short (one fact a line, at most four lines a block)', () => {
      for (const block of blocks) {
        expect(block.lines.length).toBeGreaterThanOrEqual(1)
        expect(block.lines.length).toBeLessThanOrEqual(4)
        for (const line of block.lines) expect(line.replaceAll('**', '').length).toBeLessThanOrEqual(40)
      }
    })

    test('carries the photo booth facts from the official post (hall 9, 11:00, 5,000 won, card only)', () => {
      const photo = blocks.find((b) => b.id === 'photo')?.lines.join(' ') ?? ''
      for (const fact of ['9홀 안', '11:00', '5,000원', '카드']) expect(photo).toContain(fact)
    })

    test('is attached to the festival in the catalog', () => {
      expect(catalogEntry(WONDERLIVET_2026_ID)?.noticeBlocks).toBe(blocks)
    })
  })
})
