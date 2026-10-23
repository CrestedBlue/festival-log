// Bundles a festival's layered map for the app: each layer SVG is copied on its own (layers are never merged) into
// src/assets/maps/<code>/, and src/assets/maps/<code>.json says where each one lies (bounds), plus the whole map's
// bounds, the opening view, anchors (places the app pins), marks (the layer 3 pins), credits.
import fs from 'node:fs'
import path from 'node:path'

const round = ([lat, lng]) => [+lat.toFixed(6), +lng.toFixed(6)]
/** [[south, west], [north, east]] around the points ([lat, lng]). */
export const boundsAround = (points) => [[Math.min(...points.map((p) => p[0])), Math.min(...points.map((p) => p[1]))], [Math.max(...points.map((p) => p[0])), Math.max(...points.map((p) => p[1]))]].map(round)
/** A layer's bounds from its north-up-bounds.json. */
export const boundsOf = (file) => JSON.parse(fs.readFileSync(file)).bounds

/**
 * root: repository root; code: festival code; layers: [{ src: SVG path, file: name in the app, bounds }], bottom first;
 * anchorTaps: anchor key → radius (m) to tap the drawn place at its anchor; marks may carry `tap` ({ lat, lng, radius }:
 * where the pin is drawn). The other fields go into the JSON as they are (see src/features/map/festivalMaps.ts).
 */
export function writeAppMap({ root, code, layers, initialView, anchors = {}, anchorTaps = {}, marks = [], attribution, background, maxZoom, fillOnOpen = true }) {
  const dir = path.join(root, 'src/assets/maps', code)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  for (const { src, file } of layers) {
    // the image is stretched onto its bounds, so it must not keep its own aspect ratio
    const svg = fs.readFileSync(src, 'utf8').replace(/<svg /, '<svg preserveAspectRatio="none" ')
    fs.writeFileSync(path.join(dir, file), svg)
  }
  const all = layers.flatMap((l) => l.bounds)
  const meta = { attribution, background, maxZoom, fillOnOpen, bounds: boundsAround(all), initialView, layers: layers.map(({ file, bounds }) => ({ file, bounds })),
    anchors: Object.fromEntries(Object.entries(anchors).map(([k, v]) => [k, round(v)])), anchorTaps, marks }
  fs.writeFileSync(path.join(root, 'src/assets/maps', `${code}.json`), `${JSON.stringify(meta, null, 2)}\n`)
  console.log('app map', code, '| layers', layers.map((l) => l.file).join(', '), '| anchors', Object.keys(anchors).length, '| marks', marks.length)
}
