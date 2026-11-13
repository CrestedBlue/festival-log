// Builds the KINTEX maps step by step (each step is its own script and can be run alone): the big area map alone for
// the festivals in these halls with no map of their own yet (big-layer1.mjs, app.mjs → kintex), and WONDERLIVET's map
// from its 2026 festival map (map.mjs → wonderlivet).
//   node scripts/map/layers/wonderlivet/build.mjs [--preview]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runSteps } from '../lib/run.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STEPS = ['big-layer1.mjs', 'app.mjs', 'map.mjs']
if (process.argv.includes('--preview')) STEPS.push('preview.mjs')
runSteps(HERE, STEPS)
