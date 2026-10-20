import { GRAND_MINT } from './grandMint'
import { HERO_ROCK } from './heroRock'
import type { FestivalSeries } from './types'

export type { FestivalSeries }

/** Every festival code the catalog knows, with what stays the same every year. */
export const SERIES: Readonly<Record<string, FestivalSeries>> = {
  [GRAND_MINT.code]: GRAND_MINT,
  [HERO_ROCK.code]: HERO_ROCK,
}
