import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { PENTAPORT_2026_ID, PENTAPORT_2026_KEY, PENTAPORT_SERIES } from './ids'
import { PENTAPORT_2026_NOTICES, createPentaport2026 } from './pentaport2026'
import { catalogEntry, festivalMapFor, isMapLabelPin } from './index'
import { isInsideBounds } from '../../lib/geo'

describe('createPentaport2026', () => {
  const festival = createPentaport2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
  const isEvent = (id: string) => id.includes('-event-')

  test('is a schema-valid three-day festival at Songdo Moonlight Festival Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(PENTAPORT_2026_ID)
    expect(festival.name).toBe('2026 인천펜타포트 락 페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-07-31', '2026-08-02'])
    expect(festival.venue.name).toBe('송도달빛축제공원')
  })

  test('has the three stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['KB국민카드', 'MONSTER ENERGY', 'STANLEY 1913'])
  })

  test('lists all 66 acts, 22 a day, plus the stage events', () => {
    const acts = festival.performances.filter((p) => !isEvent(p.id))
    expect(acts).toHaveLength(66)
    for (const day of ['2026-07-31', '2026-08-01', '2026-08-02']) expect(acts.filter((p) => p.day === day)).toHaveLength(22)
    expect(festival.performances.filter((p) => isEvent(p.id)).map((p) => p.artist)).toEqual([
      '개막 행사',
      '스탠리와 함께하는 펜타로빅 with 김혜선',
      '스탠리와 함께하는 펜타로빅 with 김혜선',
      '스탠리와 함께하는 펜타로빅 with 김혜선',
    ])
  })

  test('places the headliners on the right stage, day, and time', () => {
    expect(find('KHRUANGBIN')).toMatchObject({ day: '2026-07-31', start: '21:10', end: '22:30' })
    expect(find('MASSIVE ATTACK')).toMatchObject({ day: '2026-08-01', start: '21:10', end: '22:40' })
    expect(find('PIXIES')).toMatchObject({ day: '2026-08-02', start: '21:10', end: '22:40' })
    expect(stageName(find('PIXIES')?.stageId)).toBe('KB국민카드')
    expect(find('The Jesus and Mary Chain')).toMatchObject({ day: '2026-08-01', start: '20:00', end: '21:00' })
    expect(stageName(find('The Jesus and Mary Chain')?.stageId)).toBe('MONSTER ENERGY')
    expect(stageName(find('이날치')?.stageId)).toBe('STANLEY 1913')
  })

  test('keeps sets on one stage from overlapping', () => {
    for (const stage of festival.stages) {
      for (const day of ['2026-07-31', '2026-08-01', '2026-08-02']) {
        const sets = festival.performances.filter((p) => p.stageId === stage.id && p.day === day).sort((a, b) => a.start.localeCompare(b.start))
        sets.slice(1).forEach((set, i) => expect(set.start >= (sets[i]?.end ?? '')).toBe(true))
      }
    }
  })

  test('uses the yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${PENTAPORT_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${PENTAPORT_SERIES}-`))).toBe(true)
  })

  test('pins the places on the map (no stages: the map names them), the ticket booths, shuttle stops and subway exits', () => {
    const names = festival.pins.map((p) => p.name)
    expect(names).toEqual(
      expect.arrayContaining([
        'GATE 1',
        'GATE 2',
        '화장실',
        '물품검색·보관소',
        '제1 티켓부스 (대략)',
        '제2 티켓부스 (대략)',
        '송도달빛축제공원역 1번 출구',
        '송도달빛축제공원역 4번 출구',
      ]),
    )
    expect(festival.pins.filter((p) => p.kind === 'stage')).toHaveLength(0)
    const map = festivalMapFor(PENTAPORT_2026_ID)
    expect(map).not.toBeNull()
    expect(festival.pins.every((pin) => map && isInsideBounds(pin, map.bounds))).toBe(true)
    // the app draws every one with the map's own icon (where the map puts it), none is listed only
    expect(festival.pins.every((p) => p.mapIcon && map && p.mapIcon in map.icons)).toBe(true)
    expect(festival.pins.some((p) => isMapLabelPin(p))).toBe(false)
    expect(festival.pins.filter((p) => p.spot).every((p) => map && p.spot && isInsideBounds(p.spot, map.bounds))).toBe(true)
    // the list shows broader roles: both ticket booths with both gates; all four exits; toilets on their own
    expect(festival.pins.filter((p) => p.group === '입장 (티켓부스·게이트)').map((p) => p.caption)).toEqual(
      expect.arrayContaining(['GATE 1', 'GATE 2', '제1 티켓부스', '제2 티켓부스']),
    )
    expect(festival.pins.filter((p) => p.group === '송도달빛축제공원역 출구')).toHaveLength(4)
    expect(new Set(festival.pins.filter((p) => p.kind === 'toilet').map((p) => p.group))).toEqual(new Set(['화장실', '장애인 화장실']))
  })

  test('comes with the official checklist and venue map to swipe through', () => {
    const guides = catalogEntry(PENTAPORT_2026_ID)?.guides ?? []
    expect(guides.map((g) => [g.title, g.images.length])).toEqual([
      ['필수 체크리스트', 10],
      ['행사장 안내도', 1],
    ])
    expect(guides.flatMap((g) => g.images).every((image) => image.alt.length > 10 && image.width === 1080 && image.height === 1350)).toBe(true)
  })

  test('has notices from the timetable post', () => {
    expect(PENTAPORT_2026_NOTICES.length).toBeGreaterThan(0)
  })
})
