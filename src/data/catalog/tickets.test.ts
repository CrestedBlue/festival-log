import { describe, expect, test } from 'vitest'
import { CATALOG, catalogEntry } from './index'
import { GRAND_MINT_2026_ID, HERO_ROCK_2026_ID, PENTAPORT_2026_ID, WONDERLIVET_2026_ID } from './ids'
import { SELLERS } from './tickets'

describe('SELLERS', () => {
  test("builds each seller's product page from its product number", () => {
    expect(SELLERS.melon(214033)).toEqual({ name: '멜론티켓', url: 'https://ticket.melon.com/performance/index.htm?prodId=214033' })
    expect(SELLERS.yes24(58283)).toEqual({ name: 'YES24', url: 'https://ticket.yes24.com/Perf/58283' })
    expect(SELLERS.yes24Special(58933)).toEqual({ name: 'YES24', url: 'https://ticket.yes24.com/Special/58933' })
    expect(SELLERS.ticketlink(65048)).toEqual({ name: '티켓링크', url: 'https://www.ticketlink.co.kr/product/65048' })
    expect(SELLERS.nol(26010721)).toEqual({ name: 'NOL 티켓', url: 'https://nol.yanolja.com/ticket/products/26010721' })
    expect(SELLERS.naver(1754451, 8124828)).toEqual({ name: '네이버 예약', url: 'https://booking.naver.com/booking/12/bizes/1754451/items/8124828' })
    expect(SELLERS.twoTm(10888)).toEqual({ name: '2TM', url: 'https://www.2tm.co.kr/ticket/10888' })
  })
})

describe('official ticket sellers in the catalog', () => {
  test('every seller links to an https product page, once per edition', () => {
    for (const entry of CATALOG) {
      for (const seller of entry.tickets) expect(seller.url.startsWith('https://')).toBe(true)
      expect(new Set(entry.tickets.map((s) => s.url)).size).toBe(entry.tickets.length)
    }
  })

  test('lists the sellers the official site and posts name', () => {
    expect(catalogEntry(WONDERLIVET_2026_ID)?.tickets.map((s) => s.name)).toEqual(['멜론티켓', 'YES24', '티켓링크'])
    expect(catalogEntry(HERO_ROCK_2026_ID)?.tickets.map((s) => s.name)).toEqual(['멜론티켓'])
    expect(catalogEntry(GRAND_MINT_2026_ID)?.tickets.map((s) => s.name)).toEqual(['NOL 티켓', 'YES24', '티켓링크'])
    expect(catalogEntry(PENTAPORT_2026_ID)?.tickets).toEqual([])
  })
})
