import { BML } from './bml'
import { CDF } from './cdf'
import { GRAND_MINT } from './grandMint'
import { HERO_ROCK } from './heroRock'
import { JUMF } from './jumf'
import { LETS_ROCK } from './letsRock'
import { PENTAPORT } from './pentaport'
import { SJF } from './sjf'
import { WONDERLIVET } from './wonderlivet'
import type { FestivalSeries } from './types'

export type { FestivalSeries }

/** Every festival code the catalog knows, with what stays the same every year. */
export const SERIES: Readonly<Record<string, FestivalSeries>> = {
  [GRAND_MINT.code]: GRAND_MINT,
  [HERO_ROCK.code]: HERO_ROCK,
  [PENTAPORT.code]: PENTAPORT,
  [JUMF.code]: JUMF,
  [WONDERLIVET.code]: WONDERLIVET,
  [CDF.code]: CDF,
  [BML.code]: BML,
  [SJF.code]: SJF,
  [LETS_ROCK.code]: LETS_ROCK,
}
