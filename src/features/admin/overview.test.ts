import { describe, expect, test } from 'vitest'
import { CATALOG, type CatalogEntry } from '../../data/catalog'
import { GRAND_MINT_2026_ID, HERO_ROCK_2026_ID } from '../../data/catalog/ids'
import { makeFestival } from '../../data/testFixtures'
import { SERIES } from '../../data/catalog/series'
import { catalogOverview, seriesOverview } from './overview'

const entry = (overrides: Partial<CatalogEntry> & Pick<CatalogEntry, 'create'>): CatalogEntry => ({
  id: 'test-id',
  legacyIds: [],
  series: 'test',
  key: 'test2026',
  notices: ['공지'],
  lineup: [],
  guides: [],
  tickets: [],
  updatedAt: '2026-10-01',
  ...overrides,
})

describe('catalogOverview', () => {
  const rows = catalogOverview(CATALOG)
  const row = (id: string) => rows.find((r) => r.id === id)

  test('lists every catalog festival with its festival code and yearly code', () => {
    expect(rows.map((r) => [r.series, r.key, r.year])).toEqual(
      expect.arrayContaining([
        ['gmf', 'gmf2026', '2026'],
        ['herorock', 'herorock2026', '2026'],
      ]),
    )
    expect(rows).toHaveLength(CATALOG.length)
  })

  test('counts what a finished festival has and finds nothing missing', () => {
    expect(row(GRAND_MINT_2026_ID)).toMatchObject({
      days: 2,
      stageCount: 4,
      performanceCount: 60,
      missing: [],
      problems: [],
    })
    expect(row(GRAND_MINT_2026_ID)?.festival?.performances).toHaveLength(60)
  })

  test('says what a festival still lacks', () => {
    expect(row(HERO_ROCK_2026_ID)?.missing).toEqual(['타임테이블'])
    const [tbd] = catalogOverview([entry({ notices: [], create: () => makeFestival({ datesTbd: true, performances: [] }) })])
    expect(tbd?.missing).toEqual(['날짜', '타임테이블', '주의사항'])
    expect(tbd?.days).toBeNull()
  })

  test('reports schema problems, and a festival that fails to build at all', () => {
    const [invalid] = catalogOverview([entry({ create: () => makeFestival({ startDate: '2026-10-19', endDate: '2026-10-18' }) })])
    expect(invalid?.problems).toEqual(['종료일이 시작일보다 빨라요'])
    const [broken] = catalogOverview([
      entry({
        create: () => {
          throw new Error('map metadata is missing')
        },
      }),
    ])
    expect(broken).toMatchObject({ id: 'test-id', name: 'test2026', festival: null, problems: ['만들지 못했어요: map metadata is missing'] })
  })
})

describe('seriesOverview', () => {
  const series = seriesOverview(CATALOG, SERIES)

  test('lists each festival once by its festival code, in name order, with its editions newest first', () => {
    expect(series.map((s) => s.code)).toEqual(['gmf', 'letsrock', 'bml', 'sjf', 'wonderlivet', 'pentaport', 'jumf', 'cdf', 'herorock'])
    expect(series.find((s) => s.code === 'pentaport')).toMatchObject({ name: '인천펜타포트 락 페스티벌' })
    expect(series.find((s) => s.code === 'pentaport')?.editions.map((e) => e.key)).toEqual(['pentaport2026', 'pentaport2025'])
  })

  test('carries the collection sources of each festival', () => {
    expect(series.find((s) => s.code === 'gmf')?.sources.map((s) => s.value)).toEqual(['@grandmintfestival'])
  })
})
