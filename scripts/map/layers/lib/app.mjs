// Bundles a festival's layered map for the app: each layer SVG is copied on its own (layers are never merged) into
// src/assets/maps/<code>/, and src/assets/maps/<code>.json says where each one lies (bounds), plus the whole map's
// bounds, the opening view, marks (the layer 3 pins), icons, labels, credits.
import fs from 'node:fs'
import path from 'node:path'

const round = ([lat, lng]) => [+lat.toFixed(6), +lng.toFixed(6)]
/** [[south, west], [north, east]] around the points ([lat, lng]). */
export const boundsAround = (points) => [[Math.min(...points.map((p) => p[0])), Math.min(...points.map((p) => p[1]))], [Math.max(...points.map((p) => p[0])), Math.max(...points.map((p) => p[1]))]].map(round)
/** A layer's bounds from its north-up-bounds.json. */
export const boundsOf = (file) => JSON.parse(fs.readFileSync(file)).bounds

/**
 * root: repository root; code: festival code; layers: [{ src: SVG path, file: name in the app, bounds, strip? }], bottom
 * first — `strip` lists group ids left out of the app's copy (drawn by the app instead, e.g. layer 2's name labels);
 * icons: key → SVG text of the markers the app draws (icons/<key>.svg); labels: names the app writes on the map
 * ({ text, kind, lat, lng, minZoom, icon?, colour? }); marks may carry `spot` ({ lat, lng }: where the map shows the
 * pin). The other fields go into the JSON as they are (see src/features/map/festivalMaps.ts).
 */
export function writeAppMap({ root, code, layers, initialView, marks = [], icons = {}, labels = [], attribution, background, maxZoom, fillOnOpen = true, zoomOutFills = false }) {
  const dir = path.join(root, 'src/assets/maps', code)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  for (const { src, file, strip = [] } of layers) {
    // the image is stretched onto its bounds, so it must not keep its own aspect ratio
    let svg = fs.readFileSync(src, 'utf8').replace(/<svg /, '<svg preserveAspectRatio="none" ')
    for (const id of strip) {
      const before = svg
      svg = svg.replace(new RegExp(`<g id="${id}"[^\\n]*\\n`), '')
      if (svg === before) throw new Error(`${file}: no group ${id} to leave out`)
    }
    fs.writeFileSync(path.join(dir, file), svg)
  }
  fs.mkdirSync(path.join(dir, 'icons'), { recursive: true })
  for (const [key, svg] of Object.entries(icons)) fs.writeFileSync(path.join(dir, 'icons', `${key}.svg`), svg)
  const all = layers.flatMap((l) => l.bounds)
  const meta = { attribution, background, maxZoom, fillOnOpen, zoomOutFills, bounds: boundsAround(all), initialView, layers: layers.map(({ file, bounds }) => ({ file, bounds })),
    icons: Object.fromEntries(Object.keys(icons).map((key) => [key, `icons/${key}.svg`])), labels, marks }
  fs.writeFileSync(path.join(root, 'src/assets/maps', `${code}.json`), `${JSON.stringify(meta, null, 2)}\n`)
  console.log('app map', code, '| layers', layers.map((l) => l.file).join(', '), '| icons', Object.keys(icons).length, '| labels', labels.length, '| marks', marks.length)
}
