import { describe, expect, test } from 'vitest'
import { createSampleFestival } from './sample'
import { FestivalSchema } from './schema'
import { makeFestival } from './testFixtures'
import { MAX_IMPORT_CHARS, parseFestivalFile, serializeFestival } from './transfer'

describe('serializeFestival / parseFestivalFile', () => {
  test('round-trips a festival through the export format', () => {
    const festival = makeFestival()
    const parsed = parseFestivalFile(serializeFestival(festival, new Date('2026-10-16T00:00:00Z')))
    expect(parsed).toEqual({ ok: true, festival })
  })

  test('rejects invalid JSON', () => {
    const parsed = parseFestivalFile('{nope')
    expect(parsed.ok).toBe(false)
  })

  test('rejects files from other apps', () => {
    const parsed = parseFestivalFile(JSON.stringify({ app: 'other', version: 1, festival: makeFestival() }))
    expect(parsed.ok).toBe(false)
  })

  test('rejects performances that point at an unknown stage', () => {
    const broken = makeFestival({
      performances: [{ id: 'p1', stageId: 'missing', day: '2026-10-17', artist: 'A', start: '18:00', end: '19:00' }],
    })
    const parsed = parseFestivalFile(JSON.stringify({ app: 'festival-log', version: 1, festival: broken }))
    expect(parsed.ok).toBe(false)
  })

  test('returns an error instead of throwing on impossible clock values', () => {
    const broken = makeFestival({
      performances: [{ id: 'p1', stageId: 's1', day: '2026-10-17', artist: 'A', start: '25:99', end: '19:00' }],
    })
    const file = JSON.stringify({ app: 'festival-log', version: 1, festival: broken })
    expect(() => parseFestivalFile(file)).not.toThrow()
    expect(parseFestivalFile(file).ok).toBe(false)
  })

  test('rejects performances outside the festival dates', () => {
    const broken = makeFestival({
      performances: [{ id: 'p1', stageId: 's1', day: '2026-12-25', artist: 'A', start: '18:00', end: '19:00' }],
    })
    expect(parseFestivalFile(JSON.stringify({ app: 'festival-log', version: 1, festival: broken })).ok).toBe(false)
  })

  test('rejects duplicate ids inside a festival', () => {
    const p = { id: 'dup', stageId: 's1', day: '2026-10-17', artist: 'A', start: '18:00', end: '19:00' }
    const broken = makeFestival({ performances: [p, { ...p, artist: 'B' }] })
    expect(parseFestivalFile(JSON.stringify({ app: 'festival-log', version: 1, festival: broken })).ok).toBe(false)
  })

  test('rejects oversized input before parsing', () => {
    expect(parseFestivalFile('x'.repeat(MAX_IMPORT_CHARS + 1)).ok).toBe(false)
  })
})

describe('createSampleFestival', () => {
  test('produces a schema-valid festival starting on the given day', () => {
    let n = 0
    const sample = createSampleFestival(new Date(2026, 9, 16, 12), () => `id${n++}`)
    expect(FestivalSchema.safeParse(sample).success).toBe(true)
    expect(sample.startDate).toBe('2026-10-16')
    expect(sample.performances.length).toBeGreaterThan(5)
  })
})
