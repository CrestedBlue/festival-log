// The Hero Rock map for the app (lib/big-app.mjs): the big area map alone, with the venue and the stations as icons,
// the stations' names, big landmarks along the walks and bus stops.
//   node scripts/map/layers/herorock/app.mjs   (after big-layer1.mjs) → src/assets/maps/herorock/*.svg, src/assets/maps/herorock.json
import { bigFrame } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { VENUE } from './venue.mjs'
import { OUT, ROOT } from './paths.mjs'
import { writeBigOnlyAppMap } from '../lib/big-app.mjs'

writeBigOnlyAppMap({ root: ROOT, code: 'herorock', frame: bigFrame, out: OUT, venue: VENUE, stations: STATIONS,
  landmarks: [ // [name, OSM ways or relations]
    ['송도 센트럴파크', ['8520267']], ['포스코타워-송도', ['312895052']], ['트라이볼', ['313555557']],
    ['경원재 앰배서더 인천', ['1035501454']], ['쉐라톤 인천호텔', ['13253049']], ['송도커낼워크', ['384282250']],
  ],
  openOn: ['incheonUniv'],
  attribution: '지도: 2026 히어로 락 페스티벌 공지 장소(송도컨벤시아)를 표시함 · 지형: © OpenStreetMap 기여자',
})
