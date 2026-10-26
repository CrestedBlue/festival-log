// Where the wonderlivet big area map reads and writes. Its OSM extract and result live in git; tiles and checks in a local cache.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
export const OUT = path.join(ROOT, 'map-src/wonderlivet/layers/out') // the big map's layer 1 SVG and where it lies
export const CACHE = path.join(ROOT, 'node_modules/.cache/festival-map/wonderlivet')
export const OSM_JSON = path.join(ROOT, 'map-src/wonderlivet/osm.json')
