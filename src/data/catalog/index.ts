import { seriesMapFor, type FestivalMap } from '../../features/map/festivalMaps'
import type { Festival } from '../schema'
import type { GuideSet } from './guide'
import type { LineupImage } from './lineup'
import { GRAND_MINT_2026_NOTICES, createGrandMint2026 } from './grandMint2026'
import { HERO_ROCK_2026_LINEUP, HERO_ROCK_2026_NOTICES, createHeroRock2026 } from './heroRock2026'
import { JUMF_2026_GUIDES, JUMF_2026_NOTICES, createJumf2026 } from './jumf2026'
import { PENTAPORT_2026_GUIDES, PENTAPORT_2026_NOTICES, createPentaport2026 } from './pentaport2026'
import {
  GRAND_MINT_2026_ID,
  GRAND_MINT_2026_KEY,
  GRAND_MINT_SERIES,
  HERO_ROCK_2026_ID,
  HERO_ROCK_2026_KEY,
  HERO_ROCK_SERIES,
  JUMF_2026_ID,
  JUMF_2026_KEY,
  JUMF_SERIES,
  PENTAPORT_2026_ID,
  PENTAPORT_2026_KEY,
  PENTAPORT_SERIES,
} from './ids'

/** A festival the admin maintains in the app (no admin UI: edit these files and push). */
export interface CatalogEntry {
  id: string
  /** Ids this festival had in older app versions (used when migrating saved data). */
  legacyIds: readonly string[]
  /** Festival code: the same every year (e.g. "herorock"). */
  series: string
  /** Yearly code: festival code + year (e.g. "herorock2026"). Prefixes the stage/performance/pin ids. */
  key: string
  create: () => Festival
  /** Things to know before going (admin). */
  notices: readonly string[]
  /** Line-up posters, shown on the timetable tab until the timetable is out (admin). */
  lineup: readonly LineupImage[]
  /** Official guide pages (checklist, venue map, …) swiped through on the info tab (admin). */
  guides: readonly GuideSet[]
}

export const CATALOG: readonly CatalogEntry[] = [
  {
    id: GRAND_MINT_2026_ID,
    legacyIds: [GRAND_MINT_2026_KEY],
    series: GRAND_MINT_SERIES,
    key: GRAND_MINT_2026_KEY,
    create: createGrandMint2026,
    notices: GRAND_MINT_2026_NOTICES,
    lineup: [],
    guides: [],
  },
  {
    id: HERO_ROCK_2026_ID,
    legacyIds: [],
    series: HERO_ROCK_SERIES,
    key: HERO_ROCK_2026_KEY,
    create: createHeroRock2026,
    notices: HERO_ROCK_2026_NOTICES,
    lineup: HERO_ROCK_2026_LINEUP,
    guides: [],
  },
  {
    id: PENTAPORT_2026_ID,
    legacyIds: [],
    series: PENTAPORT_SERIES,
    key: PENTAPORT_2026_KEY,
    create: createPentaport2026,
    notices: PENTAPORT_2026_NOTICES,
    lineup: [],
    guides: PENTAPORT_2026_GUIDES,
  },
  {
    id: JUMF_2026_ID,
    legacyIds: [],
    series: JUMF_SERIES,
    key: JUMF_2026_KEY,
    create: createJumf2026,
    notices: JUMF_2026_NOTICES,
    lineup: [],
    guides: JUMF_2026_GUIDES,
  },
]

/** Opened on first launch. */
export const DEFAULT_FESTIVAL_ID = GRAND_MINT_2026_ID

export const catalogEntry = (festivalId: string): CatalogEntry | undefined => CATALOG.find((e) => e.id === festivalId)

export const catalogEntryForLegacyId = (legacyId: string): CatalogEntry | undefined =>
  CATALOG.find((e) => e.id === legacyId || e.legacyIds.includes(legacyId))

/** A catalog festival's illustrated map, found through its festival code (shared by every year). */
export const festivalMapFor = (festivalId: string): FestivalMap | null => {
  const entry = catalogEntry(festivalId)
  return entry ? seriesMapFor(entry.series) : null
}
