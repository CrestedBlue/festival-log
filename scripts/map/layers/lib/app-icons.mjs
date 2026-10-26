// Small icons the app draws on festival maps at a fixed screen size (stations, exits, shuttle stops, ticket booths):
// standalone SVGs, flat, in the style of a street map's POI icons.
const svg = (viewBox, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>\n`
const tile = (fill, glyph) => svg('-12 -12 24 24', `<rect x="-11" y="-11" width="22" height="22" rx="6" fill="${fill}" stroke="#ffffff" stroke-width="1.6"/>${glyph}`)
const BUS = '<rect x="-6" y="-7" width="12" height="11" rx="2.4" fill="#ffffff"/><rect x="-4.4" y="-5.4" width="8.8" height="4.2" rx="1" fill="currentColor"/>'
  + '<circle cx="-3.4" cy="5.6" r="1.6" fill="#ffffff"/><circle cx="3.4" cy="5.6" r="1.6" fill="#ffffff"/>'
const TRAIN = '<rect x="-5.5" y="-7.5" width="11" height="11.5" rx="3" fill="#ffffff"/><rect x="-3.8" y="-5.6" width="7.6" height="4" rx="1" fill="currentColor"/>'
  + '<circle cx="-2.6" cy="1.4" r="1.1" fill="currentColor"/><circle cx="2.6" cy="1.4" r="1.1" fill="currentColor"/><path d="M-4,7.5 L-2,4.5 M4,7.5 L2,4.5" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>'
const TICKET = '<path d="M-7,-4.5 H7 V-1.6 A1.6,1.6 0 0 0 7,1.6 V4.5 H-7 V1.6 A1.6,1.6 0 0 0 -7,-1.6 Z" fill="#ffffff"/><path d="M2,-4.5 V4.5" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.4 1.2"/>'

/** A subway station: the line's colour with a train. */
export const stationIcon = (lineColour) => tile(lineColour, TRAIN.replaceAll('currentColor', lineColour))
/** A city bus stop. */
export const busIcon = (fill = '#2f7fd8') => tile(fill, BUS.replaceAll('currentColor', fill))
/** A shuttle-bus stop: the bus in orange. */
export const shuttleIcon = (fill = '#f08c00') => busIcon(fill)
/** A ticket booth. */
export const ticketIcon = (fill = '#e8455a') => tile(fill, TICKET.replaceAll('currentColor', fill))
/** A subway exit number, yellow as on Korean street maps. */
export const exitIcon = (n) => svg('-10 -10 20 20', `<circle r="9" fill="#ffd33d" stroke="#ffffff" stroke-width="1.6"/><text y="3.6" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="#2b2b2b">${n}</text>`)
/** A pin badge drawn by the festival's pin design at (0,0), radius r (plus its drop shadow below). */
export const badgeIcon = (body, r) => svg(`${-r - 1} ${-r - 1} ${2 * r + 2} ${2 * r + 5}`, body)
