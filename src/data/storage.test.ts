import { describe, expect, test } from 'vitest'
import { GRAND_MINT_2026_ID } from './catalog/ids'
import { BACKUP_KEY_PREFIX, STORAGE_KEY, loadUserData, saveUserData } from './storage'
import { makeFestival, makeUserData } from './testFixtures'

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

describe('loadUserData', () => {
  test('returns status "empty" when nothing is stored', () => {
    expect(loadUserData(memoryStorage()).status).toBe('empty')
  })

  test('round-trips data saved with saveUserData', () => {
    const storage = memoryStorage()
    const data = makeUserData({ myFestivalIds: [GRAND_MINT_2026_ID], activeFestivalId: GRAND_MINT_2026_ID, favorites: ['x'] })
    expect(saveUserData(storage, data)).toEqual({ ok: true })
    expect(loadUserData(storage)).toEqual({ status: 'ok', data })
  })

  test('migrates data saved by the previous app version', () => {
    const v1 = { version: 1, activeFestivalId: 'gmf2026', festivals: [makeFestival({ id: 'gmf2026' })], favorites: [] }
    const loaded = loadUserData(memoryStorage({ [STORAGE_KEY]: JSON.stringify(v1) }))
    expect(loaded.status).toBe('migrated')
    expect(loaded.data.myFestivalIds).toEqual([GRAND_MINT_2026_ID])
  })

  test('backs up corrupted data instead of discarding it', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{"version":2,"myFestivalIds":"oops"}' })
    const loaded = loadUserData(storage, () => 123)
    expect(loaded.status).toBe('corrupted')
    expect(loaded.data.myFestivalIds).toEqual([])
    expect(storage.map.get(`${BACKUP_KEY_PREFIX}123`)).toBe('{"version":2,"myFestivalIds":"oops"}')
  })

  test('treats impossible clock values in an archived festival as corrupted instead of throwing', () => {
    const broken = makeFestival({
      performances: [{ id: 'p1', stageId: 's1', day: '2026-10-17', artist: 'A', start: '25:99', end: '19:00' }],
    })
    const data = makeUserData({ archivedFestivals: [broken] })
    expect(loadUserData(memoryStorage({ [STORAGE_KEY]: JSON.stringify(data) })).status).toBe('corrupted')
  })

  test('reports when the backup of corrupted data could not be written', () => {
    const storage = {
      getItem: () => '{not json',
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const loaded = loadUserData(storage)
    expect(loaded.status === 'corrupted' && loaded.backedUp).toBe(false)
  })
})

describe('saveUserData', () => {
  test('reports a friendly error when storage throws (e.g. quota exceeded)', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(saveUserData(storage, makeUserData()).ok).toBe(false)
  })
})
