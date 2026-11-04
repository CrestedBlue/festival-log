import busanRockArt from '../../../assets/art/busanrock.webp'
import busanRockMark from '../../../assets/mark/busanrock.webp'
import type { Pin } from '../../schema'
import { BUSAN_ROCK_SERIES as CODE } from '../ids'
import { stationPins, type StationPlace } from './bigMapPins'
import type { FestivalSeries } from './types'

/**
 * Busan International Rock Festival (부산국제록페스티벌): held at Samnak Ecological Park on the Nakdong River every
 * autumn, on five stages in 2026 — SAMROCK, GREEN, RIVER, WAVE and the free HIDDEN stage. The map
 * (scripts/map/layers/busanrock/) draws the official app's layout on the park's sports grounds and names the stages.
 */
// Places of the official app's map (its notice "공식 어플리케이션 안내", 2026), carried onto the ground as the map is
// (scripts/map/layers/busanrock/map.mjs: the drawing has south up). Roughly placed, so marked (대략).
type Place = Omit<Pin, 'id' | 'lat' | 'lng'>
const at = (key: string, place: Place, lat: number, lng: number): Pin => ({ id: `${CODE}-${key}`, ...place, lat, lng })
const LOUNGE: Place = { name: 'FOOD LOUNGE (대략)', group: 'FOOD LOUNGE', kind: 'food', detail: '행사장 A 서쪽' }
const PINS: readonly Pin[] = [
  at('ticket', { name: '티켓부스 (대략)', kind: 'wristband', rank: 0, detail: '행사장 A 남동쪽 · 메인 게이트 가는 길' }, 35.1651, 128.974173),
  at('gate-main', { name: 'MAIN GATE (대략)', kind: 'etc', mapIcon: 'gate', rank: 0, detail: '행사장 A 남쪽' }, 35.166322, 128.9735),
  at('luggage', { name: '물품보관소 (대략)', kind: 'luggage', detail: '메인 게이트 동쪽' }, 35.166169, 128.975228),
  at('shuttle', { name: '사상역 순환버스 승하차장 (대략)', kind: 'etc', mapIcon: 'shuttle', detail: '행사장 동쪽 길' }, 35.166551, 128.975742),
  at('lounge-south', LOUNGE, 35.168269, 128.971193),
  at('lounge-north', LOUNGE, 35.169529, 128.971212),
]
const STATIONS: Record<string, StationPlace> = {
  sasang: { id: 'zone-sasang-station', name: '사상역 (2호선 · 부산김해경전철)', group: '가까운 역', detail: '순환버스로 행사장까지', kind: 'etc', station: '사상역', line: '2호선 · 부산김해경전철' },
}

export const BUSAN_ROCK: FestivalSeries = {
  code: CODE,
  name: '부산국제록페스티벌',
  venue: { name: '삼락생태공원', lat: 35.165725, lng: 128.97382 },
  pins: () => [...PINS, ...stationPins(CODE, STATIONS)],
  sources: [
    // The newest 12 posts were read on 2026-10-29: the 10/12 lost-and-found post is the only one the site lacks.
    { method: '인스타', value: '@busanrockfest', lastScrapedPostDate: '2026-10-12' },
    // The 2026 notices were gone through by title up to the DAY3 post of 2026-10-05 (2026-10-28).
    { method: '공홈', value: 'https://busanrockfestival.com/notice/', lastScrapedPostDate: '2026-10-05' },
  ],
  // From the 2026 site and timetable (2026-10-28): the black wordmark on a circle of the timetable's mint sky
  // (scripts/art/build-busanrock.mjs), a deep teal of that sky for the main color. Stage colors are the timetable's
  // own (yellow, green, pink, cyan, purple), deepened to read on the app's paper. Icons: SAMROCK a bolt, GREEN a leaf,
  // RIVER a wave, WAVE a breath of sound, HIDDEN a star.
  theme: {
    accent: '#13737a',
    art: busanRockArt,
    mark: busanRockMark,
    stages: {
      samrock: { color: '#c9a100', icon: 'bolt' },
      green: { color: '#4fae3a', icon: 'leaf' },
      river: { color: '#e0679a', icon: 'wave' },
      wave: { color: '#1d9fb0', icon: 'breath' },
      hidden: { color: '#8a6fd6', icon: 'star' },
    },
  },
}
