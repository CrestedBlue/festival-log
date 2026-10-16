import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Last line of defense: show a recoverable screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[festival-log] render crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="empty-state">
        <h2>문제가 생겼어요</h2>
        <p>기록은 기기에 그대로 남아 있어요. 다시 열어 보세요.</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          다시 열기
        </button>
      </main>
    )
  }
}
