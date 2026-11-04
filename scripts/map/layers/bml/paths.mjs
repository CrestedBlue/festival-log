// Where the BML map reads and writes. Its OSM extract and results live in git; tiles and checks in a local cache.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
export const OUT = path.join(ROOT, 'map-src/bml/layers/out')
export const CACHE = path.join(ROOT, 'node_modules/.cache/festival-map/bml')
export const OSM_JSON = path.join(ROOT, 'map-src/bml/osm.json')
