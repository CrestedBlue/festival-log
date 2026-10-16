import type { Festival } from '../schema'
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
