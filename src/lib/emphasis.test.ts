import { describe, expect, test } from 'vitest'
import { splitEmphasis } from './emphasis'

describe('splitEmphasis', () => {
  test('returns one plain part when there is no marker', () => {
    expect(splitEmphasis('9홀 안')).toEqual([{ text: '9홀 안', strong: false }])
  })

  test('marks the text between ** pairs as strong, in order', () => {
    expect(splitEmphasis('티켓부스 **10:00** 오픈 · 첫 공연 **12:00**')).toEqual([
      { text: '티켓부스 ', strong: false },
      { text: '10:00', strong: true },
      { text: ' 오픈 · 첫 공연 ', strong: false },
      { text: '12:00', strong: true },
    ])
  })

  test('keeps an unpaired marker as plain text', () => {
    expect(splitEmphasis('가격 **5,000원')).toEqual([{ text: '가격 **5,000원', strong: false }])
  })

  test('returns no parts for an empty string', () => {
    expect(splitEmphasis('')).toEqual([])
  })
})
