import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { swipeDecision, type SwipeSide } from '../lib/swipe'

/** Matches the .notice transition, so the card is gone from view before it is removed. */
const LEAVE_MS = 220

interface Options {
  /** A finger (or mouse) took hold of the card. */
  onHold: () => void
  /** It was let go without throwing it away. */
  onRelease: () => void
  /** It was thrown off to one side and has slid out. */
  onAway: () => void
}

interface Drag {
  pointerId: number
  startX: number
  lastX: number
  lastTime: number
  /** px/ms of the latest move: a flick ends fast, a careful drag ends slow. */
  velocity: number
  width: number
}

/** Drag a card sideways; let go far or fast enough and it slides off, otherwise it springs back. */
export function useSwipeAway({ onHold, onRelease, onAway }: Options) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [away, setAway] = useState<SwipeSide | null>(null)
  const drag = useRef<Drag | null>(null)
  const leaveTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    // The close button keeps working as a plain button.
    if (away || (e.target instanceof Element && e.target.closest('button'))) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { pointerId: e.pointerId, startX: e.clientX, lastX: e.clientX, lastTime: e.timeStamp, velocity: 0, width: e.currentTarget.offsetWidth }
    setDragging(true)
    onHold()
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    const dt = e.timeStamp - d.lastTime
    if (dt > 0) d.velocity = (e.clientX - d.lastX) / dt
    d.lastX = e.clientX
    d.lastTime = e.timeStamp
    setDx(e.clientX - d.startX)
  }

  const onPointerEnd = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    drag.current = null
    setDragging(false)
    // pointercancel = the browser took the gesture (e.g. a vertical scroll): never throw the card then.
    const side = e.type === 'pointercancel' ? null : swipeDecision(d.lastX - d.startX, d.width, d.velocity)
    if (!side) {
      setDx(0)
      onRelease()
      return
    }
    setAway(side)
    leaveTimer.current = window.setTimeout(onAway, LEAVE_MS)
  }

  const width = drag.current?.width ?? 0
  return {
    dx,
    /** 0 at rest, 1 once dragged a full width away. */
    pulled: width > 0 ? Math.min(1, Math.abs(dx) / width) : 0,
    dragging,
    away,
    handlers: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd },
  }
}
