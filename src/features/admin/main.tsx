import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { AdminPage } from './AdminPage'
import '../../styles/tokens.css'
import '../../styles/global.css'

// The admin page keeps its state in the query; a hash (e.g. "#/manage" left by the app) only confuses the address.
if (window.location.hash) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
try {
  sessionStorage.removeItem('festival-log:admin-retry')
} catch (error) {
  console.warn('[festival-log] sessionStorage unavailable', error)
}

const root = document.getElementById('root')
if (!root) throw new Error('#root element is missing from manage/index.html')

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminPage />
    </ErrorBoundary>
  </StrictMode>,
)
