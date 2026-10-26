import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { isInsideBounds } from '../../lib/geo'
import { GRAND_MINT_2026_ID, createGrandMint2026 } from './grandMint2026'
import { GRAND_MINT_SERIES } from './ids'
import { festivalMapFor } from './index'

describe('createGrandMint2026', () => {
  const festival = createGrandMint2026()

  test('is a schema-valid two-day festival at Olympic Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(GRAND_MINT_2026_ID)
    expect([festival.startDate, festival.endDate]).toEqual(['2026-10-17', '2026-10-18'])
  })

  test('has the four stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual([
      'Mint Breeze',
      'Club Midnight Sunset',
      'Loving Forest Garden',
      'Radar',
    ])
  })

  test('places headliners on the right stage, day, and time', () => {
    const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
    const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
    expect(find('이소라')).toMatchObject({ day: '2026-10-17', start: '20:40' })
    expect(stageName(find('이소라')?.stageId)).toBe('Mint Breeze')
    expect(find('씨엔블루')).toMatchObject({ day: '2026-10-18', start: '19:00', end: '20:00' })
    expect(stageName(find('십란 (십센치 X 소란)')?.stageId)).toBe('Club Midnight Sunset')
  })

  test('lists every music set from both days', () => {
    const music = festival.performances.filter((p) => !p.stageId.endsWith('radar'))
    expect(music.filter((p) => p.day === '2026-10-17')).toHaveLength(24)
    expect(music.filter((p) => p.day === '2026-10-18')).toHaveLength(24)
  })

  test('puts every pin on the bundled map, with the exits of the three nearby stations', () => {
    const map = festivalMapFor(GRAND_MINT_2026_ID)
    expect(map).not.toBeNull()
    expect(festival.pins.every((pin) => map && isInsideBounds(pin, map.bounds))).toBe(true)
    const exits = festival.pins.filter((pin) => pin.name.includes('출구'))
    expect(exits).toHaveLength(13)
    expect([...new Set(exits.map((pin) => pin.group))]).toEqual(['몽촌토성역 출구', '한성백제역 출구', '올림픽공원역 출구'])
    expect(exits.every((pin) => pin.mapIcon && map?.icons[pin.mapIcon])).toBe(true)
  })

  test('turns every official map pin into a pin the map draws as its own icon, booths that do two things as one', () => {
    const marks = festival.pins.filter((pin) => pin.id.startsWith(`${GRAND_MINT_SERIES}-pin-`))
    expect(marks).toHaveLength(32) // 34 official pins; the Mint Shop and Artist & Label booths each had two
    expect(marks.filter((pin) => pin.kind === 'toilet')).toHaveLength(11)
    expect(marks.map((pin) => pin.kind)).toEqual(expect.arrayContaining(['info', 'firstaid', 'luggage', 'water', 'wristband', 'food', 'eating', 'shop', 'artist']))
    expect(marks.every((pin) => pin.mapIcon && pin.spot)).toBe(true)
    expect(marks.find((pin) => pin.kind === 'wristband')).toMatchObject({ name: '티켓 부스 (대략)', rank: 0, caption: '티켓 부스' })
    expect(marks.find((pin) => pin.kind === 'toilet')?.detail).toBe('Mint Breeze')
  })

  test('lists no stages (the map names them): only the official pins and the subway exits', () => {
    expect(festival.pins.filter((pin) => pin.kind === 'stage')).toHaveLength(0)
    expect(festival.pins).toHaveLength(32 + 13)
  })

  test('uses stable ids so re-adding replaces instead of duplicating', () => {
    expect(createGrandMint2026()).toEqual(festival)
  })
})
