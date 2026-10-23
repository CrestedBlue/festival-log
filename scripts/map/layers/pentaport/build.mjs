// Builds the Pentaport layered map, step by step (each step is its own script and can be run alone).
//   node scripts/map/layers/pentaport/build.mjs [--preview]
// Pin detection (pins-detect.mjs → pins-classify.mjs) is not part of it: its result, map-src pins-official.json, was
// checked by eye and is kept in git.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runSteps } from '../lib/run.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STEPS = ['official-frame.mjs', 'layer1.mjs', 'pins-place.mjs', 'layout-north-up.mjs', 'layer2.mjs', 'layer3.mjs']
if (process.argv.includes('--preview')) STEPS.push('preview.mjs')
runSteps(HERE, STEPS)
