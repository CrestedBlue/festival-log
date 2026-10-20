import { describe, expect, test } from 'vitest'
import { slideIndexAt } from './carousel'

describe('slideIndexAt', () => {
  test('is the slide that fills most of the view', () => {
    expect(slideIndexAt(0, 300, 10)).toBe(0)
    expect(slideIndexAt(140, 300, 10)).toBe(0)
    expect(slideIndexAt(160, 300, 10)).toBe(1)
    expect(slideIndexAt(900, 300, 10)).toBe(3)
  })

  test('stays within the slides, also for an unmeasured or overscrolled strip', () => {
    expect(slideIndexAt(99999, 300, 10)).toBe(9)
    expect(slideIndexAt(-50, 300, 10)).toBe(0)
    expect(slideIndexAt(100, 0, 10)).toBe(0)
  })
})
