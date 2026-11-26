import food from '../../assets/notice/wonderlivet-food.webp'
import lockers from '../../assets/notice/wonderlivet-lockers.webp'
import photo from '../../assets/notice/wonderlivet-photo.webp'
import ticket from '../../assets/notice/wonderlivet-ticket.webp'
import type { NoticeBlock } from './noticeBlock'

/**
 * The four topics worth a picture on the info tab (the user's sketch, 2026-11-26): the ticket booth, the lockers, the
 * food zone and the photo booth. The facts are the notices' (timetable post, FAQ, 11/12–11/16 posts); each picture
 * is its own color so the four do not look alike.
 */
export const WONDERLIVET_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  {
    id: 'ticket',
    title: '티켓부스',
    art: ticket,
    tone: '#d9482e',
    lines: ['티켓부스 **10:00** 오픈', '메인 게이트 **11:00** · 첫 공연 **12:00**', '모바일 티켓 + 본인 실물 신분증', '대리 수령 불가, 동행인과 함께'],
  },
  {
    id: 'lockers',
    title: '물품보관소',
    art: lockers,
    tone: '#3f8f84',
    lines: ['2층 9홀 앞 로비', '**09:00–23:00**쯤'],
  },
  {
    id: 'food',
    title: '푸드존',
    art: food,
    tone: '#e08a1e',
    lines: ['7·8홀, 9홀 안', '외부 음식 불가, **500ml** 이하 생수만', '술은 **성인인증** 밴드 필요'],
  },
  {
    id: 'photo',
    title: '포토부스',
    art: photo,
    tone: '#8b73a0',
    lines: ['9홀 안 · **11:00**부터', '하프컷(2장) **5,000원**', '디자인 2종 중 택 1 · 카드 결제만'],
  },
]
