import { describe, expect, test } from 'vitest'
import { PIN_KINDS } from '../../data/schema'
import { KIND_ICON, PIN_ICONS, pinIconUrl } from './pinIcons'

describe('pin icons', () => {
  test('every kind of pin has an icon of the one design', () => {
    for (const kind of PIN_KINDS) expect(PIN_ICONS[KIND_ICON[kind]], kind).toBeTruthy()
  })

  test("a map's own icon first, then the app's by the pin's mapIcon, then by its kind", () => {
    const mapIcons = { toilet: '/map/toilet.svg' }
    expect(pinIconUrl({ kind: 'toilet', mapIcon: 'toilet' }, mapIcons)).toBe('/map/toilet.svg')
    expect(pinIconUrl({ kind: 'etc', mapIcon: 'gate' }, mapIcons)).toBe(PIN_ICONS.gate)
    expect(pinIconUrl({ kind: 'firstaid', mapIcon: 'nothing' }, mapIcons)).toBe(PIN_ICONS.medical)
    expect(pinIconUrl({ kind: 'meet' })).toBe(PIN_ICONS.meet)
  })

  test("a stored pin naming an object's own property gets its kind's icon", () => {
    expect(pinIconUrl({ kind: 'etc', mapIcon: '__proto__' }, {})).toBe(PIN_ICONS.etc)
    expect(pinIconUrl({ kind: 'etc', mapIcon: 'constructor' })).toBe(PIN_ICONS.etc)
  })
})
