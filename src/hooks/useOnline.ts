import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

/** Whether the phone has a connection (the browser's own guess: false means surely offline). */
export const useOnline = (): boolean => useSyncExternalStore(subscribe, () => navigator.onLine)
