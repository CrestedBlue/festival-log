// The stations on the big area map: lib/big-layer1.mjs draws their boxes along the track, the app writes their names
// and draws them as icons (the catalog's "가까운 역"). near: [e, n] metres around the exits.
const INCHEON_1 = { text: '인천1', colour: '#7ca8d5' }
export const STATIONS = [
  { key: 'incheonUniv', name: '인천대입구역', near: [-640, -300], lines: [INCHEON_1], outline: '#4f7fb3' },
  { key: 'centralPark', name: '센트럴파크역', near: [-1095, 505], lines: [INCHEON_1], outline: '#4f7fb3' },
  { key: 'knowledgeInfo', name: '지식정보단지역', near: [-105, -1160], lines: [INCHEON_1], outline: '#4f7fb3' },
]
