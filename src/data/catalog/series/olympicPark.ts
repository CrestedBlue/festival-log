import type { Pin } from '../../schema'

/**
 * The subway stations around Olympic Park (Seoul), shared by the festivals held there (Grand Mint, Seoul Jazz):
 * every numbered exit from OpenStreetMap's subway entrances, drawn with its number on the park's area map.
 * One pin list row per station.
 */
const STATIONS = {
  mongchon: { name: '몽촌토성역', lines: '8호선' },
  hanseong: { name: '한성백제역', lines: '9호선' },
  olympicPark: { name: '올림픽공원역', lines: '5·9호선' },
}
type Exit = readonly [station: keyof typeof STATIONS, n: number, lat: number, lng: number]
const EXITS: readonly Exit[] = [
  ['mongchon', 1, 37.517706, 127.113286],
  ['mongchon', 2, 37.517037, 127.112793],
  ['mongchon', 3, 37.517032, 127.112358],
  ['mongchon', 4, 37.517585, 127.112233],
  ['mongchon', 5, 37.51783, 127.112599],
  ['hanseong', 1, 37.516363, 127.115082],
  ['hanseong', 2, 37.516675, 127.116446],
  ['hanseong', 3, 37.515876, 127.116596],
  ['hanseong', 4, 37.516072, 127.115962],
  ['olympicPark', 1, 37.5165, 127.131479],
  ['olympicPark', 2, 37.516093, 127.131227],
  ['olympicPark', 3, 37.516172, 127.130716],
  ['olympicPark', 4, 37.516432, 127.130784],
]

/** The exits as pins of the festival `code`. */
export const olympicParkExitPins = (code: string): Pin[] =>
  EXITS.map(([station, n, lat, lng]) => ({
    id: `${code}-exit-${station}-${n}`,
    name: `${STATIONS[station].name} ${n}번 출구`,
    group: `${STATIONS[station].name} 출구`,
    detail: STATIONS[station].lines,
    mapIcon: `exit-${n}`,
    kind: 'etc',
    lat,
    lng,
  }))
