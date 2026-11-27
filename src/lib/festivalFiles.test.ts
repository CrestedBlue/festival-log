import { describe, expect, test } from 'vitest'
import { festivalMapFor } from '../data/catalog'
import { CDF_2026_ID, PENTAPORT_2025_ID, PENTAPORT_2026_ID, THE_GLOW_2026_ID } from '../data/catalog/ids'
import { festivalFileUrls } from './festivalFiles'

describe('festivalFileUrls', () => {
  test('lists the festival map layers, its icons and line-up posters', () => {
    const urls = festivalFileUrls([CDF_2026_ID])
    const map = festivalMapFor(CDF_2026_ID)!
    expect(urls).toEqual(expect.arrayContaining(map.layers.map((layer) => layer.url)))
    expect(urls.some((url) => url.includes('cdf2026-1'))).toBe(true)
  })

  test('a map shared by festivals is listed once', () => {
    const together = festivalFileUrls([CDF_2026_ID, THE_GLOW_2026_ID])
    expect(new Set(together).size).toBe(together.length)
    expect(festivalFileUrls([PENTAPORT_2025_ID, PENTAPORT_2026_ID])).toEqual(festivalFileUrls([PENTAPORT_2026_ID]))
  })

  test('no festivals, nothing to save; unknown ids are skipped', () => {
    expect(festivalFileUrls([])).toEqual([])
    expect(festivalFileUrls(['not-a-festival'])).toEqual([])
  })
})
