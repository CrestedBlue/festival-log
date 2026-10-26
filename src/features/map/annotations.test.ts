import { describe, expect, test } from 'vitest'
import type { Pin } from '../../data/schema'
import { buildAnnotations, iconSize, placeAnnotations, type Annotation } from './annotations'
import type { FestivalMap } from './festivalMaps'

const map = {
  icons: { toilet: '/toilet.svg', ticket: '/ticket.svg', station: '/station.svg' },
  labels: [
    { text: '송도달빛축제공원역', kind: 'station', icon: 'station', minZoom: 14, lat: 37.4, lng: 126.6 },
    { text: '푸르지오시티', kind: 'building', minZoom: 15.5, lat: 37.4, lng: 126.6 },
  ],
} as unknown as FestivalMap
const pin = (id: string, mapIcon: string, extra: Partial<Pin> = {}): Pin => ({ id, name: id, kind: 'etc', lat: 37.401, lng: 126.601, mapIcon, ...extra })
const pins = [pin('wc', 'toilet'), pin('booth', 'ticket', { caption: '제1 티켓부스' }), pin('mine', 'nothing')]
const keys = (zoom: number, selected: string | null = null) => buildAnnotations(map, pins, zoom, selected).map((a) => a.key)

describe('buildAnnotations', () => {
  test('far out: only the station and named places, no plain pins', () => {
    expect(keys(15)).toEqual(['label:0', 'pin:booth'])
  })

  test('closer in: buildings and every pin the map has an icon for', () => {
    expect(keys(16.5)).toEqual(['label:0', 'label:1', 'pin:wc', 'pin:booth'])
  })

  test('a selected pin shows at any zoom', () => {
    expect(keys(14, 'wc')).toContain('pin:wc')
  })

  test('the pins of the list row last tapped show at any zoom, ahead of everything but the selected pin', () => {
    const items = buildAnnotations(map, pins, 14, null, new Set(['wc']))
    expect(items.map((a) => a.key)).toContain('pin:wc')
    const wc = items.find((a) => a.key === 'pin:wc')!
    expect(Math.max(...items.filter((a) => a !== wc).map((a) => a.priority))).toBeLessThan(wc.priority)
  })

  test('names that may make room move a line up or down; buildings and stops stay put', () => {
    const nudges = (zoom: number) => Object.fromEntries(buildAnnotations(map, pins, zoom, null).map((a) => [a.key, a.nudges.length]))
    expect(nudges(16.5)).toMatchObject({ 'label:0': 3, 'label:1': 0 })
  })

  test('icons grow a step at a time as the map zooms in', () => {
    expect([iconSize(16.5), iconSize(17.2), iconSize(18.5)]).toEqual([20, 24, 30])
  })
})

describe('placeAnnotations', () => {
  const item = (key: string, priority: number, x: number): Annotation & { x: number } => ({
    key,
    lat: 0,
    lng: 0,
    x,
    priority,
    box: { left: -10, top: -10, width: 20, height: 20 },
    nudges: [],
    view: { type: 'label', label: map.labels[0]!, iconUrl: null, font: 12 },
  })

  const x = (a: Annotation) => ({ x: (a as Annotation & { x: number }).x, y: 0 })

  test('leaves out what would overlap something more important', () => {
    const items = [item('low', 40, 0), item('high', 100, 5), item('apart', 40, 100)]
    expect([...placeAnnotations(items, x).keys()].sort()).toEqual(['apart', 'high'])
  })

  test('never leaves out the selected or active pins, even on top of each other', () => {
    const items = [item('a', 900, 0), item('b', 900, 2), item('c', 1000, 4), item('name', 100, 3)]
    expect([...placeAnnotations(items, x).keys()].sort()).toEqual(['a', 'b', 'c'])
  })

  test('moves a name to one of its nudges when its own place is taken', () => {
    const nudged = { ...item('name', 40, 0), nudges: [{ dx: 0, dy: -30 }] }
    const placed = placeAnnotations([item('high', 100, 5), nudged], x)
    expect(placed.get('name')).toEqual({ dx: 0, dy: -30 })
    expect(placed.get('high')).toEqual({ dx: 0, dy: 0 })
  })
})
