import type { Festival, Pin } from '../schema'
import { GRAND_MINT_2026_NOTICES, createGrandMint2026 } from './grandMint2026'
import { GRAND_MINT_2026_ID, GRAND_MINT_2026_KEY } from './ids'

/** A festival the admin maintains in the app (no admin UI: edit these files and push). */
export interface CatalogEntry {
  id: string
  /** Ids this festival had in older app versions (used when migrating saved data). */
  legacyIds: readonly string[]
  /** Prefix of the stage/performance/pin ids the catalog owns. */
  key: string
  create: () => Festival
  /** Things to know before going (admin). */
  notices: readonly string[]
}

export const CATALOG: readonly CatalogEntry[] = [
  {
    id: GRAND_MINT_2026_ID,
    legacyIds: [GRAND_MINT_2026_KEY],
    key: GRAND_MINT_2026_KEY,
    create: createGrandMint2026,
    notices: GRAND_MINT_2026_NOTICES,
  },
]

/** Opened on first launch. */
export const DEFAULT_FESTIVAL_ID = GRAND_MINT_2026_ID

export const catalogEntry = (festivalId: string): CatalogEntry | undefined => CATALOG.find((e) => e.id === festivalId)

export const catalogEntryForLegacyId = (legacyId: string): CatalogEntry | undefined =>
  CATALOG.find((e) => e.id === legacyId || e.legacyIds.includes(legacyId))

/** Catalog pins for places the illustrated map already labels (stages, exits, …): listed, but not drawn on it. */
export const isMapLabelPin = (pin: Pick<Pin, 'id'>): boolean =>
  CATALOG.some((entry) => pin.id.startsWith(`${entry.key}-zone-`))
