import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { PENTAPORT_2027_ID, PENTAPORT_2027_KEY, PENTAPORT_SERIES } from './ids'
import { catalogEntry } from './index'
import { PENTAPORT_2027_NOTICES, createPentaport2027 } from './pentaport2027'
import { createPentaport2026 } from './pentaport2026'

describe('createPentaport2027', () => {
  const festival = createPentaport2027()

  test('is a schema-valid three-day festival from 30 July to 1 August 2027', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(PENTAPORT_2027_ID)
    expect(festival.name).toBe('2027 인천펜타포트 락 페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(['2027-07-30', '2027-08-01'])
  })

  test('keeps the festival\'s venue and pins, with no stages or performances yet', () => {
    const last = createPentaport2026()
    expect(festival.venue).toEqual(last.venue)
    expect(festival.pins.map((p) => p.id)).toEqual(last.pins.map((p) => p.id))
    expect(festival.stages).toEqual([])
    expect(festival.performances).toEqual([])
  })

  test('says where the dates come from and that the rest is still to come', () => {
    expect(PENTAPORT_2027_NOTICES.join(' ')).toContain('7월 30일(금)–8월 1일(일)')
    expect(PENTAPORT_2027_NOTICES.join(' ')).toContain('공식 글은 아직 없어요')
  })

  test('is in the catalog with its timetable and map tabs closed', () => {
    expect(catalogEntry(PENTAPORT_2027_ID)).toMatchObject({
      series: PENTAPORT_SERIES,
      key: PENTAPORT_2027_KEY,
      lineup: [],
      tickets: [],
      closedTabs: ['timetable', 'map'],
    })
    expect(PENTAPORT_2027_KEY).toBe('pentaport2027')
  })
})
