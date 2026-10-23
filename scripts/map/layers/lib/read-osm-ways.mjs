// Satellite in a festival's drawing frame with every OSM way inside it, numbered, and a 50 m grid (cache): to read
// which real path is which, and metre coordinates for seeds, split lines and the venue outline.
//   node scripts/map/layers/lib/read-osm-ways.mjs <festival> [frame]   (pentaport, gmf, …; frame: an extra frame the
//   festival's frame.mjs exports, e.g. bigFrame) → cache osm-ways[-<frame>].jpg, osm-ways[-<frame>].txt
import fs from 'node:fs'
import path from 'node:path'

const festival = process.argv[2]
if (!festival) throw new Error('usage: read-osm-ways.mjs <festival folder, e.g. pentaport>')
const frameName = process.argv[3]
const frames = await import(`../${festival}/frame.mjs`)
const { sharp, OSM, W, H, BOX, PPM, llToPx, pathD, satellite } = frameName ? frames[frameName] : frames
const suffix = frameName ? `-${frameName}` : ''
const { CACHE } = await import(`../${festival}/paths.mjs`)
const sat = await satellite()
const inFrame = (ll) => { const [x, y] = llToPx(ll); return x >= 0 && y >= 0 && x <= W && y <= H }
const skip = (t) => t.building || ['-2', '-4'].includes(t.layer) || t.natural === 'coastline' || /motorway/.test(t.highway || '') || /residential|commercial/.test(t.landuse || '')
let svg = '', idx = []
for (const w of OSM.ways) {
  const t = w.tags || {}
  if (skip(t) || !w.pts.some(inFrame)) continue
  const px = w.pts.map(llToPx)
  const col = t.highway === 'footway' ? '#ffea00' : t.highway === 'service' ? '#ff6d00' : t.highway === 'cycleway' ? '#00e5ff' : t.highway ? '#ffffff' : t.amenity === 'parking' ? '#ff1744' : t.leisure ? '#76ff03' : '#e040fb'
  svg += `<path d="${pathD(px)}" fill="none" stroke="${col}" stroke-width="3" stroke-opacity="0.9"/>`
  const mid = px[Math.floor(px.length / 2)]
  idx.push({ i: idx.length + 1, id: w.id, t: Object.entries(t).map(([k, v]) => `${k}=${v}`).join(',') })
  svg += `<text x="${mid[0] + 4}" y="${mid[1] - 4}" font-size="22" font-weight="700" font-family="Arial" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke">${idx.length}</text>`
}
// metre grid every 50 m
for (let e = Math.ceil(BOX.west / 50) * 50; e <= BOX.east; e += 50) { const x = (e - BOX.west) * PPM; svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#fff" stroke-opacity="0.25"/><text x="${x + 2}" y="18" font-size="16" fill="#fff" font-family="Arial">${e}</text>` }
for (let n = Math.ceil(BOX.south / 50) * 50; n <= BOX.north; n += 50) { const y = (BOX.north - n) * PPM; svg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#fff" stroke-opacity="0.25"/><text x="2" y="${y - 3}" font-size="16" fill="#fff" font-family="Arial">${n}</text>` }
await sharp(sat).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`) }]).png().toBuffer().then((b) => sharp(b).resize(Math.round(W / 1.5)).jpeg({ quality: 82 }).toFile(path.join(CACHE, `osm-ways${suffix}.jpg`)))
fs.writeFileSync(path.join(CACHE, `osm-ways${suffix}.txt`), idx.map((r) => `${r.i}\t${r.id}\t${r.t}`).join('\n'))
console.log(W, H, idx.length)
