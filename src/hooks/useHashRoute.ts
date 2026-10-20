import { useCallback, useEffect, useState } from 'react'
import { buildHash, parseHash, type Route, type Tab } from '../lib/route'

/** `home` is the tab shown while the hash names none; it may change (e.g. another festival is picked). */
export function useHashRoute(home: Tab) {
  const [hash, setHash] = useState(() => window.location.hash)
  const route: Route = parseHash(hash, home)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((tab: Tab) => {
    window.location.hash = buildHash(tab)
  }, [])

  /** Param tweaks (selected day, filters) replace history so Back still leaves the tab. */
  const setParams = useCallback((tab: Tab, params: Record<string, string | undefined>) => {
    const next = buildHash(tab, params)
    window.history.replaceState(null, '', next)
    setHash(next)
  }, [])

  return { ...route, go, setParams }
}
