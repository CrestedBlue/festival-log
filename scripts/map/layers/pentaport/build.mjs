// Builds the Pentaport layered map, step by step (each step is its own script and can be run alone).
//   node scripts/map/layers/pentaport/build.mjs [--preview]
// Pin detection (pins-detect.mjs → pins-classify.mjs) is not part of it: its result, map-src pins-official.json, was
// checked by eye and is kept in git.
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STEPS = ['official-frame.mjs', 'layer1.mjs', 'pins-place.mjs', 'layout-north-up.mjs', 'layer2.mjs', 'layer3.mjs']
if (process.argv.includes('--preview')) STEPS.push('preview.mjs')
for (const step of STEPS) {
  console.log(`— ${step}`)
  execFileSync(process.execPath, [path.join(HERE, step)], { stdio: 'inherit' })
}
