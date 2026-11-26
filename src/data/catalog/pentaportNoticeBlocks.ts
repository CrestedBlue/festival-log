import { noticeBlock } from './noticeArt'
import type { NoticeBlock } from './noticeBlock'

/**
 * Pentaport 2026's notices as topic blocks (the user, 2026-11-26: "다른 데도 한번 적용해 보세요. 펜타포트"). The facts
 * are the official 2026 CHECKLIST post (Instagram 7/23: what may be brought in, food and drinks, the medical booth, the
 * barrier-free pass), the timetable post (entry time, the programs) and the official venue map (7/14: which ticket
 * booth and gate for subway or shuttle). The guide images themselves are no longer shown (the user, 2026-11-26).
 */
export const PENTAPORT_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 사흘 모두 **10:30**부터',
    '지하철: **제1 티켓부스** → GATE 1',
    '셔틀버스·택시: **제2 티켓부스** → GATE 2',
    '티켓부스에서 **손목밴드**로 바꾼 뒤 입장',
  ]),
  noticeBlock('stage', '프로그램', [
    '**프로그램** 드리머부스 매일 **10:30–19:30**',
    '드리머부스 시간은 MONSTER ENERGY STAGE 시간표에',
    '**7/31(금) 13:00–16:00** 메인 쿨존',
    '"펜타포트 × 스포티파이 음모론"',
  ]),
  noticeBlock('picnic', '피크닉존', [
    '**피크닉존**·리프레시존에서만 펼 수 있어요',
    '보냉백 **1인 1개**, **30L** 이하',
    '돗자리 **180×180cm** 이하',
    '원터치 텐트는 **리프레시존만**',
    '미니테이블 **50×30×25cm** 이하',
    '우산·양산 접이식 **110cm** 이하 · **장우산 불가**',
    '좌식 등받이 의자만 · **다리 있는 의자 불가**',
  ]),
  noticeBlock('food', '음식', [
    '**음식** 포장지 뗀 **다회용기**에 담은 것만',
    '채소·과일·스낵, 견과·에너지바·건조간식 가능',
    '**상하기 쉬운 음식 불가**: 인스턴트·국물·김밥·주먹밥',
    '유아용 음료·이유식은 가능',
    '생수 **500ml**·이온음료 **600ml** 이하 **미개봉**만',
    '개수 무제한 · 얼린 생수 가능 · **캔 불가**',
    '텀블러는 **1.18L**까지',
  ]),
  noticeBlock('rules', '금지', [
    '**금지** 휴대폰 말고 **다른 촬영장비**',
    '카메라·귀중품은 **물품보관소에 못 맡겨요**',
    '응원봉·LED·레이저 등 **발광물품**',
    '화기·칼·망치·가스 스프레이 등 **위험물품**',
    '**아이스박스**, 바퀴 달린 물건(자전거·킥보드·캐리어 등)',
    '다리 있는 캠핑의자',
    '정치·혐오 문구 현수막·배너',
    '깃발은 **100×150cm** 이하만 가능',
  ]),
  noticeBlock('medical', '의료부스', [
    '**의료부스** 도움이 필요하면 언제든',
    '화상연고·포도당 캔디·소화제·밴드·파스',
    '기본 구급약·생리대·일회용 인공눈물',
    '의약품은 **처방 확인** 뒤 반입(처방전·약 봉투·앱 기록)',
    '앱은 **실시간 화면만** · **캡처·사본 불가**',
    '주사기는 **의료부스에서만** 쓰고 버려요',
  ]),
  noticeBlock('access', '배리어프리 패스', [
    '**배리어프리 패스** 임산부·교통약자',
    '임산부 **배지 확인 필수**(수첩·의료 서류도 가능)',
    '동반은 **1인**만',
    '의료 목적 휠체어(전동 포함)·유아차 반입 가능',
  ]),
]

/** Pentaport 2025's notices as topic blocks (the user, 2026-11-26: every festival in this format), from its notices. */
export const PENTAPORT_2025_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 게이트 사흘 모두 **10:00**',
    '행사 **10:00–22:00** · 티켓부스 **10:00–21:00**',
    '워터프런트 공사로 **티켓부스 자리 변경**, 대기 가능',
  ]),
  noticeBlock('stage', '프로그램', ['**프로그램** 개막식 **8/1(금) 21:00–21:10**', 'KB국민카드 STARSHOP 스테이지']),
  noticeBlock('food', '음식', [
    '**음식** F&B는 **퀸즈스마일** 앱으로 미리 주문',
    'KB국민카드 할인: F&B·맥주·MD·생수',
    '민생회복 소비쿠폰 **사용 불가**',
  ]),
  noticeBlock('medical', '폭염 대비', ['**폭염 대비** 생수 **개수 제한 없이** 반입', '의료 쿨존·그늘막·워터캐논·살수차', '의료부스도 이용하세요']),
  noticeBlock('directions', '오는 길', [
    '**오는 길** 송도달빛축제공원역 **4번 출구**',
    '걸어서 **10분**(약 550m)',
    '인천 1호선 박촌행 사흘 동안 **새벽 1시**까지 연장',
  ]),
]
