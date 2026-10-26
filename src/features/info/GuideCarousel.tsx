import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { GuideSet } from '../../data/catalog/guide'
import { ChevronRightIcon } from '../../components/icons'
import { releaseSlide, settleMs, slideIndexAt } from '../../lib/carousel'

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

const DIRECTION_PX = 6 // a touch has to move this far before it counts as a sideways swipe (or the page's own scroll)
const VELOCITY_WINDOW_MS = 80 // the finger's speed when it lets go: over its last moves within this time
const easeOutQuad = (t: number) => 1 - (1 - t) ** 2 // starts at twice its average speed (settleMs)

interface Drag {
  startX: number
  startY: number
  startScroll: number
  /** Decided once the finger has moved a little: sideways drags the strip, up/down is left to the page. */
  sideways: boolean | null
  moves: { t: number; x: number }[]
}

/**
 * Official guide pages side by side: swipe (or drag with a mouse) to the next one. The strip follows the finger, and
 * when it lets go settles on a page at the finger's own speed — the nearest page, or the next one after a flick —
 * instead of the browser's quick snap.
 */
export function GuideCarousel({ guide, headingId }: { guide: GuideSet; headingId: string }) {
  const strip = useRef<HTMLUListElement>(null)
  const drag = useRef<Drag | null>(null)
  const settling = useRef(0) // the animation frame of a settle under way
  const [index, setIndex] = useState(0)
  const count = guide.images.length

  useEffect(() => () => cancelAnimationFrame(settling.current), [])

  const goTo = (target: number) => {
    const el = strip.current
    if (!el) return
    const next = Math.min(count - 1, Math.max(0, target))
    el.scrollTo({ left: next * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const onScroll = () => {
    const el = strip.current
    if (el) setIndex(slideIndexAt(el.scrollLeft, el.clientWidth, count))
  }

  /** Glide from where the strip is to page `target`, starting at `speed` px/ms and slowing down. */
  const settle = (el: HTMLUListElement, target: number, speed: number) => {
    const from = el.scrollLeft, to = target * el.clientWidth
    const ms = prefersReducedMotion() ? 0 : settleMs(Math.abs(to - from), speed)
    const start = performance.now()
    const step = (now: number) => {
      const t = ms > 0 ? Math.min(1, (now - start) / ms) : 1
      el.scrollLeft = from + (to - from) * easeOutQuad(t)
      if (t < 1) settling.current = requestAnimationFrame(step)
      else el.classList.remove('is-dragging') // snapping back on, right on a page
    }
    settling.current = requestAnimationFrame(step)
  }

  // Every pointer drags the strip by hand (CSS leaves sideways touch moves to us, up/down ones to the page).
  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    cancelAnimationFrame(settling.current)
    const el = e.currentTarget
    const sideways = e.pointerType === 'mouse' ? true : null
    drag.current = { startX: e.clientX, startY: e.clientY, startScroll: el.scrollLeft, sideways, moves: [{ t: e.timeStamp, x: e.clientX }] }
    if (sideways) {
      el.setPointerCapture(e.pointerId)
      el.classList.add('is-dragging')
    }
  }
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY
    if (d.sideways === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < DIRECTION_PX) return
      d.sideways = Math.abs(dx) > Math.abs(dy)
      if (!d.sideways) {
        drag.current = null
        return
      }
      e.currentTarget.setPointerCapture(e.pointerId)
      e.currentTarget.classList.add('is-dragging')
    }
    e.currentTarget.scrollLeft = d.startScroll - dx
    d.moves = [...d.moves.filter((m) => e.timeStamp - m.t <= VELOCITY_WINDOW_MS), { t: e.timeStamp, x: e.clientX }]
  }
  const onPointerEnd = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current
    drag.current = null
    if (!d?.sideways) return
    const el = e.currentTarget
    const first = d.moves[0]!, last = d.moves[d.moves.length - 1]!
    // the strip scrolls the other way from the finger
    const velocity = last.t > first.t ? -(last.x - first.x) / (last.t - first.t) : 0
    settle(el, releaseSlide({ scrollLeft: el.scrollLeft, slideWidth: el.clientWidth, count, velocity }), velocity)
  }

  return (
    <section className="panel guide" aria-labelledby={headingId}>
      <div className="guide__head">
        <h2 id={headingId} className="panel__title">
          {guide.title}
        </h2>
        {count > 1 && (
          <div className="guide__nav">
            <button type="button" className="guide__arrow guide__arrow--prev" aria-label="이전 장" disabled={index === 0} onClick={() => goTo(index - 1)}>
              <ChevronRightIcon />
            </button>
            <span className="guide__count" aria-live="polite">
              {index + 1} / {count}
            </span>
            <button type="button" className="guide__arrow" aria-label="다음 장" disabled={index === count - 1} onClick={() => goTo(index + 1)}>
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
      <ul
        ref={strip}
        className="guide__strip"
        aria-label={`${guide.title}, ${count}장`}
        tabIndex={0}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {guide.images.map((image, i) => (
          <li key={image.src} className="guide__slide">
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              // The first page shows right away; the rest load as you get near them.
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
          </li>
        ))}
      </ul>
      <p className="guide__source">{guide.source}</p>
    </section>
  )
}
