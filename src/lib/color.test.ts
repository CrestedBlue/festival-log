import { describe, expect, test } from 'vitest'
import { mixOklab } from './color'

const channels = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))

describe('mixOklab', () => {
  test('returns either color at the ends', () => {
    expect(mixOklab('#2f8f62', '#fffcf4', 1)).toBe('#2f8f62')
    expect(mixOklab('#2f8f62', '#fffcf4', 0)).toBe('#fffcf4')
  })

  test('matches CSS color-mix(in oklab) for the starred set fill', () => {
    // What the browser computed for color-mix(in oklab, <stage> 34%, #fffcf4).
    const cases: Array<[string, number[]]> = [
      ['#2f8f62', [188, 215, 192]],
      ['#e2603f', [251, 201, 183]],
    ]
    for (const [stage, expected] of cases) {
      const got = channels(mixOklab(stage, '#fffcf4', 0.34))
      got.forEach((value, i) => expect(Math.abs(value - (expected[i] ?? 0))).toBeLessThanOrEqual(1))
    }
  })

  test('rejects anything but #rrggbb', () => {
    expect(() => mixOklab('red', '#ffffff', 0.5)).toThrow()
  })
})
