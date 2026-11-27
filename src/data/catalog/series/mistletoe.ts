import mistletoeArt from '../../../assets/art/mistletoe.webp'
import mistletoeMark from '../../../assets/mark/mistletoe.webp'
import type { Pin } from '../../schema'
import { MISTLETOE_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * mistletoe: a Christmas live gig at 201P (201punks), a small club in the basement of 창천동 52-56 by Sinchon station
 * (2026-12-05, two sets). No illustrated map: the map tab shows the plain tile map with the club (OpenStreetMap
 * "201punks", 연세로7안길 17) and the nearest exit of Sinchon station (line 2) the club's page points to.
 */
const VENUE = { name: '201P (신촌 201punks)', lat: 37.5580433, lng: 126.9358068 }

const pins = (): Pin[] => [
  { id: `${CODE}-venue`, name: VENUE.name, kind: 'stage', lat: VENUE.lat, lng: VENUE.lng, detail: '창천동 52-56 지하 1층 · 주차 어려움' },
  { id: `${CODE}-sinchon-station`, name: '신촌역 (2호선)', kind: 'etc', lat: 37.5552, lng: 126.9368, detail: '공연장까지 걸어서 약 5분' },
]

export const MISTLETOE: FestivalSeries = {
  code: CODE,
  name: 'mistletoe',
  venue: VENUE,
  pins,
  // The ticket page (201p.me/39/?idx=399, read 2026-11-27) is the only source. No Instagram: the @201punks that
  // OpenStreetMap lists does not exist (checked 2026-11-27), so none is shown.
  sources: [
    { method: '공홈', value: 'https://201p.me/39/?idx=399', lastScrapedPostDate: '2026-11-27' },
  ],
  // From the 2026 poster (scripts/art/build-mistletoe.mjs): its red lettering on a cream circle, the red deepened for
  // the main color (cream text on it). The one stage is the club, in the poster's pine green.
  theme: {
    accent: '#c41a22',
    art: mistletoeArt,
    mark: mistletoeMark,
    stages: { club: { color: '#2f6b3a', icon: 'star' } },
  },
}
