import { useRef, useState, type PointerEvent } from 'react'
import type { GuideSet } from '../../data/catalog/guide'
import { ChevronRightIcon } from '../../components/icons'
import { slideIndexAt } from '../../lib/carousel'

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

interface MouseDrag {
  startX: number
  startScroll: number
}

/**
 * Official guide pages side by side: swipe (or drag with a mouse) to the next one. Native scroll snapping
 * does the work on touch; a mouse drag scrolls the strip by hand and then settles on the nearest page.
 */
export function GuideCarousel({ guide, headingId }: { guide: GuideSet; headingId: string }) {
  const strip = useRef<HTMLUListElement>(null)
  const drag = useRef<MouseDrag | null>(null)
  const [index, setIndex] = useState(0)
  const count = guide.images.length

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

  // Touch and pen already scroll natively; only a mouse needs dragging by hand.
  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = e.currentTarget
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft }
    el.setPointerCapture(e.pointerId)
    el.classList.add('is-dragging')
  }
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    if (!drag.current) return
    e.currentTarget.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX)
  }
  const onPointerEnd = (e: PointerEvent<HTMLUListElement>) => {
    if (!drag.current) return
    drag.current = null
    const el = e.currentTarget
    el.classList.remove('is-dragging')
    goTo(slideIndexAt(el.scrollLeft, el.clientWidth, count))
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
