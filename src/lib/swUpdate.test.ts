import { describe, expect, test, vi } from 'vitest'
import { UPDATE_CHECK_INTERVAL_MS, UPDATE_CHECK_MIN_GAP_MS, watchForUpdates, type UpdateWatchEnv } from './swUpdate'

function makeEnv(overrides: Partial<UpdateWatchEnv> = {}) {
  let onVisible: (() => void) | null = null
  let onTimer: (() => void) | null = null
  let now = 1_000_000
  const env: UpdateWatchEnv = {
    isVisible: () => true,
    isOnline: () => true,
    now: () => now,
    onBecomeVisible: (listener) => {
      onVisible = listener
    },
    every: (_ms, listener) => {
      onTimer = listener
    },
    ...overrides,
  }
  return {
    env,
    show: () => onVisible?.(),
    tick: () => onTimer?.(),
    advance: (ms: number) => {
      now += ms
    },
  }
}

describe('watchForUpdates', () => {
  test('asks for a new version when the app comes back to the screen', () => {
    // Arrange
    const update = vi.fn(() => Promise.resolve())
    const { env, show, advance } = makeEnv()
    watchForUpdates({ update }, env)

    // Act
    advance(UPDATE_CHECK_MIN_GAP_MS)
    show()

    // Assert
    expect(update).toHaveBeenCalledTimes(1)
  })

  test('asks again on a timer while the app stays open', () => {
    const update = vi.fn(() => Promise.resolve())
    const every = vi.fn()
    watchForUpdates({ update }, makeEnv({ every }).env)
    expect(every).toHaveBeenCalledWith(UPDATE_CHECK_INTERVAL_MS, expect.any(Function))
  })

  test('does not ask twice in a short time (switching apps back and forth)', () => {
    const update = vi.fn(() => Promise.resolve())
    const { env, show, advance } = makeEnv()
    watchForUpdates({ update }, env)
    advance(UPDATE_CHECK_MIN_GAP_MS)
    show()
    advance(UPDATE_CHECK_MIN_GAP_MS - 1)
    show()
    expect(update).toHaveBeenCalledTimes(1)
  })

  test('does not ask with no signal or while the app is hidden', () => {
    const update = vi.fn(() => Promise.resolve())
    const offline = makeEnv({ isOnline: () => false })
    watchForUpdates({ update }, offline.env)
    offline.advance(UPDATE_CHECK_MIN_GAP_MS)
    offline.show()
    const hidden = makeEnv({ isVisible: () => false })
    watchForUpdates({ update }, hidden.env)
    hidden.advance(UPDATE_CHECK_MIN_GAP_MS)
    hidden.tick()
    expect(update).not.toHaveBeenCalled()
  })

  test('a failed check is logged, not thrown', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const update = vi.fn(() => Promise.reject(new Error('offline')))
    const { env, show, advance } = makeEnv()
    watchForUpdates({ update }, env)
    advance(UPDATE_CHECK_MIN_GAP_MS)
    show()
    await Promise.resolve()
    await Promise.resolve()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
