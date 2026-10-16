import { useEffect } from 'react'
import type { Notice } from '../data/store'
import { CloseIcon } from './icons'

const INFO_DISMISS_MS = 6000

export function NoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  useEffect(() => {
    if (notice.kind !== 'info') return
    const timer = window.setTimeout(onDismiss, INFO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [notice, onDismiss])

  return (
    <div className={`notice notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
      <p>{notice.message}</p>
      <button type="button" className="btn btn--ghost btn--small" onClick={onDismiss} aria-label="알림 닫기">
        <CloseIcon />
      </button>
    </div>
  )
}
