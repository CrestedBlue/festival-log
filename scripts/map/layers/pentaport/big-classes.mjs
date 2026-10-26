// Zone classes of the big area map's layer 1 (outside the venue): name, flat colour. A light street-map look (the
// reference the user liked, 2026-10-26): cream ground, grey roads with pale kerbs, light grey 2.5D buildings, green
// parks, blue water; pitches in the small map's standing-zone green.
export const BIG_CLASSES = [
  ['land', '#f3e9ce'], // cream ground and blocks
  ['open', '#efe2c2'], // construction sites, greenfield (송도 워터프런트 공사 구역 …): a shade darker
  ['park', '#7bc157'], // parks, gardens
  ['pitch', '#048244'], // sports pitches (야구장, 풋살장)
  ['water', '#3faef3'],
  ['building', '#e6e6e9'], // the roof; walls and shadow below (BIG_STYLE)
  ['venue', '#c8c8ca'], // the festival grounds: the small map draws them on top
  ['road', '#c3c5ca'],
]
// How the big map's roads and buildings are drawn (metres).
export const BIG_STYLE = {
  kerb: '#f8f0d9', kerbWidth: 2.4, // a pale pavement edge along every road (half shows outside)
  wall: '#c4c6cc', roofLift: 2.2, // a building's roof sits this far up its walls (looking from the south)
  shadow: '#c0bcb4', shadowOffset: [1.4, 1.2],
  // 송도달빛축제공원역 (인천 1호선): a box in the line's colour along the track (lib/station.mjs)
  station: { near: [-540, 115], fill: '#7ca8d5', outline: '#4f7fb3', length: 140, width: 18, line: '인천1' },
}
