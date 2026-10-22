import { describe, expect, test } from 'vitest'
import { fitLabel, type MeasureText } from './fitLabel'

// Every character, space included, is as wide as the font size.
const measure: MeasureText = (text, size) => [...text].length * size

describe('fitLabel', () => {
  test('keeps the largest size and the time when there is room', () => {
    expect(fitLabel('연정', { firstLineWidth: 145, lineWidth: 175, height: 100 }, measure)).toEqual({
      size: 26,
      lines: ['연정'],
      showTime: true,
    })
  })

  test('shrinks a long word to keep it whole beside the star instead of breaking it', () => {
    const label = fitLabel('리브아워티어스', { firstLineWidth: 145, lineWidth: 175, height: 100 }, measure)
    expect(label.lines).toEqual(['리브아워티어스'])
    expect(label.size).toBe(20)
  })

  test('wraps between words', () => {
    const label = fitLabel('바이 바이 배드맨', { firstLineWidth: 145, lineWidth: 175, height: 100 }, measure)
    expect(label).toEqual({ size: 26, lines: ['바이 바이', '배드맨'], showTime: true })
  })

  test('drops the time when the name needs the room', () => {
    const label = fitLabel('바이 바이 배드맨', { firstLineWidth: 145, lineWidth: 175, height: 60 }, measure)
    expect(label).toEqual({ size: 26, lines: ['바이 바이', '배드맨'], showTime: false })
  })

  test('breaks inside words and ends with an ellipsis when nothing else fits', () => {
    const box = { firstLineWidth: 145, lineWidth: 175, height: 30 }
    const label = fitLabel('토크: 지금이 저점매수 (퓨처피어클럽, 러브이즈사이클)', box, measure)
    expect(label.showTime).toBe(false)
    expect(label.lines).toHaveLength(1)
    expect(label.lines[0]?.endsWith('…')).toBe(true)
    expect(measure(label.lines[0] ?? '', label.size)).toBeLessThanOrEqual(box.firstLineWidth)
  })
})
