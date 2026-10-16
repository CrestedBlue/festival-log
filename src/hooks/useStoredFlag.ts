import { useCallback, useState } from 'react'

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : raw === '1'
  } catch {
    return fallback
  }
}

/** A per-device UI preference (e.g. a collapsed panel). Storage failures just mean it isn't remembered. */
export function useStoredFlag(key: string, fallback: boolean): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState(() => readFlag(key, fallback))
  const update = useCallback(
    (next: boolean) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, next ? '1' : '0')
      } catch (error) {
        console.warn('[festival-log] could not remember UI preference', error)
      }
    },
    [key],
  )
  return [value, update]
}
