import jumfArt from '../../../assets/art/jumf.webp'
import jumfMark from '../../../assets/mark/jumf.webp'
import { RANK } from '../../../features/map/pinGroups'
import type { Pin } from '../../schema'
import { JUMF_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * JUMF (전주얼티밋뮤직페스티벌): MARU and NEOUL, the two outdoor main stages side by side on Jeonju University's
 * artificial-turf fields A and B, and SOOM indoors in the gym (also a cool zone), per the official 2026 site maps.
 * Coordinates: OpenStreetMap ("A구장"/"B구장", "체육관", "교수연수동"). The campus site map is drawn with east at the
 * bottom (the main gate); turned that way, its indoor gym is OSM's "체육관" right west of the main stadium.
 * The main-stage site map is drawn about north up (the stages at the north end of field B, the main gate at the south-west
 * corner of field A, the F&B and cool-zone tent being the air dome 희망홀 west of the fields); its booths and buses are
 * set by the field edge and the road they are drawn beside, on the satellite and OpenStreetMap views (2026-11-04).
 * The map (scripts/map/layers/jumf/) draws the main-stage site map's zones on the real fields and names the stages
 * (with their icons), so the stages are not listed as pins; the pins carry the app's pin designs (mapIcon).
 */
type Place = Omit<Pin, 'id' | 'lat' | 'lng'>
const at = (key: string, place: Place, lat: number, lng: number): Pin => ({ id: `${CODE}-${key}`, ...place, lat, lng })

const PINS: readonly Pin[] = [
  at('gate-main', { name: '메인 게이트', kind: 'etc', mapIcon: 'gate', rank: RANK.entrance, detail: '인조잔디구장 남서쪽 모서리' }, 35.8106, 127.087),
  at('ticket', { name: '티켓부스 · MD SHOP', kind: 'wristband', rank: RANK.entrance, detail: '구장 동쪽 길 건너 · 셔틀버스 주차장 옆' }, 35.8116, 127.0885),
  at('zone-shuttle', { name: '셔틀버스 승하차 · 교수연구동 주차장 (대략)', kind: 'etc', mapIcon: 'shuttle' }, 35.81206, 127.090161),
  at('fnb', { name: 'F&B · 쿨존 · 희망홀', kind: 'food', detail: '구장 서쪽 에어돔' }, 35.8116, 127.0865),
  at('coffee', { name: '커피 (COFFEE)', kind: 'food', detail: '피크닉존 동쪽' }, 35.8117, 127.0879),
  at('toilet', { name: '화장실', kind: 'toilet', detail: '구장 서쪽' }, 35.8111, 127.0866),
  at('luggage', { name: '물품보관소', kind: 'luggage', detail: '메인 게이트 옆' }, 35.8105, 127.0872),
  at('info', { name: '종합안내소', kind: 'info', detail: '구장 남쪽' }, 35.8105, 127.0876),
  at('medical', { name: '온열환자 & 응급버스', kind: 'firstaid', detail: '구장 동쪽 길' }, 35.8112, 127.0883),
  at('cooling', { name: '쿨링 수소버스', kind: 'etc', mapIcon: 'coolZone', rank: RANK.coolZone, detail: '구장 동쪽 길' }, 35.811, 127.0883),
  at('barrier-free', { name: '배리어프리존', kind: 'etc', mapIcon: 'barrierFreeZone', rank: RANK.barrierFree, detail: '스탠딩존 뒤 F.O.H 옆' }, 35.8119, 127.0874),
  at('charging', { name: '충전존', kind: 'etc', mapIcon: 'charging', detail: '캠핑존 동쪽' }, 35.8107, 127.0879),
  at('flea', { name: '플리마켓', kind: 'etc', mapIcon: 'vendorBooth', detail: '구장 동쪽 길' }, 35.8108, 127.0883),
  at('photo', { name: '포토블링', kind: 'photo', detail: '구장 동쪽 길' }, 35.8106, 127.0883),
  at('smoking-west', { name: '흡연구역', group: '흡연구역', kind: 'smoking', detail: '구장 서쪽' }, 35.8113, 127.0864),
  at('smoking-east', { name: '흡연구역', group: '흡연구역', kind: 'smoking', detail: '구장 남동쪽' }, 35.8105, 127.0883),
]

export const JUMF: FestivalSeries = {
  code: CODE,
  name: '전주얼티밋뮤직페스티벌',
  venue: { name: '전주대학교 인조잔디구장', lat: 35.81149, lng: 127.08738 },
  pins: () => [...PINS],
  sources: [
    // The newest 12 posts were read on 2026-10-31: after the site's notices only MD and photo-sketch posts.
    { method: '인스타', value: '@jumfesta', lastScrapedPostDate: '2026-10-06' },
    // Every 2026 notice was gone through by title up to the lost-and-found post of 2026-08-19 (2026-10-22).
    { method: '공홈', value: 'https://www.jumf.co.kr/24', lastScrapedPostDate: '2026-08-19' },
  ],
  // From its Instagram and the 2026 timetable (2026-10-22): the logo on a blue guitar pick as on the profile
  // (scripts/art/build-jumf.mjs), a deeper blue as the main color, and each stage's own color from the timetable.
  // Icons follow the stage names: 마루 (a hanok's wooden floor), 너울 (a big swell), 숨 (breath).
  theme: {
    accent: '#0a5cc2',
    art: jumfArt,
    mark: jumfMark,
    stages: {
      maru: { color: '#d650bd', icon: 'roof' },
      neoul: { color: '#9251d6', icon: 'wave' },
      soom: { color: '#007396', icon: 'breath' },
    },
  },
}
