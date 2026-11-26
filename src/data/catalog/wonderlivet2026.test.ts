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
    expect(catalogEntry(WONDERLIVET_2026_ID)?.guides).toEqual([])
    expect(Object.keys(SERIES[WONDERLIVET_SERIES]?.theme.stages ?? {})).toEqual(['wonder', 'livet'])
    expect(SERIES[WONDERLIVET_SERIES]?.sources.map((s) => s.value)).toEqual(['@wonderlivet'])
  })

  describe('notice blocks (the zigzag part of the info tab)', () => {
    const blocks = WONDERLIVET_2026_NOTICE_BLOCKS

    test('has its topics in order, each with a picture and a main color', () => {
      expect(blocks.map((b) => b.id)).toEqual(['ticket', 'goods', 'lockers', 'food', 'photo', 'rules', 'directions'])
      for (const block of blocks) {
        expect(block.art).toBeTruthy()
        expect(block.tone).toMatch(/^#[0-9a-f]{6}$/)
        expect(block.title.length).toBeGreaterThan(0)
      }
    })

    test('keeps every line to one fact (a block holds its whole topic, so up to a dozen lines)', () => {
      for (const block of blocks) {
        expect(block.lines.length).toBeGreaterThanOrEqual(1)
        expect(block.lines.length).toBeLessThanOrEqual(12)
        for (const line of block.lines) expect(line.replaceAll('**', '').length).toBeLessThanOrEqual(60)
      }
    })

    test('starts each block with its topic name in bold on the first line (e.g. "**푸드존** 7·8홀, 9홀 안")', () => {
      for (const block of blocks) expect(block.lines[0]?.startsWith(`**${block.title}** `)).toBe(true)
    })

    test('does not list the food zone\'s stalls (the user, 2026-11-26)', () => {
      const food = blocks.find((b) => b.id === 'food')?.lines.join(' ') ?? ''
      for (const stall of ['쉬림프', '잭잭', '닭강정']) expect(food).not.toContain(stall)
    })

    test('carries the photo booth facts from the official post (hall 9, 11:00, 5,000 won, card only)', () => {
      const photo = blocks.find((b) => b.id === 'photo')?.lines.join(' ') ?? ''
      for (const fact of ['9홀 안', '11:00', '5,000원', '카드']) expect(photo).toContain(fact)
    })

    test('keeps the wristband facts in the ticket block, short and bold, and never says "wristband = ticket" (that was the user telling us how to sort, not text)', () => {
      const raw = blocks.find((b) => b.id === 'ticket')?.lines.join(' ') ?? ''
      const ticket = raw.replaceAll('**', '')
      for (const fact of ['10:30', '신분증', '재발급 불가', '대리 수령 불가']) expect(ticket).toContain(fact)
      // grouped on one line; no official-map note, no wear-until dates (the user, 2026-11-26)
      expect(blocks.find((b) => b.id === 'ticket')?.lines.some((l) => l.includes('대리 수령 불가') && l.includes('재발급 불가'))).toBe(true)
      for (const gone of ['맵', '까지 착용']) expect(ticket).not.toContain(gone)
      expect(raw).toContain('**재발급 불가**')
      expect(ticket).not.toContain('곧 티켓')
    })

    test('keeps what belongs to a block in the block, not again in the plain notices', () => {
      const plain = WONDERLIVET_2026_NOTICES.join(' ')
      const repeated = ['손목밴드', '티켓부스', '굿즈', '포토부스', '물품보관', '푸드존', '쉬림프', '잭잭', '성인인증', '500ml', '10:30', '09:00', '촬영', '흡연', '킨텍스역', '대화역', '내비']
      for (const word of repeated) expect(plain).not.toContain(word)
      expect(WONDERLIVET_2026_NOTICES.length).toBeGreaterThan(0)
    })

    test('has the directions and the rules as blocks of their own', () => {
      const text = (id: string) => (blocks.find((b) => b.id === id)?.lines.join(' ') ?? '').replaceAll('**', '')
      for (const fact of ['킨텍스역', '4·5번 출구', '대화역', '2번 출구', '킨텍스 제2전시장', '주차 할인 없음']) expect(text('directions')).toContain(fact)
      for (const fact of ['촬영', '녹음', '기념사진', '지정 흡연구역']) expect(text('rules')).toContain(fact)
    })

    test('says the photo booth is not the ticket booth outside the halls', () => {
      expect(blocks.find((b) => b.id === 'photo')?.lines.join(' ')).toContain('공연장 밖 티켓부스')
    })

    test('is attached to the festival in the catalog', () => {
      expect(catalogEntry(WONDERLIVET_2026_ID)?.noticeBlocks).toBe(blocks)
    })
  })
})
