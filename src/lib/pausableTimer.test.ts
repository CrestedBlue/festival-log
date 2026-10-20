import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createPausableTimer } from './pausableTimer'

describe('createPausableTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('fires once the time is up', () => {
    const done = vi.fn()
    createPausableTimer(6000, done)
    vi.advanceTimersByTime(5999)
    expect(done).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(done).toHaveBeenCalledOnce()
  })

  test('a pause holds the remaining time until it resumes', () => {
    const done = vi.fn()
    const timer = createPausableTimer(6000, done)
    vi.advanceTimersByTime(4000)
    timer.pause()
    vi.advanceTimersByTime(10000)
    expect(done).not.toHaveBeenCalled()
    timer.resume()
    vi.advanceTimersByTime(1999)
    expect(done).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(done).toHaveBeenCalledOnce()
  })

  test('cancel stops it for good, and pausing or resuming twice changes nothing', () => {
    const done = vi.fn()
    const timer = createPausableTimer(6000, done)
    timer.pause()
    timer.pause()
    timer.resume()
    timer.resume()
    timer.cancel()
    timer.resume()
    vi.advanceTimersByTime(20000)
    expect(done).not.toHaveBeenCalled()
  })
})
