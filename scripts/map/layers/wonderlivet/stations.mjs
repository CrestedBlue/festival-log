// The stations on the big area map: lib/big-layer1.mjs draws their boxes along the track, the app writes their names
// and draws them as icons. near: [e, n] metres around the exits; track: GTX-A and 일산선 (3호선) are tagged rail in
// OpenStreetMap, so their tracks are picked by name.
export const STATIONS = [
  { key: 'kintex', name: '킨텍스역', near: [555, 45], lines: [{ text: 'GTX-A', colour: '#9a6292' }], track: '수도권광역급행철도에이선' },
  { key: 'daehwa', name: '대화역', near: [490, 1270], lines: [{ text: '3', colour: '#ef7c1c' }], track: '일산선' },
]
