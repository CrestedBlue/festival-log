// Check image only (cache): the big area map at 3 px per metre → preview-big.jpg.
//   node scripts/map/layers/wonderlivet/preview.mjs
import { bigFrame } from './frame.mjs'
import { OUT, CACHE } from './paths.mjs'
import { bigPreview } from '../lib/preview.mjs'

await bigPreview({ OUT, CACHE, bigFrame, small: [] })
