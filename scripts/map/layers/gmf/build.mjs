// Builds the Grand Mint Festival layered map, step by step (each step is its own script and can be run alone).
//   node scripts/map/layers/gmf/build.mjs [--preview]
// The pins (map-src pins-official.json) were read off the official map earlier (map-src/gmf/markers.json) and are kept
// in git. GMF has a north-up frame only: its official map is a schematic (official-to-m.mjs).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runSteps } from '../lib/run.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const STEPS = ['layer1.mjs', 'pins-place.mjs', 'layout-north-up.mjs', 'layer2.mjs', 'layer3.mjs']
if (process.argv.includes('--preview')) STEPS.push('preview.mjs')
runSteps(HERE, STEPS)
