// The stations on the big area map: lib/big-layer1.mjs draws their boxes along the track, app.mjs writes their names.
// The catalog lists the exits of the stations people walk to the venue from (not 송파나루역's).
// near: [e, n] metres around the exits; lines: the line badges (Seoul Metro colours), the first one's colour is the box's.
const LINE = { 5: { text: '5', colour: '#996cac' }, 8: { text: '8', colour: '#e6186c' }, 9: { text: '9', colour: '#bdb092' } }
export const STATIONS = [
  { name: '몽촌토성역', near: [-1170, -175], lines: [LINE[8]] },
  { name: '한성백제역', near: [-895, -305], lines: [LINE[9]] },
  { name: '올림픽공원역', near: [445, -300], lines: [LINE[5], LINE[9]] },
  { name: '송파나루역', near: [-1215, -968], lines: [LINE[9]] },
]
