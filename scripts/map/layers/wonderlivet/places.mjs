// What the WONDERLIVET 2026 map shows inside the halls, in official-map pixels (map-src/wonderlivet/official-map-2026.jpg)
// with the block they are drawn in (halls.mjs lays each block onto its halls): the two stages (their boxes' top faces,
// let down to the floor), the booths and gates the festival map marks (where its pin points), and the 2F lobby's
// lockers and wheelchair zones. The restrooms are not on the festival map: they come from KINTEX's floor plan of the
// second exhibition centre (the ones on the lobby side of the halls), as metres along and across their row.

/** Stage boxes: corners of the top face, NNE-outer first; the box stands about 8 px high on the drawing. */
export const STAGE_BOXES = {
  wonder: { zone: 'h78', px: [[292, 933], [352, 890], [523, 990], [460, 1037]] },
  livet: { zone: 'h10', px: [[708, 1187], [770, 1143], [940, 1257], [877, 1287]] },
}
export const STAGE_LIFT_PX = 8

/** Booths, gates and the 2F lobby's places: key → [official px, block]. */
export const OFFICIAL = {
  gateWonder: [[648, 972], 'h78'],
  gateLivet: [[815, 1102], 'h10'],
  fnbWonder: [[591, 805], 'h78'],
  barWonder: [[669, 759], 'h78'],
  photoWonder: [[700, 826], 'h78'],
  contentsWonder: [[744, 887], 'h78'],
  goods: [[1023, 1048], 'h9'],
  contentsLivet: [[1095, 1107], 'h9'],
  barLivet: [[1154, 1041], 'h9'],
  fnbLivet: [[1206, 1076], 'h9'],
  wheelchairHall7: [[911, 585], 'lobby2F'],
  wheelchairMiddle: [[1097, 690], 'lobby2F'],
  lockers: [[1240, 615], 'lobby2F'],
}

/**
 * The wristband booth and the information, in local metres. The festival map draws them on the lobby floor at the
 * lobby's 킨텍스역 end, past the ends of the halls; there the real lobby ends at the glass front on the north-east
 * plaza (entrances A–C), so they go just inside it — the wristband booth on the halls 7·8 side, the information on the
 * 9·10 side, as drawn. Laid on by the lobby fit they would stand out in the plaza's garden.
 */
export const AT_ENTRANCE = {
  wristband: [42, 2],
  info: [26, 5],
}

/**
 * KINTEX's 1F restrooms on the lobby side of the halls (its overview floor plan, read 2026-11-12): metres along the
 * hall row from its corner (halls.mjs) and across, in the service strip between the hall and the lobby.
 */
export const RESTROOMS = {
  hall7North: ['se', 240, 111],
  hall7South: ['se', 124, 111],
  hall8: ['se', 32, 111],
  hall10North: ['h10', 24, 118],
  hall10South: ['h10', 106, 118],
  hall9North: ['h9', 113, 118],
  hall9South: ['h9', 33, 118],
}
