import { describe, expect, test } from 'vitest'
import { makePin, makeUserData } from './testFixtures'
import {
  addMyFestival,
  addUserPin,
  removeMyFestival,
  removeUserPin,
  setActiveFestival,
  setTicketLink,
  toggleFavorite,
} from './userData'

describe('my festival list', () => {
  test('addMyFestival adds a festival once and opens it', () => {
    const once = addMyFestival(makeUserData({ myFestivalIds: ['a'], activeFestivalId: 'a' }), 'b')
    expect(once.myFestivalIds).toEqual(['a', 'b'])
    expect(once.activeFestivalId).toBe('b')
    expect(addMyFestival(once, 'b').myFestivalIds).toEqual(['a', 'b'])
  })

  test('removeMyFestival drops its pins and ticket link and moves the active pointer', () => {
    const data = makeUserData({
      myFestivalIds: ['a', 'b'],
      activeFestivalId: 'a',
      userPins: { a: [makePin()] },
      ticketLinks: { a: 'https://example.com' },
    })
    const next = removeMyFestival(data, 'a')
    expect(next.myFestivalIds).toEqual(['b'])
    expect(next.activeFestivalId).toBe('b')
    expect(next.userPins).toEqual({})
    expect(next.ticketLinks).toEqual({})
    expect(data.myFestivalIds).toEqual(['a', 'b'])
  })

  test('removeMyFestival also drops an archived festival', () => {
    const data = makeUserData({ myFestivalIds: ['old'], activeFestivalId: 'old', archivedFestivals: [{ id: 'old' } as never] })
    const next = removeMyFestival(data, 'old')
    expect(next.archivedFestivals).toEqual([])
    expect(next.activeFestivalId).toBeNull()
  })

  test('setActiveFestival only switches to a festival in my list', () => {
    const data = makeUserData({ myFestivalIds: ['a', 'b'], activeFestivalId: 'a' })
    expect(setActiveFestival(data, 'b').activeFestivalId).toBe('b')
    expect(setActiveFestival(data, 'zzz')).toBe(data)
  })
})

describe('per-device records', () => {
  test('toggleFavorite adds then removes a performance id', () => {
    const once = toggleFavorite(makeUserData(), 'p1')
    expect(once.favorites).toEqual(['p1'])
    expect(toggleFavorite(once, 'p1').favorites).toEqual([])
  })

  test('user pins are kept per festival', () => {
    const pin = makePin({ id: 'mine' })
    const added = addUserPin(makeUserData(), 'a', pin)
    expect(added.userPins).toEqual({ a: [pin] })
    expect(removeUserPin(added, 'a', 'mine').userPins).toEqual({ a: [] })
  })

  test('setTicketLink stores a link and clears it with null', () => {
    const set = setTicketLink(makeUserData(), 'a', 'https://tickets.example.com/1')
    expect(set.ticketLinks).toEqual({ a: 'https://tickets.example.com/1' })
    expect(setTicketLink(set, 'a', null).ticketLinks).toEqual({})
  })
})
