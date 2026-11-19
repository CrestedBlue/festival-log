import { describe, expect, test } from 'vitest'
import type { Pin } from '../../data/schema'
import type { FestivalMap } from './festivalMaps'
import { floorLabel, mapFloors, mapOnFloor, pinFloor, pinsOnFloor } from './floors'

const pin = (id: string, floor?: number): Pin => ({ id, name: id, kind: 'etc', lat: 37.5, lng: 127.1, ...(floor === undefined ? {} : { floor }) })
const bounds: FestivalMap['bounds'] = [[37.5, 127.1], [37.6, 127.2]]
const map = (over: Partial<FestivalMap> = {}): FestivalMap => ({
  layers: [{ url: 'big.svg', bounds }, { url: 'f1.svg', bounds, floor: 1 }, { url: 'f2.svg', bounds, floor: 2 }],
  bounds, initialView: bounds, maxZoom: null, fillOnOpen: false, zoomOutFills: true, attribution: '', background: null,
  marks: [], icons: {},
  labels: [
    { text: 'WONDER STAGE', kind: 'stage', minZoom: 15, lat: 37.55, lng: 127.15, floor: 1 },
    { text: '킨텍스역', kind: 'station', minZoom: 14, lat: 37.55, lng: 127.15 },
  ],
  ...over,
})

describe('pinFloor', () => {
  test('is the ground floor for a pin that names none', () => {
    expect(pinFloor(pin('a'))).toBe(1)
    expect(pinFloor(pin('b', 2))).toBe(2)
  })
})

describe('pinsOnFloor', () => {
  test('keeps the pins of that floor, the unnamed ones on the ground floor', () => {
    const pins = [pin('a'), pin('b', 2), pin('c', 1), pin('d', 2)]
    expect(pinsOnFloor(pins, 1).map((p) => p.id)).toEqual(['a', 'c'])
    expect(pinsOnFloor(pins, 2).map((p) => p.id)).toEqual(['b', 'd'])
  })

  test('returns the same pins when the map has no floors to tell apart', () => {
    const pins = [pin('a'), pin('b', 2)]
    expect(pinsOnFloor(pins, null)).toBe(pins)
  })
})

describe('mapFloors', () => {
  test('lists the floors the layers are drawn for, lowest first', () => {
    expect(mapFloors(map())).toEqual([1, 2])
  })

  test('is empty for a map of one floor, or none', () => {
    expect(mapFloors(map({ layers: [{ url: 'a.svg', bounds }] }))).toEqual([])
    expect(mapFloors(map({ layers: [{ url: 'a.svg', bounds, floor: 1 }] }))).toEqual([])
    expect(mapFloors(null)).toEqual([])
  })
})

describe('mapOnFloor', () => {
  test('keeps the layers for every floor and for that floor, bottom first', () => {
    expect(mapOnFloor(map(), 1).layers.map((l) => l.url)).toEqual(['big.svg', 'f1.svg'])
    expect(mapOnFloor(map(), 2).layers.map((l) => l.url)).toEqual(['big.svg', 'f2.svg'])
  })

  test('keeps the names of that floor and the ones outside the building', () => {
    expect(mapOnFloor(map(), 1).labels.map((l) => l.text)).toEqual(['WONDER STAGE', '킨텍스역'])
    expect(mapOnFloor(map(), 2).labels.map((l) => l.text)).toEqual(['킨텍스역'])
  })
})

describe('floorLabel', () => {
  test('writes the floor as on the building', () => {
    expect(floorLabel(1)).toBe('1F')
    expect(floorLabel(2)).toBe('2F')
  })
})
