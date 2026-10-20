import { migrateV1 } from './migrate'
import { EMPTY_USER_DATA, LegacyAppDataSchema, UserDataSchema, type UserData } from './schema'
import { mergeCatalogTwins } from './twins'

export const STORAGE_KEY = 'festival-log:data'
export const BACKUP_KEY_PREFIX = 'festival-log:backup-'

type ReadableStorage = Pick<Storage, 'getItem' | 'setItem'>

export type LoadResult =
  | { status: 'ok'; data: UserData }
  | { status: 'migrated'; data: UserData }
  | { status: 'empty'; data: UserData }
  | { status: 'corrupted'; data: UserData; error: string; backedUp: boolean }

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

type ReadResult = { ok: true; data: UserData; migrated: boolean } | { ok: false; error: string }

/** Festivals the user made that the catalog now has too are folded into it (see mergeCatalogTwins). */
function withTwinsMerged(data: UserData, migrated: boolean): ReadResult {
  const merged = mergeCatalogTwins(data)
  return { ok: true, data: merged, migrated: migrated || merged !== data }
}

/** Validation must never take the app down, whatever is on disk. Older formats are migrated. */
function read(raw: string): ReadResult {
  try {
    const json = tryParseJson(raw)
    const current = UserDataSchema.safeParse(json)
    if (current.success) return withTwinsMerged(current.data, false)
    const legacy = LegacyAppDataSchema.safeParse(json)
    if (legacy.success) return withTwinsMerged(migrateV1(legacy.data), true)
    return { ok: false, error: current.error.message }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}

/** Never silently drop what's on disk: unreadable data is copied to a backup key first. */
export function loadUserData(storage: ReadableStorage, now: () => number = Date.now): LoadResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return { status: 'empty', data: EMPTY_USER_DATA }
  const result = read(raw)
  if (result.ok) return { status: result.migrated ? 'migrated' : 'ok', data: result.data }
  try {
    storage.setItem(`${BACKUP_KEY_PREFIX}${now()}`, raw)
    return { status: 'corrupted', data: EMPTY_USER_DATA, error: result.error, backedUp: true }
  } catch (error) {
    console.error('[festival-log] failed to back up corrupted data', error)
    return { status: 'corrupted', data: EMPTY_USER_DATA, error: result.error, backedUp: false }
  }
}

export function saveUserData(storage: ReadableStorage, data: UserData): { ok: true } | { ok: false; error: string } {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    console.error('[festival-log] failed to save data', error)
    return { ok: false, error: '저장 공간이 부족하거나 브라우저가 저장을 막았어요.' }
  }
}
