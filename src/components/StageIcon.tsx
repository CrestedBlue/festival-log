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
  star: <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z" />,
  bolt: <path d="M13.5 2 5 13.5h6L9.5 22 19 9.5h-6L13.5 2Z" />,
  // A tumbler: lid, then a cup narrowing to the bottom.
  cup: (
    <>
      <path d="M6 3.5h12V7H6z" />
      <path d="M7.2 8.2h9.6L15.4 21H8.6Z" />
    </>
  ),
  // A hanok: curved tiled roof over a house with a door.
  roof: (
    <>
      <path d="M1.5 10.5c3.2.2 5.6-1.2 7.6-4L12 3l2.9 3.5c2 2.8 4.4 4.2 7.6 4L21 13H3Z" />
      <path d="M6 14h12v7h-3.5v-4h-5v4H6Z" />
    </>
  ),
  // Two rolling swells.
  wave: (
    <>
      <path d="M2 8c2.2 0 3.3-2.5 5-2.5S9.8 8 12 8s3.3-2.5 5-2.5S19.8 8 22 8v3.2c-2.2 0-3.3-2.5-5-2.5s-2.8 2.5-5 2.5-3.3-2.5-5-2.5-2.8 2.5-5 2.5Z" />
      <path d="M2 15c2.2 0 3.3-2.5 5-2.5S9.8 15 12 15s3.3-2.5 5-2.5 2.8 2.5 5 2.5v3.2c-2.2 0-3.3-2.5-5-2.5s-2.8 2.5-5 2.5-3.3-2.5-5-2.5-2.8 2.5-5 2.5Z" />
    </>
  ),
  // A breath of wind: three curling strokes.
  breath: (
    <path
      d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  ),
}

/** The shape beside a stage name, drawn in the current color (the stage color). */
export const StageIcon = ({ name = 'dot' }: { name?: StageIconName }) => (
  <svg className="stage-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {SHAPES[name]}
  </svg>
)
