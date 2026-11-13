// Where the wonderlivet maps read and write. Their OSM extract and results live in git; tiles and checks in a local cache.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
export const OUT = path.join(ROOT, 'map-src/wonderlivet/layers/out') // the WONDERLIVET map: its venue map and big map
export const OUT_KINTEX = path.join(ROOT, 'map-src/wonderlivet/layers/out-kintex') // the big area map alone, for the other festivals in these halls
export const CACHE = path.join(ROOT, 'node_modules/.cache/festival-map/wonderlivet')
export const OSM_JSON = path.join(ROOT, 'map-src/wonderlivet/osm.json')
