// Builds the herorock map — the big area map's ground and the app's copy — step by step (each step is its own script and
// can be run alone). There is no venue map (no official site map yet): the big map alone is the app's map.
//   node scripts/map/layers/herorock/build.mjs [--preview]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runSteps } from '../lib/run.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STEPS = ['big-layer1.mjs', 'app.mjs']
if (process.argv.includes('--preview')) STEPS.push('preview.mjs')
runSteps(HERE, STEPS)
