import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { isAdminPath } from './lib/route'
import { watchForUpdates } from './lib/swUpdate'
import './styles/tokens.css'
import './styles/global.css'
import './styles/shell.css'

const ADMIN_RETRY_KEY = 'festival-log:admin-retry'

/**
 * A service worker from before the admin page existed answers <base>manage/ with the app (and the app's
 * tabs then add "#/manage" to that address). Drop the old worker once and load the address again from
 * the network, which serves the admin page. The app registers the current worker again on its next visit.
 */
function reopenAsAdminPage(): boolean {
  try {
    if (sessionStorage.getItem(ADMIN_RETRY_KEY)) return false
    sessionStorage.setItem(ADMIN_RETRY_KEY, '1')
  } catch (error) {
    console.warn('[festival-log] sessionStorage unavailable, not retrying the admin page', error)
    return false
  }
  const registrations = navigator.serviceWorker?.getRegistrations() ?? Promise.resolve([])
  void registrations
    .then((list) => Promise.all(list.map((registration) => registration.unregister())))
    .catch((error: unknown) => console.error('[festival-log] could not remove the old service worker', error))
    .finally(() => window.location.replace(`${window.location.pathname}${window.location.search}`))
  return true
}

/**
 * A new deploy is fetched in the background while the stored version opens; when it takes over, reload onto it at once
 * (autoUpdate) instead of waiting for a second refresh, and keep looking for one while the app is open (swUpdate.ts).
 */
function startServiceWorker() {
  registerSW({
    immediate: true,
    onRegisteredSW: (_url, registration) => {
      if (registration) watchForUpdates(registration)
    },
    onRegisterError: (error: unknown) => console.error('[festival-log] could not register the service worker', error),
  })
}

function renderApp(root: HTMLElement) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('#root element is missing from index.html')

if (!(isAdminPath(window.location.pathname, import.meta.env.BASE_URL) && reopenAsAdminPage())) {
  startServiceWorker()
  renderApp(root)
}
