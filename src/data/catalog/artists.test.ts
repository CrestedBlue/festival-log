import { describe, expect, test } from 'vitest'
import { ARTIST_NAMES } from './artists'

const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase()

describe('ARTIST_NAMES', () => {
  test('each artist has more than one name, none empty', () => {
    for (const names of ARTIST_NAMES) {
      expect(names.length, names.join(', ')).toBeGreaterThan(1)
      for (const name of names) expect(name.trim(), names.join(', ')).not.toBe('')
    }
  })

  test('a name belongs to one artist only', () => {
    const seen = new Map<string, string>()
    for (const names of ARTIST_NAMES) {
      for (const name of new Set(names.map(normalize))) {
        expect(seen.get(name), `${name}: ${names[0]} and ${seen.get(name)}`).toBeUndefined()
        seen.set(name, names[0]!)
      }
    }
  })
})
