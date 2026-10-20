export type SwipeSide = 'left' | 'right'

/** Dragged this share of its width, a card is thrown off to that side. */
const THROW_RATIO = 0.35
/** A flick at least this fast (px/ms) throws it too, even when short. */
const FLICK_SPEED = 0.5
/** Below this a drag is just a twitch of the finger. */
const MIN_DRAG_PX = 24

/** Where a sideways drag of `dx` px (ending at `velocity` px/ms) sends a card, or null to snap it back. */
export function swipeDecision(dx: number, width: number, velocity: number): SwipeSide | null {
  if (Math.abs(dx) < MIN_DRAG_PX) return null
  const side: SwipeSide = dx > 0 ? 'right' : 'left'
  if (Math.abs(dx) >= width * THROW_RATIO) return side
  const flickedSameWay = Math.sign(velocity) === Math.sign(dx)
  return flickedSameWay && Math.abs(velocity) >= FLICK_SPEED ? side : null
}
