/**
 * Builds the Grand Mint Festival map image (festival code "gmf"). The festival is held at Olympic Park every
 * year, so this one map belongs to the festival, not to a year; rebuild it only when the site layout changes.
 * The 2026 official map is the current design reference.
 *
 * The look follows the official festival map (paper background, park green, pale walkways, its trees),
 * but nothing is pasted from it except the trees: every zone is redrawn on its real footprint
 * (OpenStreetMap shapes for 88잔디마당 and KSPO DOME) with its own colour and a readable name label.
 * Marker icons (toilets, info, …) are left out of the image; their official positions are moved onto
 * the redrawn zones (scripts/map/marks.mjs) and written out for the app to show as pins.
 * The output is a plain lat/lng-bounded image, so GPS positions can be drawn on it directly.
 *
 *   node scripts/map/build-gmf.mjs
 *
 * Inputs:  map-src/gmf/osm.json (OSM extract), map-src/gmf/markers.json (official marker icons),
 *          map-src/gmf/official-map.png (tree art only)
 * Outputs: src/assets/maps/gmf.webp, src/assets/maps/gmf.json (bounds, initial view, zone anchors, marks)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { renderBaseSvg } from './base.mjs'
import { centroid, createProjection } from './geo.mjs'
import { placeMarks } from './marks.mjs'
import { cutSprite } from './sprites.mjs'
import { treeSpots } from './trees.mjs'
import { SPOTS, renderZones, stationBadge } from './zones.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = path.join(ROOT, 'map-src/gmf')
const OUT = path.join(ROOT, 'src/assets/maps')
const NAME = 'gmf'
const OFFICIAL = path.join(SRC, 'official-map.png')

// Covers the venue plus both nearby subway exits (몽촌토성역 1번, 올림픽공원역 3번).
const BOUNDS = { south: 37.5152, west: 127.1122, north: 37.5228, east: 127.1322 }
const PX_PER_METER = 1.6
// What the map shows when it opens: all three stages at a glance (the app may zoom in further to fill the screen).
const INITIAL_VIEW = [
  [37.5178, 127.1232],
  [37.5222, 127.1287],
]
// Official tree art, cut from the official map and scattered over the real park.
const TREES = [
  { crop: [414, 176, 439, 222] },
  { crop: [513, 180, 537, 222] },
  { crop: [80, 461, 98, 492] },
  { crop: [101, 485, 128, 519] },
]
const TREE_SCALE = 0.8
const ZONE_CLEARANCE_PX = 18
const WEBP_QUALITY = 84

const osm = JSON.parse(fs.readFileSync(path.join(SRC, 'osm.json'), 'utf8'))
const proj = createProjection(BOUNDS, PX_PER_METER)
const entrance = (ref, near) =>
  osm.subwayEntrances
    .filter((e) => e.ref === ref)
    .sort((a, b) => Math.hypot(a.lat - near[0], a.lng - near[1]) - Math.hypot(b.lat - near[0], b.lng - near[1]))[0]

const MONGCHON_EXIT_1 = entrance('1', [37.5177, 127.1133])
const OLYMPIC_EXIT_3 = entrance('3', [37.5162, 127.1307])

const HIGHLIGHTS = [{ name: '올림픽수영경기장', fill: '#a9d7ea', stroke: '#7fbfd6' }]

const LABELS = [
  { name: '88호수', size: 22, dy: -40 },
  { name: '올림픽수영경기장', text: '올림픽수영경기장', size: 18, dy: -20 },
  { name: 'SK올림픽핸드볼경기장', text: 'SK핸드볼경기장', size: 18 },
  { name: '우리금융아트홀', size: 18 },
  { name: '만남의광장', size: 18 },
  { name: '평화의광장', size: 20 },
  { name: '벨로드롬', size: 18 },
]

const svgLayer = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${proj.width}" height="${proj.height}">${body}</svg>`)

async function main() {
  const base = await sharp(Buffer.from(renderBaseSvg(osm, proj, { highlights: HIGHLIGHTS, labels: LABELS }))).png().toBuffer()
  const zones = renderZones(osm, proj)

  const lawnAndDome = osm.ways
    .filter((w) => w.tags.name === '88잔디마당' || w.tags.name === '올림픽체조경기장')
    .map((w) => {
      const xs = w.pts.map(([, lng]) => proj.x(lng))
      const ys = w.pts.map(([lat]) => proj.y(lat))
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
    })
  const exclusions = [...zones.boxes, ...lawnAndDome].map(([x0, y0, x1, y1]) => [
    x0 - ZONE_CLEARANCE_PX,
    y0 - ZONE_CLEARANCE_PX,
    x1 + ZONE_CLEARANCE_PX,
    y1 + ZONE_CLEARANCE_PX,
  ])
  const treeSprites = await Promise.all(
    TREES.map((tree) => cutSprite(OFFICIAL, { ...tree, shapes: [{ rect: tree.crop }], anchor: [tree.crop[0], tree.crop[3]], scale: TREE_SCALE })),
  )
  const trees = treeSpots(osm, proj, { exclusions }).map(({ x, y, variant }) => {
    const sprite = treeSprites[variant]
    // A tree stands on its spot: trunk base at the point.
    return { input: sprite.buffer, left: Math.round(x - sprite.width / 2), top: Math.round(y - sprite.height) }
  })

  const stations =
    stationBadge(proj, MONGCHON_EXIT_1, { name: '몽촌토성역', exit: '1번 출구 · 도보 22분', lines: ['8'] }) +
    stationBadge(proj, OLYMPIC_EXIT_3, { name: '올림픽공원역', exit: '3번 출구 · 도보 7분', lines: ['5', '9'] })
  // Exact exit positions go on top of everything.
  const exitDots = [MONGCHON_EXIT_1, OLYMPIC_EXIT_3]
    .map((e) => `<circle cx="${proj.x(e.lng).toFixed(1)}" cy="${proj.y(e.lat).toFixed(1)}" r="9" fill="#e11d48" stroke="#fff" stroke-width="3"/>`)
    .join('')

  fs.mkdirSync(OUT, { recursive: true })
  await sharp(base)
    .composite([...trees, { input: svgLayer(zones.svg + stations + exitDots), left: 0, top: 0 }])
    .webp({ quality: WEBP_QUALITY })
    .toFile(path.join(OUT, `${NAME}.webp`))

  const anchors = {
    mintBreezeStage: SPOTS.mbStage,
    lovingForestStage: SPOTS.lfgStage,
    clubMidnightStage: SPOTS.cmsStage,
    radar: SPOTS.radar,
    hungryZoneEast: SPOTS.hungryEast,
    hungryZoneLawn: SPOTS.hungryLawn,
    artZone: SPOTS.artZone,
    ticketBooth: SPOTS.ticketBooth,
    mongchonExit1: [MONGCHON_EXIT_1.lat, MONGCHON_EXIT_1.lng],
    olympicParkExit3: [OLYMPIC_EXIT_3.lat, OLYMPIC_EXIT_3.lng],
  }
  const dome = osm.ways.find((w) => w.tags.name === '올림픽체조경기장')
  const [domeLat, domeLng] = centroid(dome.pts.slice(0, -1))
  const { markers } = JSON.parse(fs.readFileSync(path.join(SRC, 'markers.json'), 'utf8'))
  const lawn = osm.ways.find((w) => w.tags.name === '88잔디마당')
  const marks = placeMarks(markers, proj, {
    domeCentre: [proj.x(domeLng), proj.y(domeLat)],
    lawnPolygon: lawn.pts.map(([lat, lng]) => [proj.x(lng), proj.y(lat)]),
    labelBoxes: zones.labelBoxes,
  })

  const meta = {
    attribution: '지도 디자인: GMF 2026 공식 지도 참고 · 지형 데이터: © OpenStreetMap 기여자',
    size: [proj.width, proj.height],
    bounds: [
      [BOUNDS.south, BOUNDS.west],
      [BOUNDS.north, BOUNDS.east],
    ],
    initialView: INITIAL_VIEW,
    anchors,
    marks,
  }
  fs.writeFileSync(path.join(OUT, `${NAME}.json`), `${JSON.stringify(meta, null, 2)}\n`)
  console.log(`map ${proj.width}x${proj.height}px →`, path.relative(ROOT, path.join(OUT, `${NAME}.webp`)))
}

await main()
