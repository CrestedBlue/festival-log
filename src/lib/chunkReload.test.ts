import { describe, expect, test, vi } from 'vitest'
import {
  ChunkLoadError,
  STALE_RELOAD_INTERVAL_MS,
  STALE_RELOAD_LIMIT,
  STALE_RELOAD_RESET_MS,
  clearReloadLog,
  isChunkLoadError,
  loadChunk,
  planReload,
  readReloadLog,
  writeReloadLog,
  type ReloadStorage,
} from './chunkReload'

const memoryStorage = (initial: Record<string, string> = {}): ReloadStorage & { items: Map<string, string> } => {
  const items = new Map(Object.entries(initial))
  return {
    items,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  }
}

const brokenStorage: ReloadStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
  removeItem: () => {
    throw new Error('blocked')
  },
}

describe('planReload', () => {
  test('the first failure reloads at once', () => {
    expect(planReload(null, 1000)).toEqual({ log: { count: 1, at: 1000 }, delayMs: 0 })
  })

  test('a failure soon after a reload waits before the next one', () => {
    const plan = planReload({ count: 1, at: 1000 }, 3000)
    expect(plan).toEqual({ log: { count: 2, at: 3000 }, delayMs: STALE_RELOAD_INTERVAL_MS })
  })

  test('gives up once the attempts are used up', () => {
    expect(planReload({ count: STALE_RELOAD_LIMIT - 1, at: 1000 }, 2000)?.log.count).toBe(STALE_RELOAD_LIMIT)
    expect(planReload({ count: STALE_RELOAD_LIMIT, at: 1000 }, 2000)).toBeNull()
  })

  test('a failure long after the last reload belongs to another update and starts over', () => {
    const later = 1000 + STALE_RELOAD_RESET_MS
    expect(planReload({ count: STALE_RELOAD_LIMIT, at: 1000 }, later)).toEqual({ log: { count: 1, at: later }, delayMs: 0 })
  })

  test('runs at most the limit of reloads in a row', () => {
    let log = null
    let reloads = 0
    for (let now = 0; ; now += STALE_RELOAD_INTERVAL_MS) {
      const plan = planReload(log, now)
      if (!plan) break
      log = plan.log
      reloads += 1
    }
    expect(reloads).toBe(STALE_RELOAD_LIMIT)
  })
})

describe('the reload log', () => {
  test('is written and read back', () => {
    const storage = memoryStorage()
    expect(writeReloadLog({ count: 2, at: 5000 }, storage)).toBe(true)
    expect(readReloadLog(storage)).toEqual({ count: 2, at: 5000 })
  })

  test('is cleared', () => {
    const storage = memoryStorage()
    writeReloadLog({ count: 1, at: 0 }, storage)
    clearReloadLog(storage)
    expect(readReloadLog(storage)).toBeNull()
  })

  test('reads nothing from a log that is not one', () => {
    for (const stored of ['not json', '{"count":"2","at":1}', '{"count":1.5,"at":1}', '{"count":-1,"at":1}', 'null', '[]']) {
      const storage = memoryStorage()
      storage.setItem('festival-log:chunk-reload', stored)
      expect(readReloadLog(storage)).toBeNull()
    }
  })

  test('says so when it cannot be written, so no reload runs without a count', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(writeReloadLog({ count: 1, at: 0 }, brokenStorage)).toBe(false)
    expect(writeReloadLog({ count: 1, at: 0 }, null)).toBe(false)
    expect(readReloadLog(brokenStorage)).toBeNull()
    expect(() => clearReloadLog(brokenStorage)).not.toThrow()
    vi.restoreAllMocks()
  })
})

describe('loadChunk', () => {
  test('hands over the loaded part and clears the log', async () => {
    const storage = memoryStorage()
    writeReloadLog({ count: 2, at: 0 }, storage)
    const part = { default: 'MapView' }
    await expect(loadChunk(() => Promise.resolve(part), storage)).resolves.toBe(part)
    expect(readReloadLog(storage)).toBeNull()
  })

  test('marks a part that could not be fetched', async () => {
    const storage = memoryStorage()
    writeReloadLog({ count: 1, at: 0 }, storage)
    const cause = new TypeError('Failed to fetch dynamically imported module')
    const error = await loadChunk(() => Promise.reject(cause), storage).catch((reason: unknown) => reason)
    expect(isChunkLoadError(error)).toBe(true)
    expect((error as ChunkLoadError).cause).toBe(cause)
    expect(readReloadLog(storage)).toEqual({ count: 1, at: 0 })
  })

  test('tells other errors apart', () => {
    expect(isChunkLoadError(new Error('render crashed'))).toBe(false)
    expect(isChunkLoadError(new ChunkLoadError(null))).toBe(true)
  })
})
