// The Let's Rock map (lib/venue-map.mjs): 젊음의광장, the oval lawn of 난지한강공원 the official 2026 site map draws, in its
// greens, over the park. The site map gives no direction, so its stage, zones and booths are not placed: the stage's
// name and icon stand on the lawn as a whole (the info tab has the site map itself).
//   node scripts/map/layers/letsrock/map.mjs   → map-src/letsrock/layers/out/, src/assets/maps/letsrock/, src/assets/maps/letsrock.json
import { frame, bigFrame } from './frame.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { buildVenueMap } from '../lib/venue-map.mjs'

await buildVenueMap({ root: ROOT, code: 'letsrock', out: OUT, cache: CACHE, frame, bigFrame,
  venue: { fill: '#2f9e44', osm: ['474337652'] }, // 젊음의광장
  zones: [{ name: 'lawn', label: '젊음의광장', unnamed: true, colour: '#7ccd5a', edge: '#e9f5d8', osm: ['474337652'] }],
  stages: [{ text: '메인 무대 · 젊음의광장', stage: 'main', colour: '#0b7cbf', at: [37.56598, 126.87733] }],
  landmarks: [['익스트림장', ['1060013210']]],
  attribution: '지도: 렛츠락 페스티벌 2026 사이트맵의 행사장(젊음의광장)을 표시함 · 지형: © OpenStreetMap 기여자',
})
