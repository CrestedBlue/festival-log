import { describe, expect, test } from 'vitest'
import type { Pin } from '../../data/schema'
import { groupPins, RANK } from './pinGroups'

const pin = (id: string, name: string, lat: number, group?: string): Pin => ({ id, name, kind: 'toilet', lat, lng: 127, ...(group ? { group } : {}) })

describe('groupPins', () => {
  const pins = [pin('t1', '화장실', 37.502, '화장실'), pin('s', 'KB STAGE', 37.501), pin('t2', '화장실', 37.5005, '화장실'), pin('w', '개수대', 37.503, '개수대')]

  test('lists the pins of one role as one row with their count', () => {
    const rows = groupPins(pins, null)
    expect(rows.map((r) => r.label)).toEqual(['개수대', '화장실 2개', 'KB STAGE']) // Korean order: Hangul before Latin
    expect(rows.find((r) => r.label === '화장실 2개')?.pins.map((p) => p.id)).toEqual(['t1', 't2'])
  })

  test('a role with one pin keeps the pin name', () => {
    expect(groupPins([pin('t1', '장애인 화장실', 37.5, '장애인 화장실')], null)[0]?.label).toBe('장애인 화장실')
  })

  test('without a position: rows by rank, then by kind (toilets before stages), then by name', () => {
    const ranked = [pin('s', 'KB STAGE', 37.5), { ...pin('g', 'GATE 1', 37.5, '입장'), kind: 'etc' as const, rank: 0 }, pin('t', '화장실', 37.5, '화장실')]
    expect(groupPins([{ ...ranked[0]!, kind: 'stage' }, ranked[1]!, ranked[2]!], null).map((r) => r.label)).toEqual(['GATE 1', '화장실', 'KB STAGE'])
  })

  // the user's order (2026-10-26): toilets, wash stations, cool zones, MD and food always high; barrier-free help low;
  // smoking areas last
  const role = (id: string, kind: Pin['kind'], lat: number, extra: Partial<Pin> = {}): Pin => ({ id, name: id, kind, lat, lng: 127, ...extra })
  const roles = [
    role('흡연구역', 'smoking', 37.5),
    role('배리어 프리 존', 'etc', 37.5001, { rank: RANK.barrierFree }),
    role('포토존', 'photo', 37.5002),
    role('F&B', 'food', 37.503),
    role('MD 부스', 'shop', 37.504),
    role('쿨존', 'etc', 37.505, { rank: RANK.coolZone }),
    role('개수대', 'etc', 37.506, { rank: RANK.washStation }),
    role('장애인 화장실', 'toilet', 37.507, { rank: RANK.accessibleToilet }),
    role('화장실', 'toilet', 37.508),
    role('GATE 1', 'etc', 37.509, { rank: RANK.entrance }),
  ]
  const ORDER = ['GATE 1', '화장실', '장애인 화장실', '개수대', 'F&B', '쿨존', 'MD 부스', '포토존', '배리어 프리 존', '흡연구역']

  test('without a position: the entrance, then the rows people look for all day, the rest, barrier-free help, smoking last', () => {
    expect(groupPins(roles, null).map((r) => r.label)).toEqual(ORDER)
  })

  test('with a position the order stays the same: nearer only goes first among rows of the same standing', () => {
    expect(groupPins(roles, { lat: 37.5, lng: 127 }).map((r) => r.label)).toEqual(['GATE 1', 'F&B', 'MD 부스', '쿨존', '개수대', '장애인 화장실', '화장실', '포토존', '배리어 프리 존', '흡연구역'])
  })

  test('sorts by the distance to the nearest pin of each row', () => {
    const rows = groupPins(pins, { lat: 37.5, lng: 127 })
    expect(rows.map((r) => r.label)).toEqual(['화장실 2개', 'KB STAGE', '개수대'])
    expect(rows[0]?.distance).toBeCloseTo(55.7, 0)
  })
})
