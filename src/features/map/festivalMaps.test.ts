import { describe, expect, test } from 'vitest'
import { GRAND_MINT_SERIES, HERO_ROCK_SERIES, PENTAPORT_SERIES } from '../../data/catalog/ids'
import { isInsideBounds } from '../../lib/geo'
import { parseMapMeta, seriesMapFor } from './festivalMaps'

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

  test('rejects anchors outside the image', () => {
    expect(() => parseMapMeta({ ...valid, anchors: { far: [36, 127] } })).toThrow()
  })
})

describe('seriesMapFor', () => {
  test('returns the bundled Grand Mint map by festival code, and nothing for festivals without one', () => {
    expect(seriesMapFor(GRAND_MINT_SERIES)?.imageUrl).toBeTruthy()
    expect(seriesMapFor(HERO_ROCK_SERIES)).toBeNull()
  })

  test('returns the Pentaport map laid onto real coordinates, with its drawn places inside it', () => {
    const map = seriesMapFor(PENTAPORT_SERIES)
    expect(map?.imageUrl).toBeTruthy()
    for (const key of ['kbStage', 'monsterStage', 'stanleyStage', 'gate1', 'gate2', 'ticketBooth1', 'ticketBooth2']) {
      const point = map?.anchors[key]
      expect(point, key).toBeDefined()
      expect(map && point && isInsideBounds({ lat: point[0], lng: point[1] }, map.bounds)).toBe(true)
    }
  })
})
