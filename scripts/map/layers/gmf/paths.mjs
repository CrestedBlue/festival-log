// Where the Grand Mint Festival layered map reads and writes. Inputs and per-layer results live in git; intermediates and
// downloaded satellite tiles live in a local cache.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
export const SRC = path.join(ROOT, 'map-src/gmf/layers') // official map, control points, detected pins
export const OUT = path.join(SRC, 'out') // layer SVGs (one file per layer and frame — never merged)
export const CACHE = path.join(ROOT, 'node_modules/.cache/festival-map/gmf')
export const OSM_JSON = path.join(ROOT, 'map-src/gmf/osm.json')
export const OFFICIAL_MAP = path.join(ROOT, 'map-src/gmf/official-map.png') // 2026 GMF FESTIVAL MAP (840×840), shared with the app map (build-gmf.mjs)
export const ICONS = path.join(ROOT, 'map-src/icons/tabler') // the Tabler icons the pins use (MIT)
