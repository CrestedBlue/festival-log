// Official-map pixel → local metres for GMF. The GMF FESTIVAL MAP is a schematic, not a plan: one rotation + scale
// fits it badly (check-fit.mjs: average error ~73 m, a meaningless 55° turn — 88호수 is drawn east of the lawn but lies
// north of it). So each zone gets its own least-squares affine fit from landmarks it shares with the official art
// (stage, gates, …), as the earlier app map did; things between zones use a fit over all zones.
import fs from 'node:fs'
import path from 'node:path'
import { toM } from './frame.mjs'
import { SRC } from './paths.mjs'

export const CONTROL_POINTS = JSON.parse(fs.readFileSync(path.join(SRC, 'control-points.json'))) // whole-map pairs, for check-fit only
// Real places (lat, lng) of the zones' landmarks: 88잔디마당·KSPO DOME from OSM, the rest where the official map puts them
// relative to those footprints (same values as the earlier app map).
export const SPOTS = {
  mbStage: [37.51987, 127.125545], mbStanding: [37.519421, 127.12551], picnicMain: [37.518927, 127.124405], mainGate: [37.517861, 127.124844], subGate: [37.518781, 127.126019],
  lfgStage: [37.521127, 127.125453], lfgArea: [37.520925, 127.125453], lfgGate: [37.520645, 127.125453],
  domeCentre: [37.519248, 127.127527], cmsStage: [37.519477, 127.127492], gate23: [37.519836, 127.127471], gate22: [37.519432, 127.126642], gate21: [37.518635, 127.127067],
  hungryEast: [37.520117, 127.127138], radar: [37.520117, 127.128214], artZone: [37.518298, 127.127181], ticketBooth: [37.517681, 127.128002],
}
const m = (key, [de, dn] = [0, 0]) => { const [e, n] = toM(SPOTS[key]); return [e + de, n + dn] }
// Art Zone and Loving Forest areas, metres (the earlier map's 70×42 px art ellipse at 1.6 px/m; 58 px half-width).
const ART = [43.75, 26.25], LFG_HALF = 36.25
const PAIRS = {
  mintBreeze: [[[270, 205], m('mbStage')], [[270, 290], m('mbStanding')], [[175, 335], m('picnicMain')], [[270, 455], m('mainGate')], [[418, 372], m('subGate')]],
  lovingForest: [[[597, 222], m('lfgStage')], [[600, 300], m('lfgGate')], [[535, 258], m('lfgArea', [-LFG_HALF, 0])], [[657, 258], m('lfgArea', [LFG_HALF, 0])]],
  clubMidnight: [[[530, 650], m('domeCentre')], [[556, 597], m('cmsStage')], [[530, 537], m('gate23')], [[450, 587], m('gate22')], [[451, 728], m('gate21')]],
  artZone: [[[268, 612], m('artZone')], [[178, 612], m('artZone', [-ART[0], 0])], [[358, 612], m('artZone', [ART[0], 0])], [[268, 520], m('artZone', [0, ART[1]])]],
  // the east hungry zone: the official blob (x 580–740, y 408–512) laid onto the real space between 체조경기장 and
  // 올림픽수영경기장 (layer1.mjs: about e 30–180, n 80–140 m)
  hungryEast: [[[580, 460], [30, 110]], [[740, 460], [180, 110]], [[660, 408], [105, 140]], [[660, 512], [105, 80]]],
  ticketBooth: [[[272, 755], m('ticketBooth')], [[222, 755], m('ticketBooth', [-25, 0])], [[272, 730], m('ticketBooth', [0, 12])]],
  between: [[[270, 335], m('mbStanding')], [[597, 258], m('lfgArea')], [[530, 650], m('domeCentre')], [[268, 612], m('artZone')], [[680, 452], m('hungryEast')]],
}
const solve3 = (rows, values) => {
  const ata = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], atb = [0, 0, 0]
  rows.forEach((r, i) => { for (let j = 0; j < 3; j++) { atb[j] += r[j] * values[i]; for (let k = 0; k < 3; k++) ata[j][k] += r[j] * r[k] } })
  const mm = ata.map((r, i) => [...r, atb[i]])
  for (let i = 0; i < 3; i++) {
    let p = i; for (let r = i + 1; r < 3; r++) if (Math.abs(mm[r][i]) > Math.abs(mm[p][i])) p = r
    ;[mm[i], mm[p]] = [mm[p], mm[i]]
    for (let r = 0; r < 3; r++) { if (r === i) continue; const f = mm[r][i] / mm[i][i]; for (let c = i; c < 4; c++) mm[r][c] -= f * mm[i][c] }
  }
  return mm.map((r, i) => r[3] / r[i])
}
const fitAffine = (pairs) => { const rows = pairs.map(([[x, y]]) => [x, y, 1]); const ax = solve3(rows, pairs.map(([, [e]]) => e)), ay = solve3(rows, pairs.map(([, [, n]]) => n)); return ([x, y]) => [ax[0] * x + ax[1] * y + ax[2], ay[0] * x + ay[1] * y + ay[2]] }
const FITS = Object.fromEntries(Object.entries(PAIRS).map(([z, p]) => [z, fitAffine(p)]))
export const ZONES = Object.keys(PAIRS)
/** Official pixel → local metres with the fit of the zone the thing belongs to. */
export const officialToM = (s, zone = 'between') => { const f = FITS[zone]; if (!f) throw new Error(`no fit for zone ${zone}`); return f(s) }
