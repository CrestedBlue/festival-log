// The KINTEX big area map for the app (lib/big-app.mjs) — for the festivals in these halls whose own map is still to
// come (CDF, THE GLOW): the big area map alone, with the venue and the stations as icons, the stations' names, big
// landmarks along the walks and bus stops. Each festival names itself in the credit (src/features/map/festivalMaps.ts).
//   node scripts/map/layers/wonderlivet/app.mjs   (after big-layer1.mjs) → src/assets/maps/kintex/*.svg, src/assets/maps/kintex.json
import { bigFrame } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { VENUE } from './venue.mjs'
import { LANDMARKS } from './landmarks.mjs'
import { OUT_KINTEX, ROOT } from './paths.mjs'
import { writeBigOnlyAppMap } from '../lib/big-app.mjs'

writeBigOnlyAppMap({ root: ROOT, code: 'kintex', frame: bigFrame, out: OUT_KINTEX, venue: VENUE, stations: STATIONS,
  landmarks: LANDMARKS,
  openOn: ['kintex'],
  attribution: '지도: 공연장(킨텍스 제2전시장)을 표시함 · 지형: © OpenStreetMap 기여자',
})
