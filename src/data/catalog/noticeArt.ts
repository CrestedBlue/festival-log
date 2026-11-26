import access from '../../assets/notice/access.webp'
import booking from '../../assets/notice/booking.webp'
import directions from '../../assets/notice/directions.webp'
import food from '../../assets/notice/food.webp'
import goods from '../../assets/notice/goods.webp'
import lockers from '../../assets/notice/lockers.webp'
import lostfound from '../../assets/notice/lostfound.webp'
import medical from '../../assets/notice/medical.webp'
import photo from '../../assets/notice/photo.webp'
import picnic from '../../assets/notice/picnic.webp'
import rules from '../../assets/notice/rules.webp'
import stage from '../../assets/notice/stage.webp'
import ticket from '../../assets/notice/ticket.webp'
import type { NoticeBlock } from './noticeBlock'

/**
 * The shared pictures of the info tab's notice blocks, one per topic, for every festival (the user, 2026-11-26: reuse
 * what fits, draw new ones generic). Each picture has its own main color; the block's dot and name highlight use it.
 * New pictures come from Codex in the same style (docs/COLLECT.md).
 */
export const NOTICE_ART = {
  /** ticket booth, wristband, gates, entry times */
  entry: { art: ticket, tone: '#d9482e' },
  /** buying tickets: sellers, prices, deadlines, refunds */
  booking: { art: booking, tone: '#5fa88c' },
  stage: { art: stage, tone: '#c49a2c' },
  goods: { art: goods, tone: '#d4607a' },
  lockers: { art: lockers, tone: '#3f8f84' },
  food: { art: food, tone: '#e08a1e' },
  photo: { art: photo, tone: '#8b73a0' },
  picnic: { art: picnic, tone: '#7d9a5e' },
  /** what may not be brought in or done */
  rules: { art: rules, tone: '#5f6470' },
  medical: { art: medical, tone: '#b4483f' },
  access: { art: access, tone: '#9a4f6a' },
  directions: { art: directions, tone: '#4f6f9a' },
  lostfound: { art: lostfound, tone: '#b8783e' },
} as const

export type NoticeTopic = keyof typeof NOTICE_ART

/**
 * The order of the blocks on the info tab, whatever order a festival lists them in (the user, 2026-11-26): entry always
 * first; what is not allowed, the medical booth and barrier-free always last, in that order; the rest in between.
 */
export const NOTICE_TOPIC_ORDER: readonly NoticeTopic[] = [
  'entry',
  'booking',
  'stage',
  'goods',
  'food',
  'picnic',
  'lockers',
  'photo',
  'directions',
  'lostfound',
  'rules',
  'medical',
  'access',
]

const rank = (block: NoticeBlock) => {
  const index = NOTICE_TOPIC_ORDER.indexOf(block.id as NoticeTopic)
  return index === -1 ? NOTICE_TOPIC_ORDER.indexOf('lostfound') + 0.5 : index
}

/** The blocks in NOTICE_TOPIC_ORDER (a new copy; blocks of one topic keep their order). */
export function orderNoticeBlocks(blocks: readonly NoticeBlock[]): readonly NoticeBlock[] {
  return [...blocks].sort((a, b) => rank(a) - rank(b))
}

/** A block on a topic: its picture and color are the topic's; the first line opens with the title in bold. */
export function noticeBlock(topic: NoticeTopic, title: string, lines: readonly string[]): NoticeBlock {
  return { id: topic, title, ...NOTICE_ART[topic], lines }
}
