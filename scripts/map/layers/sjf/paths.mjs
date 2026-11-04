// Where the SJF map reads and writes. It is drawn on the Olympic Park OSM extract of the Grand Mint Festival map (the same
// park); its results live in git, tiles and checks in a local cache.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
export const OUT = path.join(ROOT, 'map-src/sjf/layers/out')
export const CACHE = path.join(ROOT, 'node_modules/.cache/festival-map/sjf')
export const OSM_JSON = path.join(ROOT, 'map-src/gmf/osm.json')
