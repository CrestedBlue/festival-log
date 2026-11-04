// The BML map (lib/venue-map.mjs): the official 2026 festival map's zones on 문화비축기지 — the plaza 문화마당 with the
// Mint Breeze stage along its north edge, the standing zone before it and the leisure zone south of that; the tanks T2
// (Loving Forest Garden outdoors, Flood in the Cave in the hall), T1 (flea market) and T6 as the grey circles the map
// draws round them; the park's grass and its tan paths — over the area from 월드컵경기장역 to the 난지천공원 car park.
//   node scripts/map/layers/bml/map.mjs   → map-src/bml/layers/out/, src/assets/maps/bml/, src/assets/maps/bml.json
import { frame, bigFrame } from './frame.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { buildVenueMap } from '../lib/venue-map.mjs'

// a circle round a tank, [lat, lng] (radius in metres)
const circle = ([lat, lng], r) => Array.from({ length: 24 }, (_, i) => frame.toLL([frame.toM([lat, lng])[0] + r * Math.cos((i * Math.PI) / 12), frame.toM([lat, lng])[1] + r * Math.sin((i * Math.PI) / 12)]))
// Colours of the official map: grass, grey plaza and tanks, tan paths and standing zone.
const GREY = '#bdbdbf'
await buildVenueMap({ root: ROOT, code: 'bml', out: OUT, cache: CACHE, frame, bigFrame,
  venue: { fill: '#6cc644', path: '#cdb78f', osm: ['690412540'] }, // the park 문화비축기지
  zones: [
    { name: 't2', label: 'T2', unnamed: true, colour: GREY, ll: circle([37.57208, 126.89253], 36) },
    { name: 't1', label: '플리마켓 (T1)', colour: GREY, ll: circle([37.57145, 126.8922], 24), labelAt: [37.57145, 126.8922] },
    { name: 't6', label: 'T6', unnamed: true, colour: GREY, ll: circle([37.57129, 126.89328], 20) },
    // 문화마당, read on the satellite
    { name: 'plaza', label: '문화마당', unnamed: true, colour: GREY, solid: true, ll: [[37.57099, 126.89351], [37.57121, 126.89361], [37.57133, 126.89412], [37.57111, 126.89449], [37.57108, 126.89472], [37.57108, 126.89498], [37.5709, 126.89502], [37.57017, 126.895], [37.57003, 126.89487], [37.57, 126.89449], [37.57008, 126.89412], [37.57026, 126.89386], [37.57058, 126.89352]] },
    { name: 'standing', label: '스탠딩존', colour: '#cdb78f', solid: true, ll: [[37.57089, 126.89375], [37.57089, 126.89472], [37.57048, 126.89472], [37.57048, 126.89375]] },
    { name: 'leisure', label: '레저존', colour: '#9a9a9c', solid: true, ll: [[37.57039, 126.8942], [37.57042, 126.89472], [37.57026, 126.89491], [37.5701, 126.89473], [37.57012, 126.89431]] },
    { name: 'stage', label: '무대', unnamed: true, colour: '#3c3c40', solid: true, ll: [[37.57121, 126.89361], [37.57133, 126.89412], [37.57111, 126.89449], [37.57108, 126.89481], [37.57091, 126.89481], [37.57096, 126.89358]] },
  ],
  stages: [
    { text: 'Mint Stage', stage: 'mint', colour: '#23966a', at: [37.57112, 126.89395] },
    { text: 'Breeze Stage', stage: 'breeze', colour: '#2d9bb0', at: [37.57099, 126.8946] },
    { text: 'Loving Forest Garden', stage: 'forest', colour: '#e0607f', at: [37.5722, 126.8924] }, // T2's outdoor stage
    { text: 'Flood in the Cave', stage: 'cave', colour: '#3f7fd9', at: [37.57196, 126.89272] }, // T2's hall
  ],
  stations: [{ key: 'worldCupStadium', name: '월드컵경기장역', near: [423, -145], radius: 170, lines: [{ text: '6', colour: '#cd7c2f' }] }],
  landmarks: [['서울월드컵경기장', ['2241251']], ['난지천공원', ['180889']]],
  attribution: '지도: 뷰티풀 민트 라이프 2026 페스티벌 맵의 구역을 문화비축기지 실제 모양에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
