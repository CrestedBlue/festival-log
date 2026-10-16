import { describe, expect, test } from 'vitest'
import { hasIdCollision } from '../actions'
import { createSampleFestival } from '../sample'
import { FestivalSchema } from '../schema'
import { makeData } from '../testFixtures'
import { festivalMapFor } from '../../features/map/festivalMaps'
import { isInsideBounds } from '../../lib/geo'
import { GRAND_MINT_2026_ID, createGrandMint2026 } from './grandMint2026'

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

  test('puts every pin on the bundled map image, including both subway exits', () => {
    const map = festivalMapFor(GRAND_MINT_2026_ID)
    expect(map).not.toBeNull()
    expect(festival.pins.every((pin) => map && isInsideBounds(pin, map.bounds))).toBe(true)
    expect(festival.pins.filter((pin) => pin.name.includes('출구'))).toHaveLength(2)
  })

  test('marks the zones whose position is estimated', () => {
    const estimated = festival.pins.filter((pin) => pin.name.includes('(대략)')).map((pin) => pin.name.split(' ·')[0])
    expect(estimated).toEqual(expect.arrayContaining(['Radar', 'Hungry Zone', '티켓 부스 (대략)']))
  })

  test('uses stable ids so re-adding replaces instead of duplicating', () => {
    expect(createGrandMint2026()).toEqual(festival)
  })

  test('does not collide with the sample festival', () => {
    let n = 0
    const sample = createSampleFestival(new Date(2026, 9, 16), () => `sample-${n++}`)
    expect(hasIdCollision(makeData({ festivals: [sample] }), festival)).toBe(false)
  })
})
