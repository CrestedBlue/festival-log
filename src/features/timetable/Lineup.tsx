import type { LineupImage } from '../../data/catalog/lineup'

/** Before the timetable is out: the line-up posters, one under another in the order they were announced. */
export function Lineup({ images }: { images: readonly LineupImage[] }) {
  return (
    <div className="lineup">
      {images.map((image, i) => (
        <figure key={image.src} className="lineup__item">
          <figcaption className="lineup__label">{image.label}</figcaption>
          <img
            className="lineup__image"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            // The first poster is what the tab opens on; the rest load as you scroll to them.
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  )
}
