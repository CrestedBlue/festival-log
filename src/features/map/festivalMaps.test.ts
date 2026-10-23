import { describe, expect, test } from 'vitest'
import { GRAND_MINT_SERIES, HERO_ROCK_SERIES, PENTAPORT_SERIES } from '../../data/catalog/ids'
import { isInsideBounds } from '../../lib/geo'
import { parseMapMeta, seriesMapFor, withImages } from './festivalMaps'

describe('parseMapMeta', () => {
  const valid = {
    attribution: 'test',
    bounds: [
      [37.5, 127.1],
      [37.6, 127.2],
    ],
    initialView: [
      [37.52, 127.12],
      [37.58, 127.18],
    ],
    anchors: { stage: [37.55, 127.15] },
  }

  test('accepts well-formed metadata', () => {
    expect(parseMapMeta(valid).bounds).toEqual([
      [37.5, 127.1],
      [37.6, 127.2],
    ])
  })

  test('rejects bounds whose south-west is not below the north-east', () => {
    expect(() => parseMapMeta({ ...valid, bounds: [[37.6, 127.2], [37.5, 127.1]] })).toThrow()
  })

  test('reads official marks', () => {
    const meta = parseMapMeta({ ...valid, marks: [{ id: 1, kind: 'toilet', zone: 'Mint Breeze', lat: 37.55, lng: 127.15 }] })
    expect(meta.marks).toEqual([{ id: 1, kind: 'toilet', zone: 'Mint Breeze', lat: 37.55, lng: 127.15 }])
  })

  test('rejects marks outside the image or without a kind', () => {
    expect(() => parseMapMeta({ ...valid, marks: [{ id: 1, kind: 'toilet', zone: 'x', lat: 36, lng: 127 }] })).toThrow()
    expect(() => parseMapMeta({ ...valid, marks: [{ id: 2, zone: 'x', lat: 37.55, lng: 127.15 }] })).toThrow()
  })

  test('reads the colour around the image, ignoring anything that is not a hex colour', () => {
    expect(parseMapMeta({ ...valid, background: '#ffffff' }).background).toBe('#ffffff')
    expect(parseMapMeta({ ...valid, background: 'url(x)' }).background).toBeNull()
    expect(parseMapMeta(valid).background).toBeNull()
  })

  test('reads where the map draws its places and marks, to make them tappable', () => {
    const meta = parseMapMeta({
      ...valid,
      anchorTaps: { stage: 30 },
      marks: [{ id: 1, kind: 'toilet', zone: '', lat: 37.55, lng: 127.15, tap: { lat: 37.551, lng: 127.151, radius: 10 } }],
    })
    expect(meta.anchorTaps).toEqual({ stage: 30 })
    expect(meta.marks[0]?.tap).toEqual({ lat: 37.551, lng: 127.151, radius: 10 })
  })

  test('rejects a tap area without an anchor, without a radius, or outside the image', () => {
    expect(() => parseMapMeta({ ...valid, anchorTaps: { missing: 30 } })).toThrow()
    expect(() => parseMapMeta({ ...valid, anchorTaps: { stage: 0 } })).toThrow()
    expect(() => parseMapMeta({ ...valid, marks: [{ id: 1, kind: 'toilet', zone: '', lat: 37.55, lng: 127.15, tap: { lat: 36, lng: 127, radius: 10 } }] })).toThrow()
  })

  test('rejects anchors outside the image', () => {
    expect(() => parseMapMeta({ ...valid, anchors: { far: [36, 127] } })).toThrow()
  })
})

describe('withImages', () => {
  const meta = parseMapMeta({
    bounds: [
      [37.5, 127.1],
      [37.6, 127.2],
    ],
    initialView: [
      [37.52, 127.12],
      [37.58, 127.18],
    ],
    layers: [
      { file: 'ground.svg', bounds: [[37.5, 127.1], [37.6, 127.2]] },
      { file: 'pins.svg', bounds: [[37.52, 127.12], [37.58, 127.18]] },
    ],
  })

  test('gives each listed layer its own image, bottom first', () => {
    const map = withImages(meta, { 'ground.svg': '/g.svg', 'pins.svg': '/p.svg' })
    expect(map.layers.map((l) => l.url)).toEqual(['/g.svg', '/p.svg'])
    expect(map.layers[1]?.bounds).toEqual([
      [37.52, 127.12],
      [37.58, 127.18],
    ])
  })

  test('fails when a listed layer is not bundled', () => {
    expect(() => withImages(meta, { 'ground.svg': '/g.svg' })).toThrow()
  })

  test('rejects a layer reaching outside the map', () => {
    expect(() => parseMapMeta({ bounds: [[37.5, 127.1], [37.6, 127.2]], initialView: [[37.52, 127.12], [37.58, 127.18]], layers: [{ file: 'x.svg', bounds: [[37.4, 127.1], [37.6, 127.2]] }] })).toThrow()
  })

  test('one image covers the whole map', () => {
    expect(withImages(meta, '/one.webp').layers).toEqual([{ url: '/one.webp', bounds: meta.bounds }])
  })
})

describe('seriesMapFor', () => {
  test('returns the bundled Grand Mint map by festival code, and nothing for festivals without one', () => {
    expect(seriesMapFor(GRAND_MINT_SERIES)?.layers[0]?.url).toBeTruthy()
    expect(seriesMapFor(HERO_ROCK_SERIES)).toBeNull()
  })

  test('returns the layered Pentaport map: the big ground under the venue layers, with its places inside it', () => {
    const map = seriesMapFor(PENTAPORT_SERIES)
    expect(map?.layers).toHaveLength(4)
    for (const layer of map?.layers ?? []) expect(layer.url).toBeTruthy()
    for (const key of ['kbStage', 'monsterStage', 'stanleyStage', 'gate1', 'gate2', 'securityCheck']) {
      const point = map?.anchors[key]
      expect(point, key).toBeDefined()
      const venue = map?.layers[1]?.bounds
      expect(venue && point && isInsideBounds({ lat: point[0], lng: point[1] }, venue)).toBe(true)
    }
    expect(map?.marks.length).toBeGreaterThan(0)
  })
})
