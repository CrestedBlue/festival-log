/**
 * Reloading when a lazily loaded part of the app (the map) cannot be fetched.
 *
 * Every deploy gives the files new names. The new service worker takes over at once and clears the old version's
 * files, while a page already open keeps running the old version: when it then asks for a part it has not loaded yet,
 * the old file is neither in the cache nor on the server. Loading the page again opens the new version, so the error
 * screen reloads at once, and should that not do it (a slow connection), again STALE_RELOAD_INTERVAL_MS apart, up to
 * STALE_RELOAD_LIMIT times in all. The count lives in sessionStorage to outlast the reloads; it starts over once a part
 * loads, or when the last reload is STALE_RELOAD_RESET_MS behind.
 */

/** Reloads in a row: one right away fixes an update, the others cover a connection that was slow at that moment. */
export const STALE_RELOAD_LIMIT = 3
export const STALE_RELOAD_INTERVAL_MS = 5_000
/** A failure this long after the last reload belongs to another update and gets its own reloads. */
export const STALE_RELOAD_RESET_MS = 60_000

const LOG_KEY = 'festival-log:chunk-reload'

export interface ReloadLog {
  /** Reloads so far in this run. */
  count: number
  /** When the last one was planned (ms since the epoch). */
  at: number
}

export interface ReloadPlan {
  log: ReloadLog
  delayMs: number
}

export type ReloadStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** A lazily loaded part of the app could not be fetched. */
export class ChunkLoadError extends Error {
  constructor(cause: unknown) {
    super('A lazily loaded part of the app could not be fetched', { cause })
    this.name = 'ChunkLoadError'
  }
}

export const isChunkLoadError = (error: unknown): error is ChunkLoadError => error instanceof ChunkLoadError

/** The next reload after a failure at `now`, or null once the reloads are used up. */
export function planReload(log: ReloadLog | null, now: number): ReloadPlan | null {
  const count = log && now - log.at < STALE_RELOAD_RESET_MS ? log.count : 0
  if (count >= STALE_RELOAD_LIMIT) return null
  return { log: { count: count + 1, at: now }, delayMs: count === 0 ? 0 : STALE_RELOAD_INTERVAL_MS }
}

/** sessionStorage, or null where the browser blocks it (reading it can throw). */
function session(): ReloadStorage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

const isReloadLog = (value: unknown): value is ReloadLog => {
  if (typeof value !== 'object' || value === null) return false
  const { count, at } = value as Record<string, unknown>
  return Number.isInteger(count) && (count as number) >= 0 && typeof at === 'number' && Number.isFinite(at)
}

export function readReloadLog(storage: ReloadStorage | null = session()): ReloadLog | null {
  try {
    const stored = storage?.getItem(LOG_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isReloadLog(parsed) ? { count: parsed.count, at: parsed.at } : null
  } catch {
    return null
  }
}

/** False when the log cannot be kept: then no reload may run, or every one would count as the first. */
export function writeReloadLog(log: ReloadLog, storage: ReloadStorage | null = session()): boolean {
  if (!storage) return false
  try {
    storage.setItem(LOG_KEY, JSON.stringify(log))
    return true
  } catch (error) {
    console.warn('[festival-log] sessionStorage unavailable, not reloading', error)
    return false
  }
}

export function clearReloadLog(storage: ReloadStorage | null = session()): void {
  try {
    storage?.removeItem(LOG_KEY)
  } catch {
    // nothing kept, nothing to clear
  }
}

/** Loads a lazily loaded part: a failed fetch becomes a ChunkLoadError, a part that arrives clears the reload log. */
export const loadChunk = <T>(load: () => Promise<T>, storage: ReloadStorage | null = session()): Promise<T> =>
  load().then(
    (part) => {
      clearReloadLog(storage)
      return part
    },
    (error: unknown) => {
      throw new ChunkLoadError(error)
    },
  )
