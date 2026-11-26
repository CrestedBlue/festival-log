import { noticeBlock } from './noticeArt'
import type { NoticeBlock } from './noticeBlock'

/**
 * Wonderlivet 2026's notices as topic blocks (the user's sketch, 2026-11-26), from the timetable post, the FAQ, the
 * 11/5–11/25 posts. The ticket booth and the wristband facts are in the entry block (the user, 2026-11-26: one block named
 * 입장; "wristband = ticket" was how to sort them, not a line to print). One fact a line, short bold phrases, the first
 * line opens with the topic's name in bold, no stall lists. The pictures are the shared set (noticeArt.ts).
 */
export const WONDERLIVET_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 티켓부스 **10:00**부터 공연 끝까지',
    '메인 게이트 **11:00** · 첫 공연 **12:00**',
    '모바일 티켓 + **본인 실물 신분증**, 동행인과 함께',
    '**캡처 불가** · **대리 수령 불가** · **재발급 불가**',
    '손목밴드 착용 시 무대 이동·**재입장 가능** · 방수',
    '현장 판매: 남은 표만, 당일 **10:30**부터(SNS 공지)',
    '예매·취소 마감 관람 전날 **11:00**',
  ]),
  noticeBlock('stage', '무대', [
    '**무대** WONDER STAGE 7·8홀 · LIVET STAGE 10홀',
    '**전석 스탠딩**',
    '무대 사이 이동은 건물 1·2층 모두 가능',
    '2층 게이트는 1층 첫 입장 줄이 **다 들어간 뒤**부터',
    '화장실은 공연장 안·바깥 로비 둘 다',
  ]),
  noticeBlock('goods', '굿즈', [
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
  ]),
  noticeBlock('lockers', '물품보관소', ['**물품보관소** 2층 9홀 앞 로비', '**09:00–23:00**쯤']),
  noticeBlock('food', '푸드존', [
    '**푸드존** 7·8홀, 9홀 안 · 푸드·주류 부스 둘 다',
    '외부 음식 **불가**, **500ml** 이하 생수만',
    '주류는 **성인인증** 밴드 필요(티켓부스에서)',
  ]),
  noticeBlock('photo', '포토부스', ['**포토부스** 9홀 안 · **11:00**부터', '하프컷(2장) **5,000원**', '디자인 2종 중 택 1 · 카드 결제만', '공연장 밖 티켓부스와 **다른 곳**']),
  noticeBlock('rules', '금지', ['**금지** 공연 **촬영·녹음**', '일부 아티스트는 **기념사진 포함 모든 촬영 금지**', '흡연은 전시장 밖 **지정 흡연구역**에서만']),
  noticeBlock('directions', '오는 길', [
    '**오는 길** 킨텍스역(GTX-A) **4·5번 출구**',
    '대화역(3호선) **2번 출구**, 버스나 걸어서',
    '버스: 킨텍스·킨텍스 제2전시장 정류장',
    '차: 내비에 "킨텍스 제2전시장" · **주차 할인 없음**',
  ]),
  noticeBlock('lostfound', '분실물', [
    '**분실물** **11/30(월) 23:59**까지 확인 메일',
    '메일 festival@wanderloch.com',
    '제목 [원더리벳 2026 분실물 확인]',
    '분실물 번호·방문일·내 물건 확인 자료·이름·연락처·주소',
    '12월 둘째 주 **착불** 발송 · 연락 없으면 **폐기**',
  ]),
]
