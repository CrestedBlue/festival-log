// Zone classes (official map colours) and faces: the real frame split into areas bounded by OSM paths.
import { sharp, OSM, W, H, llToPx, pathD } from './frame.mjs'
export const CLASSES = [
  // name, flat colour (official), sample colours from the official map
  ['path', '#c8c8ca', [[200, 200, 202], [188, 188, 190], [212, 212, 212], [204, 204, 206], [180, 180, 182]]],
  ['lawn', '#74bc6c', [[116, 188, 108], [108, 180, 100], [100, 172, 92], [68, 164, 60]]],
  ['standing', '#048444', [[4, 132, 68], [4, 124, 60], [4, 116, 60], [4, 140, 60]]],
  ['picnic', '#04a49c', [[4, 164, 156], [4, 148, 140], [4, 156, 148]]],
  ['kbPit', '#4f68a8', [[56, 115, 171], [99, 95, 156], [80, 100, 165], [110, 90, 160]]],
  ['fnb', '#c4b49c', [[196, 180, 156], [164, 156, 132], [190, 176, 150]]],
  ['asphalt', '#545458', [[108, 108, 116], [84, 84, 84], [92, 92, 96], [76, 76, 80]]],
  ['refresh', '#319fd7', [[49, 159, 215], [60, 170, 220], [40, 150, 200]]],
  ['forest', '#4e8a5c', [[107, 131, 107], [79, 122, 85]]], // tree grove (official map: dark bed under the trees)
]
const isPath = (t) => t.highway && !/motorway|secondary|residential/.test(t.highway)
export function barrierSvg(extra = '') {
  let s = ''
  for (const w of OSM.ways) {
    const t = w.tags || {}
    if (!(isPath(t) || t.amenity === 'parking' || t.leisure === 'garden' || (t.highway === 'secondary'))) continue
    s += `<path d="${pathD(w.pts.map(llToPx))}" fill="none" stroke="#000" stroke-width="4"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${s}${extra}</svg>`
}
export async function labelFaces(extra = '') {
  const { data } = await sharp(Buffer.from(barrierSvg(extra))).greyscale().raw().toBuffer({ resolveWithObject: true })
  const lab = new Int32Array(W * H).fill(-1)
  for (let i = 0; i < W * H; i++) if (data[i] < 128) lab[i] = 0 // barrier
  let next = 1; const stack = []
  for (let i = 0; i < W * H; i++) {
    if (lab[i] !== -1) continue
    lab[i] = next; stack.push(i)
    while (stack.length) { const p = stack.pop(); const x = p % W, y = (p - x) / W
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && lab[q] === -1) { lab[q] = next; stack.push(q) } }
    next++
  }
  return { lab, count: next }
}
