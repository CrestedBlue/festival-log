import food from '../../assets/notice/wonderlivet-food.webp'
import goods from '../../assets/notice/wonderlivet-goods.webp'
import lockers from '../../assets/notice/wonderlivet-lockers.webp'
import photo from '../../assets/notice/wonderlivet-photo.webp'
import ticket from '../../assets/notice/wonderlivet-ticket.webp'
import type { NoticeBlock } from './noticeBlock'

/**
 * The five topics worth a picture on the info tab (the user's sketch, 2026-11-26): the ticket booth, goods, the
 * lockers, the food zone and the photo booth. The wristband is the ticket (the user, 2026-11-26), so the ticket block
 * says what the wristband is for. The facts are the notices' (timetable post, FAQ, 11/9–11/24 posts); each picture
 * is its own color so they do not look alike. The first line of a block starts with the topic's name in bold (the user, 2026-11-26). No stall lists. Pictures come from Codex (image generation), in one style.
 */
export const WONDERLIVET_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  {
    id: 'ticket',
    title: '티켓부스',
    art: ticket,
    tone: '#d9482e',
    lines: [
      '**티켓부스** **10:00**부터 공연 끝까지',
      '공식 페스티벌 맵에는 22:00까지로 적혀 있어요',
      '메인 게이트 **11:00** · 첫 공연 **12:00**',
      '모바일 티켓(캡처 불가) + 본인 실물 신분증',
      '대리 수령 불가, 동행인과 함께',
      '**손목밴드**가 곧 티켓, 여기서 받아요',
      '차면 무대 사이를 오가고 다시 들어올 수 있어요',
      '금·토 2일권은 **11/21(토)**까지 차고 있어요',
      '토·일, 금·일 2일권과 3일권은 **11/22(일)**까지',
      '잃어버리거나 망가지면 다시 주지 않아요 · 물에 젖어도 찢어지지 않아요',
      '현장 판매: 예매 뒤 남은 표만, 당일 **10:30**부터(공식 SNS 공지)',
      '예매·취소 마감은 관람 전날 **11:00**',
    ],
  },
  {
    id: 'goods',
    title: '굿즈',
    art: goods,
    tone: '#d4607a',
    lines: [
      '**굿즈** 현장 구매 9홀 안 **11:30–21:00**',
      '현장 QR(네이버 예약)로 사요',
      '손목밴드를 찬 사람만',
      '한정 수량, 일찍 품절될 수 있어요',
      '아티스트 굿즈는 출연일과 상관없이 3일 내내',
      '외국인은 네이버 가입·본인인증 뒤 구매(공식 글에 영어·일본어 안내)',
      '사전 예약(YES24)은 끝났어요 · 고른 날짜에만 픽업',
      '사전 예약에서 품절된 상품은 현장에서 못 사요',
      '수령 QR은 받는 날 전날 **20:00** YES24 마이페이지에',
      '온라인 판매 **11/24–12/14**, 공연 뒤 남은 재고만',
    ],
  },
  {
    id: 'lockers',
    title: '물품보관소',
    art: lockers,
    tone: '#3f8f84',
    lines: ['**물품보관소** 2층 9홀 앞 로비', '**09:00–23:00**쯤'],
  },
  {
    id: 'food',
    title: '푸드존',
    art: food,
    tone: '#e08a1e',
    lines: [
      '**푸드존** 7·8홀, 9홀 안 · 푸드·주류 부스 둘 다',
      '외부 음식 불가, **500ml** 이하 생수만',
      '술은 티켓부스에서 받는 **성인인증** 밴드로',
    ],
  },
  {
    id: 'photo',
    title: '포토부스',
    art: photo,
    tone: '#8b73a0',
    lines: ['**포토부스** 9홀 안 · **11:00**부터', '하프컷(2장) **5,000원**', '디자인 2종 중 택 1 · 카드 결제만', '손목밴드를 차는 공연장 밖 티켓부스와는 다른 곳'],
  },
]
