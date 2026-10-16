import { useCallback, useEffect, useState } from 'react'
import { buildHash, parseHash, type Route, type Tab } from '../lib/route'

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((tab: Tab) => {
    window.location.hash = buildHash(tab)
  }, [])

  /** Param tweaks (selected day, filters) replace history so Back still leaves the tab. */
  const setParams = useCallback((tab: Tab, params: Record<string, string | undefined>) => {
    const hash = buildHash(tab, params)
    window.history.replaceState(null, '', hash)
    setRoute(parseHash(hash))
  }, [])

  return { ...route, go, setParams }
}
