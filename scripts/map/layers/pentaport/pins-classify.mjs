// Name each pin on the official map by matching it against the legend badges (normalised cross-correlation).
// The legend indices below are the candidate numbers pins-detect.mjs printed on candidates.jpg for this map.
//   node scripts/map/layers/pentaport/pins-classify.mjs   → map-src pins-official.json (check pins-official.jpg in the cache by eye)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { CACHE, SRC as DATA, OFFICIAL_MAP as SRC } from './paths.mjs'
const cand = JSON.parse(fs.readFileSync(path.join(CACHE, 'candidates.json')))
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width

// Centre of a coloured disc near a guess (pins that are not white).
function discCentre([gx, gy], test) {
  let n = 0, sx = 0, sy = 0
  for (let y = gy - 30; y <= gy + 30; y++) for (let x = gx - 30; x <= gx + 30; x++) { const o = (y * W + x) * 3; if (test(data[o], data[o + 1], data[o + 2])) { n++; sx += x; sy += y } }
  return [+(sx / n).toFixed(1), +(sy / n).toFixed(1)]
}
const isGreen = (r, g, b) => g > 170 && r < 120 && b > 90 && b < 190
const isBlue = (r, g, b) => b > 200 && g > 140 && r < 80
const LEGEND = [
  ['gate', 46], ['info', 47], ['barrierFreePass', discCentre([232, 1080], isGreen)],
  ['securityCheck', 49], ['lockers', 50], ['pentaDreamer', 59], ['promotionBooth', 51], ['vendorBooth', 52], ['fnb', 53], ['bar', 54], ['waterBar', 55], ['kiosk', 56], ['medical', 57], ['coolZone', 58], ['mainCoolZone', discCentre([1022, 1175], isBlue)],
  ['officialMd', 60], ['artistMd', 61], ['charging', 62], ['toilet', 63], ['accessibleToilet', 64], ['washStation', 65], ['nursingRoom', 66], ['barrierFreeZone', 71], ['police', 67], ['fireStation', 68], ['interpretation', 69], ['smoking', 70],
].map(([type, at]) => ({ type, c: Array.isArray(at) ? at : [cand[at].cx, cand[at].cy], d: Array.isArray(at) ? 50 : cand[at].d }))
const R = 16 // compare the inner 33×33 (icon), not the ring
const px = (x, y, c) => { const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, at = (xx, yy) => data[(yy * W + xx) * 3 + c]
  return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy }
// sample the icon at map-pin scale: `scale` = this badge's diameter / a map pin's diameter
const patch = ([cx, cy], scale = 1) => { const v = []; for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) for (let c = 0; c < 3; c++) v.push(px(cx + x * scale, cy + y * scale, c)); return v }
const ncc = (a, b) => { const n = a.length; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i] } ma /= n; mb /= n; let s = 0, sa = 0, sb = 0; for (let i = 0; i < n; i++) { const da = a[i] - ma, db = b[i] - mb; s += da * db; sa += da * da; sb += db * db } return s / Math.sqrt(sa * sb + 1e-9) }
const MAP_D = 39
const legend = LEGEND.map((l) => ({ ...l, p: patch(l.c, l.d / MAP_D) }))
const onMap = cand.map((c, i) => ({ i, c: [c.cx, c.cy] })).filter((x) => x.c[1] < 1135 && !(x.c[0] < 300 && x.c[1] > 1040)) // legend row 1 sits at the bottom left
// the two non-white pins on the map
onMap.push({ i: 'bfPass', c: discCentre([965, 767], isGreen) }, { i: 'mainCool', c: discCentre([683, 768], isBlue) })
const pins = onMap.map(({ i, c }) => {
  let best = null, second = null
  for (const l of legend) { let s = -1; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) s = Math.max(s, ncc(patch([c[0] + dx, c[1] + dy]), l.p)); if (!best || s > best.s) { second = best; best = { type: l.type, s } } else if (!second || s > second.s) second = { type: l.type, s } }
  return { id: i, type: best.type, score: +best.s.toFixed(2), runnerUp: `${second.type} ${second.s.toFixed(2)}`, s: c }
})
fs.writeFileSync(path.join(DATA, 'pins-official.json'), JSON.stringify(pins, null, 1))
const count = {}; for (const p of pins) count[p.type] = (count[p.type] || 0) + 1
console.log(pins.length, 'pins'); console.log(Object.entries(count).map(([k, v]) => `${k} ${v}`).join(', '))
console.log('lowest scores:', pins.slice().sort((a, b) => a.score - b.score).slice(0, 8).map((p) => `#${p.id} ${p.type} ${p.score} (2nd ${p.runnerUp})`).join(' | '))
// annotated check image
let svg = ''; for (const p of pins) svg += `<text x="${p.s[0]}" y="${p.s[1] - 24}" font-size="12" font-weight="700" text-anchor="middle" font-family="Arial" fill="#d500f9" stroke="#fff" stroke-width="3" paint-order="stroke">${p.type}</text>`
await sharp(SRC).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${info.height}">${svg}</svg>`) }]).png().toBuffer().then((b) => sharp(b).extract({ left: 0, top: 200, width: 1080, height: 940 }).jpeg({ quality: 88 }).toFile(path.join(CACHE, 'pins-official.jpg')))
