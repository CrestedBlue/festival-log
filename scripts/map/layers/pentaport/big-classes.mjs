// Zone classes of the big area map's layer 1 (outside the venue): name, flat colour. The small map's layer 1 design
// (the official site map's colours, classes.mjs): white ground, path grey roads, lawn green parks, refresh-zone blue
// water; buildings a darker grey, bare sites a pale sand.
export const BIG_CLASSES = [
  ['land', '#ffffff'], // open ground (the official map's white)
  ['open', '#e6dfd2'], // construction sites, greenfield (송도 워터프런트 공사 구역 …): the F&B sand, paler
  ['park', '#74bc6c'], // parks, gardens: lawn
  ['pitch', '#048444'], // sports pitches (야구장, 풋살장): standing-zone green
  ['water', '#319fd7'], // refresh-zone blue
  ['building', '#a9a9ad'],
  ['venue', '#c8c8ca'], // the festival grounds: the small map draws them on top
  ['road', '#c8c8ca'], // path grey
]
