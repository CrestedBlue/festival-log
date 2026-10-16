import { AppDataSchema, EMPTY_DATA, type AppData } from './schema'

export const STORAGE_KEY = 'festival-log:data'
export const BACKUP_KEY_PREFIX = 'festival-log:backup-'

type ReadableStorage = Pick<Storage, 'getItem' | 'setItem'>

export type LoadResult =
  | { status: 'ok'; data: AppData }
  | { status: 'empty'; data: AppData }
  | { status: 'corrupted'; data: AppData; error: string; backedUp: boolean }

/** Validation must never take the app down, whatever is on disk. */
function validate(raw: string): { ok: true; data: AppData } | { ok: false; error: string } {
  try {
    const parsed = AppDataSchema.safeParse(tryParseJson(raw))
    return parsed.success ? { ok: true, data: parsed.data } : { ok: false, error: parsed.error.message }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/** Never silently drop what's on disk: unreadable data is copied to a backup key first. */
export function loadAppData(storage: ReadableStorage, now: () => number = Date.now): LoadResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return { status: 'empty', data: EMPTY_DATA }
  const result = validate(raw)
  if (result.ok) return { status: 'ok', data: result.data }
  try {
    storage.setItem(`${BACKUP_KEY_PREFIX}${now()}`, raw)
    return { status: 'corrupted', data: EMPTY_DATA, error: result.error, backedUp: true }
  } catch (error) {
    console.error('[festival-log] failed to back up corrupted data', error)
    return { status: 'corrupted', data: EMPTY_DATA, error: result.error, backedUp: false }
  }
}

export function saveAppData(storage: ReadableStorage, data: AppData): { ok: true } | { ok: false; error: string } {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    console.error('[festival-log] failed to save data', error)
    return { ok: false, error: '저장 공간이 부족하거나 브라우저가 저장을 막았어요.' }
  }
}
