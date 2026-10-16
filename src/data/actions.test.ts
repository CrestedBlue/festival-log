import { describe, expect, test } from 'vitest'
import {
  addFestival,
  addPerformances,
  addPin,
  addStage,
  hasIdCollision,
  importFestival,
  removeFestival,
  removePerformance,
  removePin,
  removeStage,
  toggleFavorite,
  updateFestival,
} from './actions'
import { makeData, makeFestival } from './testFixtures'

describe('festival actions', () => {
  test('addFestival appends and activates the new festival without mutating input', () => {
    const data = makeData()
    const next = addFestival(data, makeFestival({ id: 'f2', name: '두번째' }))
    expect(next.festivals.map((f) => f.id)).toEqual(['f1', 'f2'])
    expect(next.activeFestivalId).toBe('f2')
    expect(data.festivals).toHaveLength(1)
  })

  test('updateFestival patches only the matching festival', () => {
    const next = updateFestival(makeData(), 'f1', { name: '바뀐 이름' })
    expect(next.festivals[0]?.name).toBe('바뀐 이름')
    expect(next.festivals[0]?.stages).toHaveLength(1)
  })

  test('removeFestival drops it, its favorites, and moves the active pointer', () => {
    const data = makeData({
      festivals: [makeFestival(), makeFestival({ id: 'f2', performances: [] })],
      favorites: ['p1'],
    })
    const next = removeFestival(data, 'f1')
    expect(next.festivals.map((f) => f.id)).toEqual(['f2'])
    expect(next.favorites).toEqual([])
    expect(next.activeFestivalId).toBe('f2')
  })

  test('removeFestival clears the active pointer when nothing is left', () => {
    expect(removeFestival(makeData(), 'f1').activeFestivalId).toBeNull()
  })
})

describe('stage and performance actions', () => {
  test('addStage appends a stage', () => {
    const next = addStage(makeData(), 'f1', { id: 's2', name: '서브', color: '#3d5afe' })
    expect(next.festivals[0]?.stages.map((s) => s.id)).toEqual(['s1', 's2'])
  })

  test('removeStage also removes its performances and their favorites', () => {
    const next = removeStage(makeData({ favorites: ['p1'] }), 'f1', 's1')
    expect(next.festivals[0]?.stages).toEqual([])
    expect(next.festivals[0]?.performances).toEqual([])
    expect(next.favorites).toEqual([])
  })

  test('addPerformances appends a batch', () => {
    const next = addPerformances(makeData(), 'f1', [
      { id: 'p2', stageId: 's1', day: '2026-10-17', artist: 'B', start: '19:30', end: '20:30' },
    ])
    expect(next.festivals[0]?.performances.map((p) => p.id)).toEqual(['p1', 'p2'])
  })

  test('removePerformance removes the set and its favorite', () => {
    const next = removePerformance(makeData({ favorites: ['p1'] }), 'f1', 'p1')
    expect(next.festivals[0]?.performances).toEqual([])
    expect(next.favorites).toEqual([])
  })

  test('toggleFavorite adds then removes an id', () => {
    const once = toggleFavorite(makeData(), 'p1')
    expect(once.favorites).toEqual(['p1'])
    expect(toggleFavorite(once, 'p1').favorites).toEqual([])
  })
})

describe('pin actions', () => {
  test('addPin and removePin', () => {
    const pin = { id: 'pin1', name: '만남의 장소', kind: 'meet' as const, lat: 37.56, lng: 126.87 }
    const added = addPin(makeData(), 'f1', pin)
    expect(added.festivals[0]?.pins).toEqual([pin])
    expect(removePin(added, 'f1', 'pin1').festivals[0]?.pins).toEqual([])
  })
})

describe('importFestival', () => {
  test('hasIdCollision detects performance ids already used by another festival', () => {
    const data = makeData()
    expect(hasIdCollision(data, makeFestival({ id: 'f2' }))).toBe(true)
    expect(hasIdCollision(data, makeFestival())).toBe(false)
    expect(hasIdCollision(data, makeFestival({ id: 'f2', performances: [] }))).toBe(false)
  })

  test('appends an unknown festival and activates it', () => {
    const next = importFestival(makeData(), makeFestival({ id: 'f9' }))
    expect(next.festivals.map((f) => f.id)).toEqual(['f1', 'f9'])
    expect(next.activeFestivalId).toBe('f9')
  })

  test('replaces an existing festival with the same id and keeps still-valid favorites', () => {
    const data = makeData({ favorites: ['p1', 'gone'] })
    const incoming = makeFestival({ name: '업데이트됨' })
    const next = importFestival(data, incoming)
    expect(next.festivals).toHaveLength(1)
    expect(next.festivals[0]?.name).toBe('업데이트됨')
    expect(next.favorites).toEqual(['p1', 'gone'])
  })
})
