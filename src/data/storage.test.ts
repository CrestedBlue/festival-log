import { describe, expect, test } from 'vitest'
import { BACKUP_KEY_PREFIX, STORAGE_KEY, loadAppData, saveAppData } from './storage'
import { makeData } from './testFixtures'

const memoryStorage = (initial: Record<string, string> = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
  }
}

describe('loadAppData', () => {
  test('returns status "empty" when nothing is stored', () => {
    expect(loadAppData(memoryStorage()).status).toBe('empty')
  })

  test('round-trips data saved with saveAppData', () => {
    const storage = memoryStorage()
    expect(saveAppData(storage, makeData())).toEqual({ ok: true })
    const loaded = loadAppData(storage)
    expect(loaded.status).toBe('ok')
    expect(loaded.data).toEqual(makeData())
  })

  test('backs up corrupted data instead of discarding it', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{"version":1,"festivals":"oops"}' })
    const loaded = loadAppData(storage, () => 123)
    expect(loaded.status).toBe('corrupted')
    expect(loaded.data.festivals).toEqual([])
    expect(storage.map.get(`${BACKUP_KEY_PREFIX}123`)).toBe('{"version":1,"festivals":"oops"}')
  })

  test('treats impossible clock values as corrupted instead of throwing', () => {
    const data = makeData()
    const broken = {
      ...data,
      festivals: data.festivals.map((f) => ({
        ...f,
        performances: f.performances.map((p) => ({ ...p, start: '25:99' })),
      })),
    }
    const loaded = loadAppData(memoryStorage({ [STORAGE_KEY]: JSON.stringify(broken) }))
    expect(loaded.status).toBe('corrupted')
  })

  test('reports when the backup of corrupted data could not be written', () => {
    const storage = {
      getItem: () => '{not json',
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const loaded = loadAppData(storage)
    expect(loaded.status === 'corrupted' && loaded.backedUp).toBe(false)
  })

  test('treats invalid JSON as corrupted', () => {
    expect(loadAppData(memoryStorage({ [STORAGE_KEY]: '{not json' })).status).toBe('corrupted')
  })
})

describe('saveAppData', () => {
  test('reports a friendly error when storage throws (e.g. quota exceeded)', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const result = saveAppData(storage, makeData())
    expect(result.ok).toBe(false)
  })
})
