// The 2F lobby as its own layer (the user, 2026-11-19: the map switches between 1F and 2F). The official festival map
// draws the 2F lobby apart, over the 1F lobby, along halls 7·8 and 9·10: the plate's four corners (halls.mjs BLOCK2F)
// go onto the same corners of the real halls as the lobby's, so the plate lies over the 1F lobby — in the building's
// near-black with the lobby's brown, an orange edge as the official map draws it. The pins laid by the same fit (the
// lockers, the wheelchair zones) are on the plate (map.mjs checks it).
// The ground floor's layer, the stages and the halls' names are marked for floor 1 in the map's metadata; this layer for floor 2.
import fs from 'node:fs'
import path from 'node:path'
import { frame } from './frame.mjs'
import { BLOCK2F, officialToM } from './halls.mjs'

const POLYGON_PX = [BLOCK2F.nne78, BLOCK2F.ssw78, BLOCK2F.ssw910, BLOCK2F.nne910]
const inside = (pt, ring) =>
  ring.reduce((odd, a, i) => {
    const b = ring[(i + 1) % ring.length]
    return a[1] > pt[1] !== b[1] > pt[1] && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0] ? !odd : odd
  }, false)

/** The 2F lobby in local metres ([e, n] × 4). */
const PLATE = POLYGON_PX.map((px) => officialToM(px, 'lobby2F'))
export const plateContains = (m) => inside(m, PLATE)
export const plateCentre = () => frame.toLL([PLATE.reduce((s, p) => s + p[0], 0) / PLATE.length, PLATE.reduce((s, p) => s + p[1], 0) / PLATE.length])

/**
 * Writes layer2f.svg next to layer 1 (same size and bounds, so the two lie exactly over each other): the venue's outline
 * and clip taken from layer 1, then the plate. Returns the file's name.
 */
export function writeFloor2({ dir, fill, edge, building }) {
  const layer1 = fs.readFileSync(path.join(dir, 'layer1.svg'), 'utf8')
  const open = layer1.match(/^<svg [^>]*>/)?.[0]
  const defs = layer1.match(/<defs>.*?<\/defs>/s)?.[0]
  const venue = layer1.match(/<path id="venue"[^\n]*\/>/)?.[0]
  if (!open || !defs || !venue) throw new Error('layer1.svg: no <svg> tag, <defs> or venue path to copy')
  const { BOX } = frame
  const d = PLATE.map(([e, n], i) => `${i ? 'L' : 'M'}${(e - BOX.west).toFixed(1)},${(BOX.north - n).toFixed(1)}`).join('') + 'Z'
  const svg = `${open}\n${defs}\n<g id="layer2f" data-name="2층 바닥">\n${venue.replace(/fill="[^"]*"/, `fill="${building}"`)}\n<g clip-path="url(#venue-clip)"><path id="lobby2f" data-name="2층 로비" d="${d}" fill="${fill}" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/></g>\n</g>\n</svg>\n`
  fs.writeFileSync(path.join(dir, 'layer2f.svg'), svg)
  return 'layer2f.svg'
}
