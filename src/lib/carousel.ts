/** Which slide of a side-scrolling strip is in view: the one covering most of it. */
export function slideIndexAt(scrollLeft: number, slideWidth: number, count: number): number {
  if (slideWidth <= 0 || count <= 0) return 0
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / slideWidth)))
}

/** px/ms: let go faster than this and the strip goes on to the next slide in that direction (a flick). */
const FLICK_SPEED = 0.3
const SETTLE_MIN_MS = 200
const SETTLE_MAX_MS = 800

/**
 * The slide a strip settles on when the finger lets go: the nearest one, or after a flick the next one in its
 * direction (never more than one). velocity: px/ms the strip was scrolling at (+ = towards the next slide).
 */
export function releaseSlide({ scrollLeft, slideWidth, count, velocity }: { scrollLeft: number; slideWidth: number; count: number; velocity: number }): number {
  if (slideWidth <= 0 || count <= 0) return 0
  const at = scrollLeft / slideWidth
  const target = velocity >= FLICK_SPEED ? Math.floor(at) + 1 : velocity <= -FLICK_SPEED ? Math.ceil(at) - 1 : Math.round(at)
  return Math.min(count - 1, Math.max(0, target))
}

/**
 * How long the strip takes to settle `distance` px after the finger lets go at `speed` px/ms: an ease-out quad starts
 * at twice its average speed, so this makes it carry on at the finger's speed and slow down — within bounds.
 */
export function settleMs(distance: number, speed: number): number {
  if (distance <= 0) return 0
  const ms = (2 * distance) / Math.max(Math.abs(speed), 1e-3)
  return Math.round(Math.min(SETTLE_MAX_MS, Math.max(SETTLE_MIN_MS, ms)))
}
