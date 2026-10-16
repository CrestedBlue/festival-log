/**
 * Builds the Grand Mint Festival 2026 map image.
 *
 * The official festival map is an illustration that is not to scale and is rotated against reality.
 * This script keeps its art but moves every zone to where it really is: the base is drawn from
 * OpenStreetMap geometry in the official palette, and each illustrated zone (cut out of the official
 * map) is pasted at its real coordinates. The output is plain lat/lng-bounded image, so GPS positions
 * can be drawn on it directly.
 *
 *   node scripts/map/build-gmf2026.mjs
 *
 * Inputs:  map-src/gmf2026/official-map.png (official map crop), map-src/gmf2026/osm.json (OSM extract)
 * Outputs: src/assets/maps/gmf2026.webp, src/assets/maps/gmf2026.json (bounds, initial view, pin anchors)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { findFeatureCentroid, renderBaseSvg } from './base.mjs'
import { createProjection } from './geo.mjs'
import { cutSprite } from './sprites.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = path.join(ROOT, 'map-src/gmf2026')
const OUT = path.join(ROOT, 'src/assets/maps')
const OFFICIAL = path.join(SRC, 'official-map.png')

// Covers the venue plus both nearby subway exits (몽촌토성역 1번, 올림픽공원역 3번).
const BOUNDS = { south: 37.5152, west: 127.1122, north: 37.5228, east: 127.1322 }
const PX_PER_METER = 1.6
// What the map shows when it opens: the festival grounds.
const INITIAL_VIEW = [
  [37.5165, 127.1228],
  [37.5223, 127.1296],
]
const WEBP_QUALITY = 84

const osm = JSON.parse(fs.readFileSync(path.join(SRC, 'osm.json'), 'utf8'))
const proj = createProjection(BOUNDS, PX_PER_METER)
const entrance = (ref, near) =>
  osm.subwayEntrances
    .filter((e) => e.ref === ref)
    .sort((a, b) => Math.hypot(a.lat - near[0], a.lng - near[1]) - Math.hypot(b.lat - near[0], b.lng - near[1]))[0]

const MONGCHON_EXIT_1 = entrance('1', [37.5177, 127.1133])
const OLYMPIC_EXIT_3 = entrance('3', [37.5162, 127.1307])

/**
 * Each group is one zone of the official map. `anchor` is a point in official-map pixels that is pinned
 * to `at` (real lat/lng); every part keeps its offset from the anchor, so labels stay beside their zone.
 * Groups marked `estimated` have no surveyed position — they follow the official map's arrangement.
 */
const GROUPS = [
  {
    id: 'mintBreeze',
    anchor: [270, 335],
    at: findFeatureCentroid(osm, '88잔디마당'),
    scale: 0.95,
    parts: [
      { crop: [85, 170, 455, 500], shapes: [{ ellipse: [270, 335, 182, 162] }, { rect: [232, 395, 308, 498] }] },
      { crop: [146, 98, 274, 182], shapes: [{ rect: [146, 98, 274, 182] }] },
      { crop: [33, 238, 120, 304], shapes: [{ rect: [33, 238, 120, 304] }] },
    ],
    pins: { mintBreezeStage: [270, 215], hungryZoneLawn: [160, 245] },
  },
  {
    id: 'lovingForestGarden',
    // Anchor on the drawn stage, not the zone's middle: the real 수변무대 is a small stage on the lake's
    // south shore, so the drawn seating must spread south onto land, not out over the water.
    anchor: [597, 222],
    at: findFeatureCentroid(osm, '88호수 수변무대'),
    scale: 1,
    parts: [
      { crop: [528, 186, 666, 326], shapes: [{ ellipse: [597, 257, 68, 70] }] },
      { crop: [546, 136, 670, 190], shapes: [{ rect: [546, 136, 670, 190] }] },
    ],
    pins: { lovingForestStage: [597, 222] },
  },
  {
    id: 'clubMidnightSunset',
    anchor: [530, 650],
    at: findFeatureCentroid(osm, '올림픽체조경기장'),
    scale: 0.95,
    parts: [
      { crop: [414, 520, 646, 780], shapes: [{ ellipse: [530, 650, 115, 128] }] },
      { crop: [620, 696, 750, 772], shapes: [{ rect: [620, 696, 750, 772] }] },
    ],
    pins: { clubMidnightStage: [558, 598] },
  },
  {
    id: 'radar',
    estimated: true,
    anchor: [680, 452],
    // Official text: between KSPO DOME and the swimming pool. The gap is ~57m, so the zone is drawn smaller.
    at: [37.52011, 127.12735],
    scale: 0.55,
    parts: [
      // Keep the zone's pale plaza fill (close to the paper beige), so key with a tighter palette.
      {
        crop: [583, 372, 777, 532],
        shapes: [{ ellipse: [680, 452, 96, 78] }],
        keyColors: ['#e0e0c8', '#e1dfc6', '#adcf85', '#ebe6e2'],
        keyTolerance: 14,
      },
      { crop: [512, 446, 600, 490], shapes: [{ rect: [512, 446, 600, 490] }], offset: [150, 30] },
    ],
    pins: { radar: [622, 448], hungryZoneEast: [705, 392] },
  },
  {
    id: 'artZone',
    anchor: [268, 612],
    // 한얼광장: the plaza right south of KSPO DOME, between the dome and the handball arena (read off a
    // commercial map's 한얼광장 marker, 2026-10-16; OSM has no such feature). The gap is ~60m, so the art is small.
    at: [37.51832, 127.12718],
    scale: 0.6,
    parts: [
      { crop: [170, 515, 362, 708], shapes: [{ ellipse: [268, 612, 92, 94] }, { rect: [172, 546, 218, 580] }] },
      { crop: [80, 590, 175, 630], shapes: [{ rect: [80, 590, 175, 630] }] },
    ],
    pins: { artZone: [268, 612] },
  },
  {
    id: 'ticketBooth',
    estimated: true,
    anchor: [270, 738],
    // Official map: below Art Zone, toward 올림픽공원역 3번 출구 → south-east of 한얼광장, east of the handball arena.
    at: [37.5177, 127.128],
    scale: 0.6,
    parts: [{ crop: [208, 692, 332, 784], shapes: [{ ellipse: [270, 738, 61, 45] }] }],
    pins: { ticketBooth: [270, 738] },
  },
  {
    id: 'mongchonSign',
    anchor: [96, 70],
    at: [MONGCHON_EXIT_1.lat, MONGCHON_EXIT_1.lng],
    scale: 1,
    parts: [{ crop: [24, 26, 168, 70], shapes: [{ rect: [24, 26, 168, 70] }], offset: [0, -16] }],
    pins: {},
  },
  {
    id: 'olympicParkSign',
    anchor: [437, 820],
    at: [OLYMPIC_EXIT_3.lat, OLYMPIC_EXIT_3.lng],
    scale: 1,
    parts: [{ crop: [360, 780, 514, 820], shapes: [{ rect: [360, 780, 514, 820] }], offset: [0, -16] }],
    pins: {},
  },
]

const HIGHLIGHTS = [
  { name: '88잔디마당', fill: '#1ca289' },
  { name: '올림픽체조경기장', fill: '#de4f47' },
  { name: '올림픽수영경기장', fill: '#a9d7ea', stroke: '#7fbfd6' },
]

const LABELS = [
  { name: '88호수', size: 22 },
  { name: '올림픽수영경기장', text: '올림픽수영경기장', size: 18, dx: 30, dy: 10 },
  { name: 'SK올림픽핸드볼경기장', text: 'SK핸드볼경기장', size: 18 },
  { name: '우리금융아트홀', size: 18 },
  { name: '만남의광장', size: 18 },
  { name: '평화의광장', size: 20 },
  { name: '벨로드롬', size: 18 },
]

async function main() {
  const base = await sharp(Buffer.from(renderBaseSvg(osm, proj, { highlights: HIGHLIGHTS, labels: LABELS }))).png().toBuffer()

  const composites = []
  const anchors = {}
  for (const group of GROUPS) {
    const ax = proj.x(group.at[1])
    const ay = proj.y(group.at[0])
    for (const part of group.parts) {
      const sprite = await cutSprite(OFFICIAL, { ...part, anchor: group.anchor, scale: group.scale })
      const [ox, oy] = part.offset ?? [0, 0]
      composites.push({
        input: sprite.buffer,
        left: Math.round(ax - sprite.anchorX + ox),
        top: Math.round(ay - sprite.anchorY + oy),
      })
    }
    for (const [key, [px, py]] of Object.entries(group.pins)) {
      anchors[key] = proj.toLatLng(ax + (px - group.anchor[0]) * group.scale, ay + (py - group.anchor[1]) * group.scale)
    }
  }
  anchors.mongchonExit1 = [MONGCHON_EXIT_1.lat, MONGCHON_EXIT_1.lng]
  anchors.olympicParkExit3 = [OLYMPIC_EXIT_3.lat, OLYMPIC_EXIT_3.lng]

  // Exact exit positions go on top of everything so the signs never hide them.
  const exitDots = [MONGCHON_EXIT_1, OLYMPIC_EXIT_3]
    .map((e) => `<circle cx="${proj.x(e.lng).toFixed(1)}" cy="${proj.y(e.lat).toFixed(1)}" r="9" fill="#e11d48" stroke="#fff" stroke-width="3"/>`)
    .join('')
  composites.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${proj.width}" height="${proj.height}">${exitDots}</svg>`), left: 0, top: 0 })

  fs.mkdirSync(OUT, { recursive: true })
  await sharp(base).composite(composites).webp({ quality: WEBP_QUALITY }).toFile(path.join(OUT, 'gmf2026.webp'))
  const meta = {
    attribution: '지도 그림: GMF 2026 공식 지도 · 지형 데이터: © OpenStreetMap 기여자',
    size: [proj.width, proj.height],
    bounds: [
      [BOUNDS.south, BOUNDS.west],
      [BOUNDS.north, BOUNDS.east],
    ],
    initialView: INITIAL_VIEW,
    anchors,
  }
  fs.writeFileSync(path.join(OUT, 'gmf2026.json'), `${JSON.stringify(meta, null, 2)}\n`)
  console.log(`map ${proj.width}x${proj.height}px →`, path.relative(ROOT, path.join(OUT, 'gmf2026.webp')))
}

await main()
