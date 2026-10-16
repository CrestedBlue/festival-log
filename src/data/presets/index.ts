import type { AppData, Festival, Pin } from '../schema'
import { GRAND_MINT_2026_ID, createGrandMint2026 } from './grandMint2026'

export interface FestivalPreset {
  id: string
  label: string
  create: () => Festival
}

/** Festivals bundled with the app so friends get the timetable without typing it in. */
export const PRESETS: readonly FestivalPreset[] = [
  { id: GRAND_MINT_2026_ID, label: '그랜드 민트 페스티벌 2026', create: createGrandMint2026 },
]

export const DEFAULT_PRESET = createGrandMint2026

const samePin = (a: Pin, b: Pin) => a.name === b.name && a.kind === b.kind && a.lat === b.lat && a.lng === b.lng

/**
 * When an app update moves a preset's pins (e.g. a new festival map), devices that already added the
 * preset get the new positions. Pins the user added are kept; preset pins the user deleted stay deleted
 * unless the preset itself changed.
 */
export function syncPresetPins(data: AppData): AppData {
  let next = data
  for (const preset of PRESETS) {
    const festival = next.festivals.find((f) => f.id === preset.id)
    if (!festival) continue
    const fresh = preset.create().pins
    // Every pin a preset owns has an id starting with its festival id (user pins have random ids).
    const prefix = `${preset.id}-`
    const current = festival.pins.filter((p) => p.id.startsWith(prefix))
    const outdated = current.some((pin) => {
      const match = fresh.find((f) => f.id === pin.id)
      return !match || !samePin(match, pin)
    })
    if (!outdated) continue
    const userPins = festival.pins.filter((p) => !p.id.startsWith(prefix))
    next = {
      ...next,
      festivals: next.festivals.map((f) => (f.id === preset.id ? { ...f, pins: [...fresh, ...userPins] } : f)),
    }
  }
  return next
}

/** Preset pins for places the illustrated map already labels (stages, exits, …): listed, but not drawn on it. */
export const isMapLabelPin = (festivalId: string, pin: Pick<Pin, 'id'>): boolean => pin.id.startsWith(`${festivalId}-zone-`)
