import { describe, expect, test } from 'vitest'
import { HERO_ROCK_2026_LINEUP } from './heroRock2026'
import { newestFirst } from './lineup'

describe('newestFirst', () => {
  test('puts the latest announcement on top', () => {
    expect(newestFirst(HERO_ROCK_2026_LINEUP).map((image) => image.label)).toEqual(['2차 라인업', '1차 라인업'])
  })

  test('leaves the catalog in the order the posters were announced', () => {
    newestFirst(HERO_ROCK_2026_LINEUP)
    expect(HERO_ROCK_2026_LINEUP.map((image) => image.label)).toEqual(['1차 라인업', '2차 라인업'])
  })
})
