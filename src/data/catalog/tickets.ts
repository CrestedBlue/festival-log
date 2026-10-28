/** An official ticket seller of one edition: a chip by the info tab's ticket title, opening the festival's page there. */
export interface TicketSeller {
  /** The seller's own name, e.g. "멜론티켓" */
  name: string
  /** The festival's product page at the seller (linked from the official site or posts). */
  url: string
}

/** The sellers festivals use, each building its product page from the numbers in that page's address. */
export const SELLERS = {
  melon: (prodId: number): TicketSeller => ({ name: '멜론티켓', url: `https://ticket.melon.com/performance/index.htm?prodId=${prodId}` }),
  yes24: (perfId: number): TicketSeller => ({ name: 'YES24', url: `https://ticket.yes24.com/Perf/${perfId}` }),
  ticketlink: (productId: number): TicketSeller => ({ name: '티켓링크', url: `https://www.ticketlink.co.kr/product/${productId}` }),
  nol: (productId: number): TicketSeller => ({ name: 'NOL 티켓', url: `https://nol.yanolja.com/ticket/products/${productId}` }),
  naver: (bizId: number, itemId: number): TicketSeller => ({ name: '네이버 예약', url: `https://booking.naver.com/booking/12/bizes/${bizId}/items/${itemId}` }),
  twoTm: (ticketId: number): TicketSeller => ({ name: '2TM', url: `https://www.2tm.co.kr/ticket/${ticketId}` }),
}
