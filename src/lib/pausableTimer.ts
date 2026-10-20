export interface PausableTimer {
  pause: () => void
  resume: () => void
  cancel: () => void
}

/** setTimeout that can be held (e.g. while a finger is on the popup) and picks up where it stopped. */
export function createPausableTimer(ms: number, onDone: () => void): PausableTimer {
  let remaining = ms
  let startedAt = 0
  let handle: ReturnType<typeof setTimeout> | null = null
  let cancelled = false

  const start = () => {
    startedAt = Date.now()
    handle = setTimeout(() => {
      handle = null
      remaining = 0
      onDone()
    }, remaining)
  }

  start()
  return {
    pause: () => {
      if (handle === null) return
      clearTimeout(handle)
      handle = null
      remaining = Math.max(0, remaining - (Date.now() - startedAt))
    },
    resume: () => {
      if (handle !== null || cancelled || remaining <= 0) return
      start()
    },
    cancel: () => {
      cancelled = true
      if (handle !== null) clearTimeout(handle)
      handle = null
    },
  }
}
