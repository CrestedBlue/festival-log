import { describe, expect, test } from 'vitest'
import { GRAND_MINT_2026_ID } from './catalog/ids'
import { migrateV1 } from './migrate'
import { makeFestival, makePin } from './testFixtures'

describe('migrateV1', () => {
  const userPin = makePin({ id: 'mine', name: '우리 돗자리' })
  const legacyGmf = makeFestival({
    id: 'gmf2026',
    pins: [makePin({ id: 'gmf2026-mark-1', name: '화장실 · Mint Breeze' }), userPin],
  })
  const custom = makeFestival({ id: 'f1', name: '직접 만든 페스티벌' })

  test('maps the bundled festival to its catalog id and keeps only the pins the user added', () => {
    const v2 = migrateV1({ version: 1, activeFestivalId: 'gmf2026', festivals: [legacyGmf, custom], favorites: ['gmf2026-d1-mint-00'] })
    expect(v2).toEqual({
      version: 2,
      myFestivalIds: [GRAND_MINT_2026_ID, 'f1'],
      activeFestivalId: GRAND_MINT_2026_ID,
      favorites: ['gmf2026-d1-mint-00'],
      userPins: { [GRAND_MINT_2026_ID]: [userPin] },
      ticketLinks: {},
      archivedFestivals: [custom],
    })
  })

  test('keeps a festival the user made as a read-only archived festival', () => {
    const v2 = migrateV1({ version: 1, activeFestivalId: 'f1', festivals: [custom], favorites: [] })
    expect(v2.archivedFestivals).toEqual([custom])
    expect(v2.activeFestivalId).toBe('f1')
  })
})
