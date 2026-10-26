import { describe, expect, test } from 'vitest'
import { releaseSlide, settleMs, slideIndexAt } from './carousel'

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

describe('releaseSlide', () => {
  // velocity: px/ms the strip was scrolling when let go (+ = towards the next slide)
  test('a slow release settles on the nearest slide', () => {
    expect(releaseSlide({ scrollLeft: 100, slideWidth: 300, count: 5, velocity: 0.05 })).toBe(0)
    expect(releaseSlide({ scrollLeft: 200, slideWidth: 300, count: 5, velocity: -0.05 })).toBe(1)
  })

  test('a flick goes one slide on in its direction, however short the drag', () => {
    expect(releaseSlide({ scrollLeft: 40, slideWidth: 300, count: 5, velocity: 0.8 })).toBe(1)
    expect(releaseSlide({ scrollLeft: 260, slideWidth: 300, count: 5, velocity: -0.8 })).toBe(0)
  })

  test('never more than one slide on, and never past either end', () => {
    expect(releaseSlide({ scrollLeft: 300, slideWidth: 300, count: 5, velocity: 9 })).toBe(2)
    expect(releaseSlide({ scrollLeft: 1200, slideWidth: 300, count: 5, velocity: 2 })).toBe(4)
    expect(releaseSlide({ scrollLeft: 0, slideWidth: 300, count: 5, velocity: -2 })).toBe(0)
  })
})

describe('settleMs', () => {
  test('carries on at the speed the finger let go with (an ease-out that starts at that speed)', () => {
    expect(settleMs(150, 0.5)).toBe(600) // 2 × 150 px ÷ 0.5 px/ms
    expect(settleMs(300, 2)).toBe(300)
  })

  test('within bounds: never a jump, never a crawl after a slow release', () => {
    expect(settleMs(10, 3)).toBe(200)
    expect(settleMs(250, 0.05)).toBe(800)
    expect(settleMs(0, 0)).toBe(0)
  })
})

