import { describe, expect, test } from 'vitest'
import { stageColumnWeights } from './columns'

describe('stageColumnWeights', () => {
  test('gives every stage the same width when there are three or fewer', () => {
    expect(stageColumnWeights(3)).toEqual([1, 1, 1])
    expect(stageColumnWeights(2)).toEqual([1, 1])
  })

  test('makes the fourth stage (usually the event zone) one and a half times as wide', () => {
    expect(stageColumnWeights(4)).toEqual([1, 1, 1, 1.5])
    expect(stageColumnWeights(5)).toEqual([1, 1, 1, 1.5, 1])
  })
})
