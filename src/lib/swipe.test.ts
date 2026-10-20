import { describe, expect, test } from 'vitest'
import { swipeDecision } from './swipe'

const WIDTH = 340

describe('swipeDecision', () => {
  test('a drag past about a third of the width throws it to that side', () => {
    expect(swipeDecision(130, WIDTH, 0)).toBe('right')
    expect(swipeDecision(-130, WIDTH, 0)).toBe('left')
  })

  test('a quick flick is enough even when short', () => {
    expect(swipeDecision(40, WIDTH, 0.8)).toBe('right')
    expect(swipeDecision(-40, WIDTH, -0.8)).toBe('left')
  })

  test('a short slow drag, a tiny twitch, or a flick back towards the start stays put', () => {
    expect(swipeDecision(60, WIDTH, 0.1)).toBeNull()
    expect(swipeDecision(10, WIDTH, 2)).toBeNull()
    expect(swipeDecision(60, WIDTH, -1)).toBeNull()
  })
})
