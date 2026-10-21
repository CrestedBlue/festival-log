import type { ReactNode } from 'react'
import type { StageIconName } from '../data/schema'

const PETALS: ReadonlyArray<readonly [number, number]> = [
  [12, 6.8],
  [16.95, 10.4],
  [15.05, 16.2],
  [8.95, 16.2],
  [7.05, 10.4],
]

const SHAPES: Record<StageIconName, ReactNode> = {
  dot: <circle cx="12" cy="12" r="6" />,
  leaf: (
    <>
      <path d="M12 21C5 18 3 11 5.5 4.5 10 6.5 13 12.5 12 21Z" />
      <path d="M12 21c7-3 9-10 6.5-16.5C14 6.5 11 12.5 12 21Z" />
    </>
  ),
  sunset: <path d="M2.5 18a9.5 9.5 0 0 1 19 0Z" />,
  flower: (
    <>
      {PETALS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.2" />
      ))}
      <circle cx="12" cy="12" r="2" fill="#fff" fillOpacity="0.55" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path
        d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8M5.2 5.2a9.6 9.6 0 0 0 0 13.6M18.8 5.2a9.6 9.6 0 0 1 0 13.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
}

/** The shape beside a stage name, drawn in the current color (the stage color). */
export const StageIcon = ({ name = 'dot' }: { name?: StageIconName }) => (
  <svg className="stage-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {SHAPES[name]}
  </svg>
)
