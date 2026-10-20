import { describe, expect, test } from 'vitest'
import { CATALOG, type CatalogEntry } from '../../data/catalog'
import { GRAND_MINT_2026_ID, HERO_ROCK_2026_ID } from '../../data/catalog/ids'
import { makeFestival } from '../../data/testFixtures'
import { catalogOverview } from './overview'

const entry = (overrides: Partial<CatalogEntry> & Pick<CatalogEntry, 'create'>): CatalogEntry => ({
  id: 'test-id',
  legacyIds: [],
  key: 'test',
  notices: ['공지'],
  ...overrides,
})

describe('catalogOverview', () => {
  const rows = catalogOverview(CATALOG)
  const row = (id: string) => rows.find((r) => r.id === id)

  test('lists every catalog festival, the one that starts last first', () => {
    expect(rows.map((r) => r.id)).toEqual([HERO_ROCK_2026_ID, GRAND_MINT_2026_ID])
  })

  test('counts what a finished festival has and finds nothing missing', () => {
    expect(row(GRAND_MINT_2026_ID)).toMatchObject({
      days: 2,
      stageCount: 4,
      performanceCount: 60,
      noticeCount: 5,
      hasIllustratedMap: true,
      missing: [],
      problems: [],
    })
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
    expect(broken).toMatchObject({ id: 'test-id', name: 'test', problems: ['만들지 못했어요: map metadata is missing'] })
  })
})
