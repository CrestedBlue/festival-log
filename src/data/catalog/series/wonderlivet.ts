import wonderlivetArt from '../../../assets/art/wonderlivet.svg'
import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'
import { WONDERLIVET_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * WONDERLIVET (원더리벳): a J-pop and "iconic artist" festival indoors at KINTEX in Goyang, halls 7–10 of the second
 * exhibition centre (2026). Its two stages take turns all day. No festival map yet ("to be published"): the app shows
 * its big area map (scripts/map/layers/wonderlivet/), and the places come from it — the exhibition centre and the
 * middle of each station of the official directions on its track (OpenStreetMap).
 */
const PLACES: Record<string, { id: string } & Omit<Pin, 'id' | 'lat' | 'lng' | 'mapIcon'>> = {
  // named on the map (a caption): it shows from further out than the other icons
  venue: { id: 'zone-venue', name: '킨텍스 제2전시장 7–10홀 · 공연장', caption: '킨텍스 제2전시장', kind: 'stage', detail: '손목밴드 부스에서 밴드를 차고 들어가요' },
  'station-kintex': { id: 'zone-kintex-station', name: '킨텍스역 (GTX-A)', kind: 'etc', detail: '4·5번 출구로 나와요 · 행사장까지 직선 약 500 m' },
  'station-daehwa': { id: 'zone-daehwa-station', name: '대화역 (3호선)', kind: 'etc', detail: '2번 출구로 나와 킨텍스 방면 버스나 걸어서 · 직선 약 1.3 km' },
}

function pins(): Pin[] {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('WONDERLIVET map metadata is missing')
  return map.marks.map((mark) => {
    const place = PLACES[mark.kind]
    if (!place) throw new Error(`WONDERLIVET map mark ${mark.id} has unknown kind "${mark.kind}"`)
    return { ...place, id: `${CODE}-${place.id}`, mapIcon: mark.kind, lat: mark.lat, lng: mark.lng }
  })
}

export const WONDERLIVET: FestivalSeries = {
  code: CODE,
  name: '원더리벳',
  venue: { name: '킨텍스 제2전시장 7–10홀', lat: 37.664738, lng: 126.74187 },
  pins,
  sources: [
    // The timetable (2026-09-29) and full line-up (08-27) posts were read; the newer ones are artist videos. The
    // official site (wonderli.vet: FAQ, directions) is one page with no dated posts, read in full on 2026-10-27.
    { method: '인스타', value: '@wonderlivet', lastScrapedPostDate: '2026-09-29' },
  ],
  // From its Instagram and the 2026 timetable (2026-10-27): the pixel robot on a black circle as on the profile, the
  // timetable's orange darkened for the main color (cream text on it). The timetable draws WONDER STAGE in solid
  // orange and LIVET STAGE in black with an orange edge: so a bright and a deep orange. Icons: a star (wonder) and the
  // radar of the key visual ("BIAS DETECTED") — waiting for the user's look (TODO, 디자인).
  theme: {
    accent: '#a84300',
    art: wonderlivetArt,
    stages: {
      wonder: { color: '#ff6800', icon: 'star' },
      livet: { color: '#9c3d00', icon: 'radar' },
    },
  },
}
