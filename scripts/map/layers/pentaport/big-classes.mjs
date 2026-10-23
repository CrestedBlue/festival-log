// Zone classes of the big area map's layer 1 (outside the venue): name, flat colour. Quiet colours, so the venue
// (the small map on top) stands out; roads in the small map's path grey family.
export const BIG_CLASSES = [
  ['land', '#e9e6de'], // open ground, empty lots
  ['open', '#dfdbd0'], // construction sites, greenfield (송도 워터프런트 공사 구역 …)
  ['park', '#c6e3ad'], // parks, gardens
  ['pitch', '#9fd28a'], // sports pitches (야구장, 풋살장)
  ['water', '#a9d8ea'],
  ['building', '#d1cec6'],
  ['venue', '#c8c8ca'], // the festival grounds: the small map draws them on top
  ['road', '#ffffff'],
]
