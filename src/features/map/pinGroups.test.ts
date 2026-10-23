import { describe, expect, test } from 'vitest'
import type { Pin } from '../../data/schema'
import { groupPins } from './pinGroups'

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

  test('sorts by the distance to the nearest pin of each row', () => {
    const rows = groupPins(pins, { lat: 37.5, lng: 127 })
    expect(rows.map((r) => r.label)).toEqual(['화장실 2개', 'KB STAGE', '개수대'])
    expect(rows[0]?.distance).toBeCloseTo(55.7, 0)
  })
})
