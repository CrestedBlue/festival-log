import { describe, expect, test } from 'vitest'
import { parseTimetableText } from './timetableText'

describe('parseTimetableText', () => {
  test('parses "start-end artist" lines with various dash styles', () => {
    const result = parseTimetableText('18:30-19:40 새벽세탁소\n20:00 ~ 21:10 파란 고래 클럽\n21:30–22:40 노을방송국')
    expect(result.errors).toEqual([])
    expect(result.entries).toEqual([
      { start: '18:30', end: '19:40', artist: '새벽세탁소' },
      { start: '20:00', end: '21:10', artist: '파란 고래 클럽' },
      { start: '21:30', end: '22:40', artist: '노을방송국' },
    ])
  })

  test('accepts the artist before the time range and strips separators', () => {
    const result = parseTimetableText('새벽세탁소 | 9:00-10:00')
    expect(result.entries).toEqual([{ start: '09:00', end: '10:00', artist: '새벽세탁소' }])
  })

  test('skips blank lines and reports unparseable ones with their line number', () => {
    const result = parseTimetableText('\n18:30-19:40 A\nhello\n25:00-26:00 B\n19:00-20:00')
    expect(result.entries).toEqual([{ start: '18:30', end: '19:40', artist: 'A' }])
    expect(result.errors.map((e) => e.lineNumber)).toEqual([3, 4, 5])
  })

  test('rejects artist names longer than the storage limit instead of dropping them later', () => {
    const result = parseTimetableText(`18:00-19:00 ${'가'.repeat(81)}`)
    expect(result.entries).toEqual([])
    expect(result.errors).toHaveLength(1)
  })

  test('allows sets that cross midnight but rejects ones that end before they start', () => {
    const result = parseTimetableText('23:30-01:00 Late\n20:00-19:00 Backwards')
    expect(result.entries).toEqual([{ start: '23:30', end: '01:00', artist: 'Late' }])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.lineNumber).toBe(2)
  })
})
