// The SJF map (lib/venue-map.mjs): the official 2026 festival map's four stages on the real places it names — MAY FOREST
// on 88잔디마당 (the stage at its north-west corner, the standing zone before it, picnic zones around), SPARKLING DOME =
// KSPO DOME, PINK AVENUE = 티켓링크 라이브 아레나 (the handball arena), SPRING GARDEN = 88호수 수변무대 — inside the park
// the map's festival route takes in, over Olympic Park's big area map with its three stations.
//   node scripts/map/layers/sjf/map.mjs   → map-src/sjf/layers/out/, src/assets/maps/sjf/, src/assets/maps/sjf.json
import { frame, bigFrame } from './frame.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { buildVenueMap } from '../lib/venue-map.mjs'

const ll = (pts) => pts.map((p) => frame.toLL(p))
// GMF's lines (Seoul Metro colours); keys name their exits' pins (series/olympicPark.ts)
const LINE = { 5: { text: '5', colour: '#996cac' }, 8: { text: '8', colour: '#e6186c' }, 9: { text: '9', colour: '#bdb092' } }
await buildVenueMap({ root: ROOT, code: 'sjf', out: OUT, cache: CACHE, frame, bigFrame,
  // GMF's venue (lawn, 수변무대, the dome) widened south over the handball arena, local metres
  venue: { fill: '#abcd82', ll: ll([[-220, -20], [-215, 40], [-200, 110], [-150, 160], [-95, 205], [-80, 250], [-45, 275], [-5, 255], [-15, 215], [20, 150], [90, 145],
    [160, 150], [220, 150], [255, 145], [282, 118], [268, 88], [240, 70], [232, 40], [215, -40], [215, -120], [205, -175], [160, -185], [110, -160], [100, -170], [95, -250],
    [-25, -250], [-30, -160], [-60, -140], [-120, -145], [-170, -125], [-205, -80]]) },
  zones: [
    { name: 'lawn', label: '피크닉존', colour: '#62b45e', osm: ['469354406'], labelAt: frame.toLL([-60, -40]) }, // 88잔디마당
    { name: 'standing', label: '스탠딩존', colour: '#f4a9bb', solid: true, ll: ll([[-150, 70], [-95, 95], [-60, 20], [-115, -5]]) },
    { name: 'forest', label: 'MAY FOREST', unnamed: true, colour: '#e2557a', solid: true, ll: ll([[-185, 85], [-160, 110], [-140, 100], [-165, 72]]) },
    { name: 'garden', label: 'SPRING GARDEN', unnamed: true, colour: '#8fcc9a', ll: ll([[-95, 212], [-62, 262], [-22, 262], [0, 226], [-30, 202], [-72, 198]]) },
    { name: 'dome', label: 'SPARKLING DOME', unnamed: true, colour: '#9aa3c8', solid: true, osm: ['75956855'] }, // KSPO DOME
    { name: 'avenue', label: 'PINK AVENUE', unnamed: true, colour: '#b4b0a2', solid: true, osm: ['75956853'] }, // 티켓링크 라이브 아레나
  ],
  stages: [
    { text: 'MAY FOREST', stage: 'forest', colour: '#e2557a', at: [37.5197, 127.1244] },
    { text: 'SPARKLING DOME', stage: 'dome', colour: '#4f5a7a', at: [37.5193, 127.1272] },
    { text: 'PINK AVENUE', stage: 'avenue', colour: '#6e6e64', at: [37.5176, 127.12635] },
    { text: 'SPRING GARDEN', stage: 'garden', colour: '#4f9a62', at: [37.521426, 127.125532] },
  ],
  stations: [
    { key: 'mongchon', name: '몽촌토성역', near: [-1170, -175], lines: [LINE[8]] },
    { key: 'hanseong', name: '한성백제역', near: [-895, -305], lines: [LINE[9]] },
    { key: 'olympicPark', name: '올림픽공원역', near: [445, -300], lines: [LINE[5], LINE[9]] },
  ],
  landmarks: [['평화의광장', ['473971980']], ['올림픽수영경기장', ['75956856']], ['한성백제박물관', ['415026027']]],
  openOn: [[37.5162, 127.123], [37.5218, 127.1293]],
  attribution: '지도: 서울재즈페스티벌 2026 페스티벌 맵의 무대·구역을 올림픽공원 실제 모양에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
