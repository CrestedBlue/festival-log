import directions from '../../assets/notice/directions.webp'
import food from '../../assets/notice/food.webp'
import goods from '../../assets/notice/goods.webp'
import lockers from '../../assets/notice/lockers.webp'
import photo from '../../assets/notice/photo.webp'
import rules from '../../assets/notice/rules.webp'
import ticket from '../../assets/notice/ticket.webp'
import type { NoticeBlock } from './noticeBlock'

/**
 * The topics worth a picture on the info tab (the user's sketch, 2026-11-26): the ticket booth, goods, the lockers,
 * the food zone, the photo booth, what is not allowed and how to get there. The ticket booth and the wristband facts are in the entry block (the user, 2026-11-26: one block named 입장, as Pentaport's) (the user, 2026-11-26: "wristband = ticket" was how to sort
 * them, not a line to print). The facts are the notices' (timetable post, FAQ, 11/9–11/24 posts); each picture
 * is its own color so they do not look alike. The first line of a block starts with the topic's name in bold (the user, 2026-11-26). No stall lists. Pictures come from Codex (image generation), in one style.
 */
export const WONDERLIVET_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  {
    id: 'entry',
    title: '입장',
    art: ticket,
    tone: '#d9482e',
    lines: [
      '**입장** 티켓부스 **10:00**부터 공연 끝까지',
      '메인 게이트 **11:00** · 첫 공연 **12:00**',
      '모바일 티켓 + **본인 실물 신분증**, 동행인과 함께',
      '**캡처 불가** · **대리 수령 불가** · **재발급 불가**',
      '손목밴드 착용 시 무대 이동·**재입장 가능** · 방수',
      '현장 판매: 남은 표만, 당일 **10:30**부터(SNS 공지)',
      '예매·취소 마감 관람 전날 **11:00**',
    ],
  },
  {
    id: 'goods',
    title: '굿즈',
    art: goods,
    tone: '#d4607a',
    lines: [
      '**굿즈** 현장 구매 9홀 안 **11:30–21:00**',
      '현장 QR(네이버 예약)로 구매',
      '**손목밴드 착용자만**',
      '**한정 수량**, 품절 주의',
      '아티스트 굿즈 출연일 무관, 3일 내내',
      '외국인은 네이버 가입·본인인증 필요',
      '사전 예약(YES24) 종료 · 고른 날짜에만 픽업',
      '사전 예약 품절 상품은 **현장 구매 불가**',
      '수령 QR 전날 **20:00** YES24 마이페이지',
      '온라인 판매 **11/24–12/14**(남은 재고만)',
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
      '외부 음식 **불가**, **500ml** 이하 생수만',
      '주류는 **성인인증** 밴드 필요(티켓부스에서)',
    ],
  },
  {
    id: 'photo',
    title: '포토부스',
    art: photo,
    tone: '#8b73a0',
    lines: ['**포토부스** 9홀 안 · **11:00**부터', '하프컷(2장) **5,000원**', '디자인 2종 중 택 1 · 카드 결제만', '공연장 밖 티켓부스와 **다른 곳**'],
  },
  {
    id: 'rules',
    title: '금지',
    art: rules,
    tone: '#5f6470',
    lines: ['**금지** 공연 **촬영·녹음**', '일부 아티스트는 **기념사진 포함 모든 촬영 금지**', '흡연은 전시장 밖 **지정 흡연구역**에서만'],
  },
  {
    id: 'directions',
    title: '오는 길',
    art: directions,
    tone: '#4f6f9a',
    lines: [
      '**오는 길** 킨텍스역(GTX-A) **4·5번 출구**',
      '대화역(3호선) **2번 출구**, 버스나 걸어서',
      '버스: 킨텍스·킨텍스 제2전시장 정류장',
      '차: 내비에 "킨텍스 제2전시장" · **주차 할인 없음**',
    ],
  },
]
