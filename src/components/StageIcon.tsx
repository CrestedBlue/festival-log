import type { StageIconName } from '../data/schema'
import { STAGE_ICON_SHAPES } from './stageIconShapes'

/** SVG attribute names as React props ("stroke-width" → "strokeWidth"). */
const reactProps = (attrs: Readonly<Record<string, string>>) =>
  Object.fromEntries(Object.entries(attrs).map(([key, value]) => [key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), value]))

/** The shape beside a stage name, drawn in the current color (the stage color). */
export const StageIcon = ({ name = 'dot' }: { name?: StageIconName }) => (
  <svg className="stage-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {STAGE_ICON_SHAPES[name].map(({ tag, attrs }, i) =>
      tag === 'path' ? <path key={i} {...reactProps(attrs)} /> : <circle key={i} {...reactProps(attrs)} />,
    )}
  </svg>
)
