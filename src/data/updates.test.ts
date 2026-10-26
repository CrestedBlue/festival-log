import { describe, expect, test } from 'vitest'
import { UserDataSchema } from './schema'
import { makeUserData } from './testFixtures'
import { fillSeenUpdates, hasNewContent, markSeen, newContentAnywhere } from './updates'

// Catalog update dates for the tests: 'a' got new content on 10-27, 'b' last on 10-20, 'mine' is not in the catalog.
const UPDATED: Record<string, string> = { a: '2026-10-27', b: '2026-10-20' }
const updatedAtOf = (id: string) => UPDATED[id] ?? null

describe('hasNewContent', () => {
  const data = makeUserData({ myFestivalIds: ['a', 'b', 'mine'], seenUpdates: { a: '2026-10-22', b: '2026-10-20' } })

  test('is true for a festival that got new content after I last opened it, false once I have seen it', () => {
    expect(hasNewContent(data, 'a', updatedAtOf)).toBe(true)
    expect(hasNewContent(data, 'b', updatedAtOf)).toBe(false)
  })

  test('is never true for festivals outside the catalog or not on my list', () => {
    expect(hasNewContent(data, 'mine', updatedAtOf)).toBe(false)
    expect(hasNewContent(makeUserData({ seenUpdates: { a: '2026-10-01' } }), 'a', updatedAtOf)).toBe(false)
  })

  test('shows anywhere when any festival on my list has it (the manage tab)', () => {
    expect(newContentAnywhere(data, updatedAtOf)).toBe(true)
    expect(newContentAnywhere(markSeen(data, 'a', updatedAtOf), updatedAtOf)).toBe(false)
  })
})

describe('markSeen', () => {
  test('keeps the date of what the festival has now, leaving the others alone', () => {
    const data = makeUserData({ myFestivalIds: ['a', 'b'], seenUpdates: { a: '2026-10-22', b: '2026-10-20' } })
    expect(markSeen(data, 'a', updatedAtOf).seenUpdates).toEqual({ a: '2026-10-27', b: '2026-10-20' })
  })

  test('leaves festivals outside the catalog unmarked', () => {
    const data = makeUserData({ myFestivalIds: ['mine'] })
    expect(markSeen(data, 'mine', updatedAtOf)).toBe(data)
  })
})

describe('fillSeenUpdates', () => {
  test('festivals saved before the dates were kept count as seen as they are now (no dot for old content)', () => {
    const data = makeUserData({ myFestivalIds: ['a', 'b', 'mine'], seenUpdates: { b: '2026-10-01' } })
    expect(fillSeenUpdates(data, updatedAtOf).seenUpdates).toEqual({ a: '2026-10-27', b: '2026-10-01' })
  })

  test('returns the same data when nothing is missing', () => {
    const data = makeUserData({ myFestivalIds: ['a'], seenUpdates: { a: '2026-10-27' } })
    expect(fillSeenUpdates(data, updatedAtOf)).toBe(data)
  })
})

describe('stored data', () => {
  test('data saved before the dates were kept still loads, with none kept', () => {
    const { seenUpdates: _, ...older } = makeUserData({ myFestivalIds: ['a'] })
    expect(UserDataSchema.parse(older).seenUpdates).toEqual({})
  })
})
