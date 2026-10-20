/**
 * Builds the Incheon Pentaport map (festival code "pentaport") from the official 2026 entrance map
 * ("입장 동선 안내", @pentaportrf / pentaport.co.kr, 2026-07-14), keeping the drawing as it is but laying
 * it onto real coordinates so the GPS position lands in the right place.
 *
 * The official map is schematic (rotated about 20°, distances squeezed in places), so a plain rotation
 * leaves 10–30 m errors. Instead a thin-plate spline passes exactly through a few places that are both on
 * the drawing and in OpenStreetMap, and bends the rest of the drawing smoothly between them.
 * Places the drawing shows but OSM does not (gates, ticket booths, stages, shuttle stops) are read off the
 * drawing and carried through the same warp; they are written out as anchors for the app's pins.
 *
 *   node scripts/map/build-pentaport.mjs
 *
 * Inputs:  map-src/pentaport/official-entrance-map.jpg (1080×1350)
 * Outputs: src/assets/maps/pentaport.webp, src/assets/maps/pentaport.json (bounds, initial view, anchors)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { fitThinPlateSpline } from './tps.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE = path.join(ROOT, 'map-src/pentaport/official-entrance-map.jpg')
const OUT = path.join(ROOT, 'src/assets/maps')
const NAME = 'pentaport'

// The map body inside its rounded frame (the title above it would otherwise sit over real streets).
const CROP = { left: 0, top: 240, width: 1080, height: 1095 }
const PX_PER_METER = 1.2
const BACKGROUND = { r: 255, g: 255, b: 255 }
const WEBP_QUALITY = 84

// Local metres around the park (east, north).
const LAT0 = 37.406
const LNG0 = 126.63
const M_PER_DEG_LAT = 111_320
const M_PER_DEG_LNG = M_PER_DEG_LAT * Math.cos((LAT0 * Math.PI) / 180)
const toMeters = ([lat, lng]) => [(lng - LNG0) * M_PER_DEG_LNG, (lat - LAT0) * M_PER_DEG_LAT]
const toLatLng = ([east, north]) => [+(LAT0 + north / M_PER_DEG_LAT).toFixed(6), +(LNG0 + east / M_PER_DEG_LNG).toFixed(6)]

/**
 * Drawing pixel ↔ real place (OpenStreetMap). The station is one point (the middle of the three exits the
 * drawing shows): pinning each exit would squeeze the station artwork, and the app pins the exact exits.
 */
const CONTROL_POINTS = [
  { place: '송도달빛축제공원역 (1·3·4번 출구의 가운데)', px: [153.7, 422.3], ll: [37.406991, 126.626076] },
  { place: '랜드마크시티 1호 체육공원 야구장', px: [510, 350], ll: [37.408454, 126.629489] },
  { place: '랜드마크 푸르지오시티 (송도랜드마크푸르지오)', px: [270, 698], ll: [37.405016, 126.628142] },
  { place: '한라 웨스턴파크 (송도한라웨스턴파크 셀럽하우스)', px: [392, 698], ll: [37.405487, 126.629137] },
  { place: 'KB국민카드 STAGE ↔ 송도달빛축제공원 대공연장', px: [610, 805], ll: [37.405546, 126.631879] },
]

/** Read off the drawing (pixel of the full 1080×1350 image). */
const DRAWN = {
  kbStage: [610, 805],
  monsterStage: [745, 920],
  stanleyStage: [915, 800],
  gate1: [795, 600],
  gate2: [895, 920],
  securityCheck: [710, 690],
  ticketBooth1: [262, 535],
  ticketBooth2: [627, 1110],
  freeShuttlePickup: [425, 1240],
  shuttleDropOff: [515, 1240],
}
// What the map opens on: the station and the grounds.
const INITIAL_VIEW_PX = [
  [80, 330],
  [1000, 1150],
]

const pxToMeters = fitThinPlateSpline(CONTROL_POINTS.map(({ px, ll }) => [px, toMeters(ll)]))
const metersToPx = fitThinPlateSpline(CONTROL_POINTS.map(({ px, ll }) => [toMeters(ll), px]))
const pxToLatLng = (px) => toLatLng(pxToMeters(px))

function outline() {
  const { left, top, width, height } = CROP
  const points = []
  const steps = 24
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    points.push([left + width * t, top], [left + width * t, top + height], [left, top + height * t], [left + width, top + height * t])
  }
  return points.map(pxToMeters)
}

function boundsOf(metres) {
  const easts = metres.map(([e]) => e)
  const norths = metres.map(([, n]) => n)
  return { west: Math.min(...easts), east: Math.max(...easts), south: Math.min(...norths), north: Math.max(...norths) }
}

async function warp(box) {
  const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const width = Math.round((box.east - box.west) * PX_PER_METER)
  const height = Math.round((box.north - box.south) * PX_PER_METER)
  const out = Buffer.alloc(width * height * 3)
  const { left, top, width: cw, height: ch } = CROP
  for (let y = 0; y < height; y++) {
    const north = box.north - (y + 0.5) / PX_PER_METER
    for (let x = 0; x < width; x++) {
      const east = box.west + (x + 0.5) / PX_PER_METER
      const [u, v] = metersToPx([east, north])
      const o = (y * width + x) * 3
      if (u < left || v < top || u > left + cw - 1 || v > top + ch - 1) {
        out[o] = BACKGROUND.r
        out[o + 1] = BACKGROUND.g
        out[o + 2] = BACKGROUND.b
        continue
      }
      // Bilinear sample.
      const x0 = Math.floor(u)
      const y0 = Math.floor(v)
      const fx = u - x0
      const fy = v - y0
      for (let c = 0; c < 3; c++) {
        const at = (xx, yy) => data[(Math.min(yy, info.height - 1) * info.width + Math.min(xx, info.width - 1)) * 3 + c]
        const top2 = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx
        const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx
        out[o + c] = Math.round(top2 * (1 - fy) + bottom * fy)
      }
    }
  }
  return { out, width, height }
}

async function main() {
  const box = boundsOf(outline())
  const { out, width, height } = await warp(box)
  fs.mkdirSync(OUT, { recursive: true })
  await sharp(out, { raw: { width, height, channels: 3 } })
    .webp({ quality: WEBP_QUALITY })
    .toFile(path.join(OUT, `${NAME}.webp`))

  const [south, west] = toLatLng([box.west, box.south])
  const [north, east] = toLatLng([box.east, box.north])
  const view = boundsOf(
    [INITIAL_VIEW_PX[0], [INITIAL_VIEW_PX[1][0], INITIAL_VIEW_PX[0][1]], INITIAL_VIEW_PX[1], [INITIAL_VIEW_PX[0][0], INITIAL_VIEW_PX[1][1]]].map(pxToMeters),
  )
  const meta = {
    attribution: '지도 그림: 2026 인천펜타포트 락 페스티벌 공식 입장 동선 안내(실제 위치에 맞춰 변형) · 위치 기준: © OpenStreetMap 기여자',
    background: '#ffffff',
    size: [width, height],
    bounds: [
      [south, west],
      [north, east],
    ],
    initialView: [toLatLng([view.west, view.south]), toLatLng([view.east, view.north])],
    anchors: Object.fromEntries(Object.entries(DRAWN).map(([key, px]) => [key, pxToLatLng(px)])),
    marks: [],
  }
  fs.writeFileSync(path.join(OUT, `${NAME}.json`), `${JSON.stringify(meta, null, 2)}\n`)
  const check = CONTROL_POINTS.map(({ px, ll }) => {
    const [e, n] = pxToMeters(px)
    const [te, tn] = toMeters(ll)
    return Math.hypot(e - te, n - tn)
  })
  console.log(`map ${width}x${height}px →`, path.relative(ROOT, path.join(OUT, `${NAME}.webp`)), '| control point error (m):', check.map((m) => m.toFixed(2)).join(' '))
}

await main()
