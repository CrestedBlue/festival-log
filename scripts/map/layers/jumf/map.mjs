// The JUMF map (lib/venue-map.mjs): the official 2026 main-stage site map's zones on the real fields — the stages along
// the north end of field B with the standing zone before them, the picnic and camping zones on field A, the strip east
// of field A (coffee, partner booths, water play, charging), F&B and the cool zone in the air dome 희망홀 west of field
// B — over the campus. SOOM is indoors, in the gym (체육관) east of the campus road.
//   node scripts/map/layers/jumf/map.mjs   → map-src/jumf/layers/out/, src/assets/maps/jumf/, src/assets/maps/jumf.json
import { frame, bigFrame } from './frame.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { buildVenueMap } from '../lib/venue-map.mjs'

// Colours of the official site map: dark green ground, light green zones, the navy stage, the lavender air dome.
const ZONE = '#8cc63e', EDGE = '#e9f5d8'
await buildVenueMap({ root: ROOT, code: 'jumf', out: OUT, cache: CACHE, frame, bigFrame,
  // fields A and B, the strip east of A and the dome, a few metres out (read on the satellite)
  venue: { fill: '#1e8f3c', ll: [[35.81218, 127.08612], [35.81242, 127.08655], [35.81246, 127.08785], [35.81176, 127.08806], [35.81176, 127.08818],
    [35.8106, 127.08826], [35.81045, 127.0872], [35.81143, 127.08692], [35.81128, 127.08682], [35.81112, 127.08648], [35.8112, 127.08612], [35.8118, 127.086]] },
  zones: [
    { name: 'standing', edge: EDGE, label: '스탠딩존', colour: ZONE, osm: ['473813828'] }, // field B
    { name: 'picnic', edge: EDGE, label: '피크닉존', colour: ZONE, ll: [[35.81149, 127.08697], [35.81163, 127.08775], [35.81103, 127.08791], [35.81093, 127.08712]] },
    { name: 'camping', edge: EDGE, label: '캠핑존', colour: ZONE, ll: [[35.81091, 127.08713], [35.81101, 127.08792], [35.81067, 127.08801], [35.81053, 127.08724]] },
    { name: 'partner', edge: EDGE, label: '파트너존', colour: ZONE, ll: [[35.81166, 127.08797], [35.81168, 127.08812], [35.81066, 127.08818], [35.81069, 127.08805]] },
    { name: 'stage', label: '무대', unnamed: true, colour: '#173c8c', solid: true, ll: [[35.81209, 127.08662], [35.81229, 127.08776], [35.81216, 127.0878], [35.81196, 127.08666]] },
    { name: 'dome', label: 'F&B · 쿨존', colour: '#a5a3ee', solid: true, osm: ['473813830'] }, // 희망홀
  ],
  stages: [
    { text: '마루 MARU', stage: 'maru', colour: '#d650bd', at: [35.81205, 127.08695] },
    { text: '너울 NEOUL', stage: 'neoul', colour: '#9251d6', at: [35.81216, 127.08752] },
    { text: '숨 SOOM', stage: 'soom', colour: '#007396', at: [35.81227, 127.09169] }, // the gym
  ],
  landmarks: [['전주대학교 대학본관', ['116065340']], ['학생회관', ['116065354']]],
  attribution: '지도: 2026 JUMF 메인 스테이지 사이트맵의 구역을 실제 구장에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
