import wonderlivetArt from '../../../assets/art/wonderlivet.svg'
import wonderlivetMark from '../../../assets/mark/wonderlivet.svg'
import { RANK } from '../../../features/map/pinGroups'
import type { Pin } from '../../schema'
import { WONDERLIVET_SERIES as CODE } from '../ids'
import { stationPins, type StationPlace } from './bigMapPins'
import type { FestivalSeries } from './types'

/**
 * WONDERLIVET (원더리벳): a J-pop and "iconic artist" festival indoors at KINTEX in Goyang, halls 7–10 of the second
 * exhibition centre (2026). Its two stages take turns all day: WONDER STAGE in halls 7·8, LIVET STAGE in hall 10.
 * The map (scripts/map/layers/wonderlivet/map.mjs) lays the official 2026 festival map (Instagram, 2026-11-09) onto the
 * real halls (KINTEX's floor plans on the building's outline in OpenStreetMap) and names the stages, so the stages are
 * not listed as pins. The booths, gates, ticket booth (wristbands) and information, and the 2F lobby's lockers and wheelchair
 * zones are where the festival map's pins point, laid on the same way (the festival map is not to scale, so within
 * some metres); the restrooms are KINTEX's own on the lobby side of the halls (its floor plan, not on the festival map).
 * The coordinates come from the map script (it prints them; check image preview-venue.jpg). The stations of the
 * official directions and their numbered exits come from the map (OpenStreetMap).
 */
type Place = Omit<Pin, 'id' | 'lat' | 'lng'>
const at = (key: string, place: Place, lat: number, lng: number): Pin => ({ id: `${CODE}-${key}`, ...place, lat, lng })
const FNB: Place = { name: '음식·음료 부스', group: '음식·음료 부스', kind: 'food' }
const BAR: Place = { name: '주류 부스', group: '주류 부스', kind: 'food', mapIcon: 'bar' }
const CONTENTS: Place = { name: '콘텐츠 부스', group: '콘텐츠 부스', kind: 'etc', mapIcon: 'promotionBooth' }
const WHEELCHAIR: Place = { name: '휠체어존', group: '휠체어존', kind: 'etc', mapIcon: 'barrierFreeZone', rank: RANK.barrierFree }
const RESTROOM: Place = { name: '화장실', group: '화장실', kind: 'toilet' }

const PINS: readonly Pin[] = [
  at('gate-wonder', { name: 'WONDER STAGE 게이트', kind: 'etc', mapIcon: 'gate', rank: RANK.entrance, detail: '7·8홀 · 1층 로비 쪽' }, 37.664477, 126.742707),
  at('gate-livet', { name: 'LIVET STAGE 게이트', kind: 'etc', mapIcon: 'gate', rank: RANK.entrance, detail: '10홀 · 1층 로비 쪽 (9홀 가까이)' }, 37.665358, 126.74149),
  // drawn on the lobby floor at its 킨텍스역 end, past the halls: put just inside the glass front there (places.mjs)
  // the festival map's "WRISTBAND BOOTH": 티켓부스, as the notices call it (the user, 2026-10-27)
  at('wristband', { name: '티켓부스 (대략)', kind: 'wristband', rank: RANK.entrance, detail: '손목밴드를 차는 곳 · 1층 로비 킨텍스역 쪽 입구 안 · 10:00부터 공연이 끝날 때까지' }, 37.664756, 126.742347),
  at('info', { name: '인포메이션 (대략)', kind: 'info', detail: '1층 로비 킨텍스역 쪽 입구 안 · 티켓부스 옆' }, 37.664783, 126.742165),
  at('fnb-wonder', { ...FNB, detail: '8홀 · WONDER STAGE 뒤쪽' }, 37.663529, 126.742979),
  at('bar-wonder', { ...BAR, detail: '8홀 · WONDER STAGE 뒤쪽' }, 37.663115, 126.742705),
  at('photo-wonder', { name: '포토존', kind: 'photo', detail: '8홀 · 페스티벌 맵의 카메라 표시' }, 37.663482, 126.742566),
  at('contents-wonder', { ...CONTENTS, detail: '8홀 · WONDER STAGE 뒤쪽' }, 37.66379, 126.742381),
  at('goods', { name: '굿즈 부스', kind: 'shop', detail: '9홀 · 현장 구매와 예약 픽업 · 11:30–21:00' }, 37.664545, 126.740504),
  at('contents-livet', { ...CONTENTS, detail: '9홀' }, 37.664875, 126.740211),
  at('bar-livet', { ...BAR, detail: '9홀' }, 37.664368, 126.739944),
  at('fnb-livet', { ...FNB, detail: '9홀' }, 37.664554, 126.73973),
  at('lockers', { name: '물품보관소', kind: 'luggage', detail: '2층 9홀 앞 로비 · 09:00–23:00쯤' }, 37.664359, 126.740861),
  at('wheelchair-hall7', { ...WHEELCHAIR, detail: '2층 로비 · 7홀 쪽' }, 37.664848, 126.742494),
  at('wheelchair-middle', { ...WHEELCHAIR, detail: '2층 로비 · 가운데' }, 37.6653, 126.741552),
  at('restroom-hall7-north', { ...RESTROOM, detail: '1층 · 7홀 옆 (WONDER STAGE 쪽)' }, 37.665164, 126.743128),
  at('restroom-hall7-south', { ...RESTROOM, detail: '1층 · 7홀 옆' }, 37.664257, 126.742481),
  at('restroom-hall8', { ...RESTROOM, detail: '1층 · 8홀 옆' }, 37.663537, 126.741968),
  at('restroom-hall10-north', { ...RESTROOM, detail: '1층 · 10홀 옆 (LIVET STAGE 쪽)' }, 37.666092, 126.741849),
  at('restroom-hall10-south', { ...RESTROOM, detail: '1층 · 10홀 옆' }, 37.665396, 126.741545),
  at('restroom-hall9-north', { ...RESTROOM, detail: '1층 · 9홀 옆' }, 37.664699, 126.741065),
  at('restroom-hall9-south', { ...RESTROOM, detail: '1층 · 9홀 옆' }, 37.664117, 126.740532),
]
const STATIONS: Record<string, StationPlace> = {
  kintex: { id: 'zone-kintex-station', name: '킨텍스역 (GTX-A)', kind: 'etc', detail: '4·5번 출구로 나와요 · 행사장까지 직선 약 500 m', station: '킨텍스역', line: 'GTX-A' },
  daehwa: { id: 'zone-daehwa-station', name: '대화역 (3호선)', kind: 'etc', detail: '2번 출구로 나와 킨텍스 방면 버스나 걸어서 · 직선 약 1.3 km', station: '대화역', line: '3호선' },
}

export const WONDERLIVET: FestivalSeries = {
  code: CODE,
  name: '원더리벳',
  venue: { name: '킨텍스 제2전시장 7–10홀', lat: 37.664738, lng: 126.74187 },
  pins: () => [...PINS, ...stationPins(CODE, STATIONS)],
  sources: [
    // The timetable (2026-09-29) and full line-up (08-27) posts were read; the newer ones (to 10/30, read 2026-10-31) are artist videos. The
    // official site (wonderli.vet: FAQ, directions) is one page with no dated posts, read in full on 2026-10-27.
    { method: '인스타', value: '@wonderlivet', lastScrapedPostDate: '2026-11-12' },
  ],
  // From its Instagram and the 2026 timetable (2026-10-27): the pixel robot on a black circle as on the profile, the
  // timetable's orange darkened for the main color (cream text on it). The timetable draws WONDER STAGE in solid
  // orange and LIVET STAGE in black with an orange edge: so a bright and a deep orange. Icons: a star (wonder) and the
  // radar of the key visual ("BIAS DETECTED") — waiting for the user's look (TODO, 디자인).
  theme: {
    accent: '#a84300',
    art: wonderlivetArt,
    mark: wonderlivetMark,
    stages: {
      wonder: { color: '#ff6800', icon: 'star' },
      livet: { color: '#9c3d00', icon: 'radar' },
    },
  },
}
