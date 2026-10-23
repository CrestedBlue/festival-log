// Where the Pentaport layered map reads and writes. Inputs and per-layer results live in git; intermediates and
// downloaded satellite tiles live in a local cache.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
export const SRC = path.join(ROOT, 'map-src/pentaport/layers') // official map, control points, detected pins
export const OUT = path.join(SRC, 'out') // layer SVGs (one file per layer and frame — never merged)
export const CACHE = path.join(ROOT, 'node_modules/.cache/festival-map/pentaport')
export const OSM_JSON = path.join(ROOT, 'map-src/pentaport/osm.json')
export const OFFICIAL_MAP = path.join(SRC, 'official-site-map.jpg') // 2026 행사장 안내도 (1080×1350)
export const ICONS = path.join(ROOT, 'map-src/icons/tabler') // the Tabler icons the pins use (MIT)
