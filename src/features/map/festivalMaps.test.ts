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
