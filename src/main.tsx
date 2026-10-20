import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { isAdminPath } from './lib/route'
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

if (!(isAdminPath(window.location.pathname, import.meta.env.BASE_URL) && reopenAsAdminPage())) renderApp(root)
