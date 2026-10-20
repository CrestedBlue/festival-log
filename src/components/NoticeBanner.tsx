import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Notice } from '../data/store'
import { useSwipeAway } from '../hooks/useSwipeAway'
import { createPausableTimer, type PausableTimer } from '../lib/pausableTimer'
import { CloseIcon } from './icons'

const INFO_DISMISS_MS = 6000
const MIN_DRAG_OPACITY = 0.3

/**
 * Info notices close by themselves (the thin bar at the bottom shows how long is left); errors stay until
 * closed. Either can be swiped off sideways. Holding a notice pauses its countdown.
 */
export function NoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  const autoClose = notice.kind === 'info'
  const timer = useRef<PausableTimer | null>(null)
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!autoClose) return
    const countdown = createPausableTimer(INFO_DISMISS_MS, onDismiss)
    timer.current = countdown
    return () => countdown.cancel()
  }, [autoClose, onDismiss])

  const { dx, pulled, dragging, away, handlers } = useSwipeAway({
    onHold: () => {
      timer.current?.pause()
      setHeld(true)
    },
    onRelease: () => {
      timer.current?.resume()
      setHeld(false)
    },
    onAway: onDismiss,
  })

  const classes = ['notice', `notice--${notice.kind}`, dragging && 'is-dragging', away && `is-away-${away}`]
  const style = {
    '--notice-ms': `${INFO_DISMISS_MS}ms`,
    ...(!away && dx !== 0 && { transform: `translateX(${dx}px)`, opacity: Math.max(MIN_DRAG_OPACITY, 1 - pulled) }),
  } as CSSProperties

  return (
    <div
      className={classes.filter(Boolean).join(' ')}
      style={style}
      role={notice.kind === 'error' ? 'alert' : 'status'}
      data-held={held || undefined}
      {...handlers}
    >
      <p>{notice.message}</p>
      <button type="button" className="notice__close" onClick={onDismiss} aria-label="알림 닫기">
        <CloseIcon />
      </button>
      {autoClose && <span className="notice__timer" aria-hidden="true" />}
    </div>
  )
}
