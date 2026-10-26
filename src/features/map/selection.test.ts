import { describe, expect, test } from 'vitest'
import type { Pin } from '../../data/schema'
import { groupPins } from './pinGroups'
import { NO_SELECTION, selectPin, showRow } from './selection'

const pin = (id: string, group: string): Pin => ({ id, name: group, group, kind: 'toilet', lat: 37.5, lng: 127 })
const toilets = [pin('t1', '화장실'), pin('t2', '화장실')]
const wash = pin('w', '개수대')
const rows = groupPins([...toilets, wash], null)
const toiletRow = rows.find((row) => row.pins.length > 1)!
const washRow = rows.find((row) => row.pins.length === 1)!

describe('showRow', () => {
  test('a row of several pins becomes the active row with a pulse, and no pin is selected', () => {
    expect(showRow(toiletRow, 1, 17)).toEqual({ selectedId: null, activeGroup: toiletRow.key, highlight: { id: 1, pins: toilets, focusZoom: 17 } })
  })

  test('a row of one pin selects it as well', () => {
    expect(showRow(washRow, 2, 17)).toMatchObject({ selectedId: 'w', activeGroup: washRow.key })
  })
})

describe('selectPin', () => {
  test('a pin of the active row opens its card and keeps the row and its pulse', () => {
    const active = showRow(toiletRow, 1, 17)
    expect(selectPin(active, toilets[1]!)).toEqual({ ...active, selectedId: 't2' })
  })

  test('a pin of another row lets the active row and its pulse go, so neither comes back later', () => {
    expect(selectPin(showRow(toiletRow, 1, 17), wash)).toEqual({ selectedId: 'w', activeGroup: null, highlight: null })
  })

  test('with no active row it only opens the card', () => {
    expect(selectPin(NO_SELECTION, wash)).toEqual({ ...NO_SELECTION, selectedId: 'w' })
  })
})
