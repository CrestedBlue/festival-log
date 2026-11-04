import type { Pin, PinKind } from '../../data/schema'

/**
 * The app's pin icons (scripts/map/layers/app-pins.mjs): one design for every map — Pentaport's round badges (the
 * user, 2026-11-04). Key (a pin design type, "toilet", "gate", …) → bundled image URL.
 */
export const PIN_ICONS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(import.meta.glob<string>('../../assets/pins/*.svg', { eager: true, query: '?url', import: 'default' })).map(
    ([file, url]) => [file.slice(file.lastIndexOf('/') + 1, -'.svg'.length), url],
  ),
)

/** The icon of each kind of pin, for a pin that names none of its own. */
export const KIND_ICON: Readonly<Record<PinKind, string>> = {
  stage: 'stage',
  food: 'fnb',
  toilet: 'toilet',
  meet: 'meet',
  etc: 'etc',
  info: 'info',
  firstaid: 'medical',
  wristband: 'ticket',
  luggage: 'lockers',
  water: 'waterBar',
  eating: 'eating',
  shop: 'officialMd',
  slogan: 'slogan',
  radar: 'radar',
  photo: 'photo',
  smoking: 'smoking',
  sponsor: 'sponsor',
  artist: 'artist',
  vinyl: 'vinyl',
}

// own keys only: a stored pin naming "__proto__" or "constructor" must not reach the prototype
const own = (icons: Readonly<Record<string, string>> | undefined, key: string | undefined): string | undefined =>
  icons && key && Object.hasOwn(icons, key) ? icons[key] : undefined

/** What a pin is drawn with: its map's own icon (by mapIcon), else the app's (by mapIcon, else by its kind). */
export function pinIconUrl(pin: Pick<Pin, 'kind' | 'mapIcon'>, mapIcons?: Readonly<Record<string, string>>): string {
  const url = own(mapIcons, pin.mapIcon) ?? own(PIN_ICONS, pin.mapIcon) ?? own(PIN_ICONS, KIND_ICON[pin.kind])
  if (!url) throw new Error(`no pin icon for kind ${pin.kind}`)
  return url
}
