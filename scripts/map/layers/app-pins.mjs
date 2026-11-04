// The app's pin icons for every map (src/assets/pins/): each pin type of the one pin design (lib/pin-design.mjs —
// Pentaport's badges) and the tiles Pentaport draws its ticket booths and shuttle stops with. The app draws a pin
// with its map's own icon when the map has one, else with this set (by the pin's mapIcon, else by its kind).
//   node scripts/map/layers/app-pins.mjs   → src/assets/pins/*.svg
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TYPES, badge, radiusOf } from './lib/pin-design.mjs'
import { badgeIcon, shuttleIcon, ticketIcon } from './lib/app-icons.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const OUT = path.join(ROOT, 'src/assets/pins')

const icons = {
  ...Object.fromEntries(Object.keys(TYPES).map((type) => [type, badgeIcon(badge(type), radiusOf(type))])),
  ticket: ticketIcon(),
  shuttle: shuttleIcon(),
}
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
for (const [key, svg] of Object.entries(icons)) fs.writeFileSync(path.join(OUT, `${key}.svg`), svg)
console.log('app pins', Object.keys(icons).length, '→', path.relative(ROOT, OUT))
