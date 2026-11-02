import { Component, type ErrorInfo, type ReactNode } from 'react'
import { STALE_RELOAD_LIMIT, isChunkLoadError, planReload, readReloadLog, writeReloadLog, type ReloadPlan } from '../lib/chunkReload'

interface State {
  error: Error | null
  /** For a part of the app that could not be fetched (an update came in): the reload to come, until they run out. */
  reload: ReloadPlan | null
}

/** Last line of defense: show a recoverable screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, reload: null }

  static getDerivedStateFromError(error: Error): State {
    return { error, reload: isChunkLoadError(error) ? planReload(readReloadLog(), Date.now()) : null }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const { reload } = this.state
    if (reload && writeReloadLog(reload.log)) {
      console.warn(`[festival-log] a part of the app could not be fetched, reloading (${reload.log.count}/${STALE_RELOAD_LIMIT})`, error)
      window.setTimeout(() => window.location.reload(), reload.delayMs)
      return
    }
    if (reload) this.setState({ reload: null })
    console.error('[festival-log] render crashed', error, info.componentStack)
  }

  render() {
    const { error, reload } = this.state
    if (!error) return this.props.children
    if (reload) {
      return (
        <main className="empty-state" aria-live="polite">
          <h2>새 버전을 불러오는 중이에요</h2>
          <p>앱이 업데이트돼서 다시 열고 있어요. 기록은 기기에 그대로 남아 있어요.</p>
          {reload.log.count > 1 && (
            <p>
              다시 시도하는 중 ({reload.log.count}/{STALE_RELOAD_LIMIT})
            </p>
          )}
        </main>
      )
    }
    const isStale = isChunkLoadError(error)
    return (
      <main className="empty-state">
        <h2>{isStale ? '화면을 불러오지 못했어요' : '문제가 생겼어요'}</h2>
        <p>
          {isStale
            ? '인터넷 연결을 확인하고 다시 열어 보세요. 기록은 기기에 그대로 남아 있어요.'
            : '기록은 기기에 그대로 남아 있어요. 다시 열어 보세요.'}
        </p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          다시 열기
        </button>
      </main>
    )
  }
}
