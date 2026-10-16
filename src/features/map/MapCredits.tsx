import { useState } from 'react'

/**
 * OpenStreetMap's licence needs its credit with the map, and its attribution guidelines allow a
 * corner ⓘ that opens it on small screens — so the credit does not cover the map all the time.
 */
export function MapCredits({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`map-credits${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="map-credits__toggle"
        aria-label="지도 출처"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open && <p className="map-credits__text">{text}</p>}
    </div>
  )
}
