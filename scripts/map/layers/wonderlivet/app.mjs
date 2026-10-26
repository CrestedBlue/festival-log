// The WONDERLIVET map for the app (lib/big-app.mjs): the big area map alone, with the venue and the stations as icons,
// the stations' names, big landmarks along the walks and bus stops.
//   node scripts/map/layers/wonderlivet/app.mjs   (after big-layer1.mjs) → src/assets/maps/wonderlivet/*.svg, src/assets/maps/wonderlivet.json
import { bigFrame } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { VENUE } from './venue.mjs'
import { OUT, ROOT } from './paths.mjs'
import { writeBigOnlyAppMap } from '../lib/big-app.mjs'

writeBigOnlyAppMap({ root: ROOT, code: 'wonderlivet', frame: bigFrame, out: OUT, venue: VENUE, stations: STATIONS,
  landmarks: [ // [name, OSM ways or relations]
    ['킨텍스 제1전시장', ['264042512']], ['이마트타운 킨텍스점', ['452964093']], ['원마운트', ['9107957']],
    ['고양종합운동장', ['613824923']], ['킨텍스온누리공원', ['603105290']],
  ],
  openOn: ['kintex'],
  attribution: '지도: 원더리벳 2026 공연장(킨텍스 제2전시장)을 표시함 · 지형: © OpenStreetMap 기여자',
})
