import { describe, expect, test } from 'vitest'
import { festivalMapFor, parseMapMeta } from './festivalMaps'

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

  test('rejects anchors outside the image', () => {
    expect(() => parseMapMeta({ ...valid, anchors: { far: [36, 127] } })).toThrow()
  })
})

describe('festivalMapFor', () => {
  test('returns the bundled Grand Mint 2026 map and nothing for other festivals', () => {
    expect(festivalMapFor('gmf2026')?.imageUrl).toBeTruthy()
    expect(festivalMapFor('someone-else')).toBeNull()
  })
})
