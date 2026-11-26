/**
 * Picking up a new deploy without a second refresh.
 *
 * The service worker answers from its cache first so the app opens with no signal; a new version is fetched in the
 * background and takes over at once (autoUpdate), and the page then reloads itself onto it (registerSW in main.tsx).
 * The browser only looks for a new version when a page is loaded, though, and an installed app is mostly resumed, not
 * loaded: so ask again whenever the app comes back to the screen, and now and then while it stays open.
 */

/** While the app stays open, look for a new version this often. */
export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000
/** Switching apps back and forth asks at most once in this time. */
export const UPDATE_CHECK_MIN_GAP_MS = 60 * 1000

export interface UpdatableRegistration {
  update(): Promise<unknown>
}

export interface UpdateWatchEnv {
  isVisible(): boolean
  isOnline(): boolean
  now(): number
  onBecomeVisible(listener: () => void): void
  every(ms: number, listener: () => void): void
}

export const browserUpdateWatchEnv: UpdateWatchEnv = {
  isVisible: () => document.visibilityState === 'visible',
  isOnline: () => navigator.onLine,
  now: () => Date.now(),
  onBecomeVisible: (listener) => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') listener()
    })
  },
  every: (ms, listener) => {
    window.setInterval(listener, ms)
  },
}

export function watchForUpdates(registration: UpdatableRegistration, env: UpdateWatchEnv = browserUpdateWatchEnv): void {
  // the page load that registered the worker has just looked for a new version
  let lastCheck = env.now()
  const check = () => {
    if (!env.isVisible() || !env.isOnline()) return
    if (env.now() - lastCheck < UPDATE_CHECK_MIN_GAP_MS) return
    lastCheck = env.now()
    registration.update().catch((error: unknown) => console.warn('[festival-log] could not look for a new version', error))
  }
  env.onBecomeVisible(check)
  env.every(UPDATE_CHECK_INTERVAL_MS, check)
}
