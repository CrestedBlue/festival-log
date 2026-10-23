// Run a festival's build steps in order, each as its own script (so each can also be run alone).
import { execFileSync } from 'node:child_process'
import path from 'node:path'

export function runSteps(dir, steps) {
  for (const step of steps) {
    console.log(`— ${step}`)
    execFileSync(process.execPath, [path.join(dir, step)], { stdio: 'inherit' })
  }
}
