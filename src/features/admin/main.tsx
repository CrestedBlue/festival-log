import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { AdminPage } from './AdminPage'
import '../../styles/tokens.css'
import '../../styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root element is missing from manage/index.html')

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminPage />
    </ErrorBoundary>
  </StrictMode>,
)
