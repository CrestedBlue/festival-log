import { pointInRing } from './geo.mjs'
import { ART_ZONE_RADII, SPOTS } from './zones.mjs'

/**
 * Moves the official map's marker icons (toilets, info, …) onto the redrawn map.
 * Each zone gets a least-squares affine fit from landmarks it shares with the official art (stage,
 * gates, picnic zone, …); a marker keeps its place relative to those landmarks. The few markers that
 * sit between zones use a fit over all zone centres.
 */

const solve3 = (rows, values) => {
  const ata = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  const atb = [0, 0, 0]
  rows.forEach((r, i) => {
    for (let j = 0; j < 3; j++) {
      atb[j] += r[j] * values[i]
      for (let k = 0; k < 3; k++) ata[j][k] += r[j] * r[k]
    }
  })
  const m = ata.map((r, i) => [...r, atb[i]])
  for (let i = 0; i < 3; i++) {
    let p = i
    for (let r = i + 1; r < 3; r++) if (Math.abs(m[r][i]) > Math.abs(m[p][i])) p = r
    ;[m[i], m[p]] = [m[p], m[i]]
    for (let r = 0; r < 3; r++) {
      if (r === i) continue
      const f = m[r][i] / m[i][i]
      for (let c = i; c < 4; c++) m[r][c] -= f * m[i][c]
    }
  }
  return m.map((r, i) => r[3] / r[i])
}

/** pairs: [[officialX, officialY], [drawnX, drawnY]][] → (x, y) => [x', y'] */
function fitAffine(pairs) {
  const rows = pairs.map(([[x, y]]) => [x, y, 1])
  const ax = solve3(rows, pairs.map(([, [x]]) => x))
  const ay = solve3(rows, pairs.map(([, [, y]]) => y))
  return ([x, y]) => [ax[0] * x + ax[1] * y + ax[2], ay[0] * x + ay[1] * y + ay[2]]
}

const ZONE_LABELS = {
  mintBreeze: 'Mint Breeze',
  lovingForest: 'Loving Forest Garden',
  clubMidnight: 'Club Midnight Sunset',
  hungryEast: '체조경기장–수영장 사이',
  artZone: 'Art Zone',
  ticketBooth: '티켓 부스',
  between: '공원 길가',
}

// Which zone each official marker belongs to (by id in map-src/gmf2026/markers.json).
const ZONE_OF = {
  mintBreeze: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  lovingForest: [12],
  clubMidnight: [20, 21, 22, 23, 24, 25, 26, 27],
  hungryEast: [14, 18, 19],
  artZone: [28, 29, 30, 31, 32, 33],
  ticketBooth: [34],
  between: [13, 15, 16, 17],
}

const LABEL_CLEARANCE_PX = 14
const LAWN_MARGIN_STEP = 0.06

const insidePolygon = ([x, y], polygon) => pointInRing([y, x], polygon.map(([px, py]) => [py, px]))

/** The real lawn is narrower than the official blob; pull lawn icons inward until they sit on the lawn. */
function keepInside(point, polygon, towards) {
  let [x, y] = point
  for (let t = 0; t < 1 && !insidePolygon([x, y], polygon); t += LAWN_MARGIN_STEP) {
    x = point[0] + (towards[0] - point[0]) * t
    y = point[1] + (towards[1] - point[1]) * t
  }
  // One more step so the icon is clearly on the lawn, not on its edge.
  return [x + (towards[0] - x) * LAWN_MARGIN_STEP, y + (towards[1] - y) * LAWN_MARGIN_STEP]
}

/** Icons never sit on a sign or pill: move them just below it. */
function keepOffLabels([x, y], labelBoxes) {
  const box = labelBoxes.find(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)
  return box ? [x, box[3] + LABEL_CLEARANCE_PX] : [x, y]
}

export function placeMarks(markers, proj, { domeCentre, lawnPolygon, labelBoxes }) {
  const px = (key) => [proj.x(SPOTS[key][1]), proj.y(SPOTS[key][0])]
  const fits = {
    mintBreeze: fitAffine([
      [[270, 205], px('mbStage')],
      [[270, 290], px('mbStanding')],
      [[175, 335], px('picnicMain')],
      [[270, 455], px('mainGate')],
      [[418, 372], px('subGate')],
    ]),
    lovingForest: fitAffine([
      [[597, 222], px('lfgStage')],
      [[600, 300], px('lfgGate')],
      [[535, 258], [px('lfgArea')[0] - 58, px('lfgArea')[1]]],
      [[657, 258], [px('lfgArea')[0] + 58, px('lfgArea')[1]]],
    ]),
    clubMidnight: fitAffine([
      [[530, 650], domeCentre],
      [[556, 597], px('cmsStage')],
      [[530, 537], px('gate23')],
      [[450, 587], px('gate22')],
      [[451, 728], px('gate21')],
    ]),
    artZone: fitAffine([
      [[268, 612], px('artZone')],
      [[178, 612], [px('artZone')[0] - ART_ZONE_RADII[0], px('artZone')[1]]],
      [[358, 612], [px('artZone')[0] + ART_ZONE_RADII[0], px('artZone')[1]]],
      [[268, 520], [px('artZone')[0], px('artZone')[1] - ART_ZONE_RADII[1]]],
    ]),
    between: fitAffine([
      [[270, 335], px('mbStanding')],
      [[597, 258], px('lfgArea')],
      [[530, 650], domeCentre],
      [[268, 612], px('artZone')],
      [[680, 452], px('hungryEast')],
    ]),
  }
  // The east hungry zone is drawn flatter than the official blob; place its three icons by hand.
  const [hx, hy] = px('hungryEast')
  const fixed = {
    14: [hx - 34, hy],
    18: [hx + 40, hy],
    // RADAR: beside its pill, not on the text.
    19: [px('radar')[0] + 64, px('radar')[1]],
    34: [px('ticketBooth')[0], px('ticketBooth')[1] - 40],
    // Smoking area: official map puts it by the swimming pool's east side, outside the building.
    15: [2200, 350],
  }
  // Official icons drawn inside the Mint Breeze blob (all but #1, which is outside it).
  const onLawn = new Set([2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

  return markers.map((m) => {
    const zone = Object.keys(ZONE_OF).find((z) => ZONE_OF[z].includes(m.id))
    if (!zone) throw new Error(`marker ${m.id} has no zone`)
    let point = fixed[m.id] ?? fits[zone]([m.x, m.y])
    if (onLawn.has(m.id)) point = keepInside(point, lawnPolygon, px('mbStanding'))
    const [x, y] = keepOffLabels(point, labelBoxes)
    const [lat, lng] = proj.toLatLng(x, y)
    return { id: m.id, kind: m.kind, zone: ZONE_LABELS[zone], lat, lng }
  })
}
