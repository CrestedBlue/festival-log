import access from '../../assets/notice/access.webp'
import food from '../../assets/notice/food.webp'
import medical from '../../assets/notice/medical.webp'
import picnic from '../../assets/notice/picnic.webp'
import rules from '../../assets/notice/rules.webp'
import ticket from '../../assets/notice/ticket.webp'
import type { NoticeBlock } from './noticeBlock'

/**
 * Pentaport 2026's notices as topic blocks on the info tab, like Wonderlivet's (the user, 2026-11-26: "다른 데도 한번
 * 적용해 보세요. 펜타포트"). The facts are the official 2026 CHECKLIST post (Instagram 7/23: what may be brought in, food
 * and drinks, the medical booth, the barrier-free pass), the timetable post (entry time) and the official venue map
 * (7/14: which ticket booth and gate for subway or shuttle). The guide images themselves are no longer shown (the user,
 * 2026-11-26). One fact a line, short bold phrases, the first line opens with the topic's name in bold. The pictures
 * are the shared set in src/assets/notice/ (the ticket and food ones are Wonderlivet's, reused: the user, 2026-11-26).
 */
export const PENTAPORT_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  {
    id: 'entry',
    title: '입장',
    art: ticket,
    tone: '#d9482e',
    lines: [
      '**입장** 사흘 모두 **10:30**부터',
      '지하철: **제1 티켓부스** → GATE 1',
      '셔틀버스·택시: **제2 티켓부스** → GATE 2',
      '티켓부스에서 **손목밴드**로 바꾼 뒤 입장',
    ],
  },
  {
    id: 'picnic',
    title: '피크닉존',
    art: picnic,
    tone: '#7d9a5e',
    lines: [
      '**피크닉존**·리프레시존에서만 펼 수 있어요',
      '보냉백 **1인 1개**, **30L** 이하',
      '돗자리 **180×180cm** 이하',
      '원터치 텐트는 **리프레시존만**',
      '미니테이블 **50×30×25cm** 이하',
      '우산·양산 접이식 **110cm** 이하 · **장우산 불가**',
      '좌식 등받이 의자만 · **다리 있는 의자 불가**',
    ],
  },
  {
    id: 'food',
    title: '음식',
    art: food,
    tone: '#e08a1e',
    lines: [
      '**음식** 포장지 뗀 **다회용기**에 담은 것만',
      '채소·과일·스낵, 견과·에너지바·건조간식 가능',
      '**상하기 쉬운 음식 불가**: 인스턴트·국물·김밥·주먹밥',
      '유아용 음료·이유식은 가능',
      '생수 **500ml**·이온음료 **600ml** 이하 **미개봉**만',
      '개수 무제한 · 얼린 생수 가능 · **캔 불가**',
      '텀블러는 **1.18L**까지',
    ],
  },
  {
    id: 'rules',
    title: '금지',
    art: rules,
    tone: '#5f6470',
    lines: [
      '**금지** 휴대폰 말고 **다른 촬영장비**',
      '카메라·귀중품은 **물품보관소에 못 맡겨요**',
      '응원봉·LED·레이저 등 **발광물품**',
      '화기·칼·망치·가스 스프레이 등 **위험물품**',
      '**아이스박스**, 바퀴 달린 물건(자전거·킥보드·캐리어 등)',
      '다리 있는 캠핑의자',
      '정치·혐오 문구 현수막·배너',
      '깃발은 **100×150cm** 이하만 가능',
    ],
  },
  {
    id: 'medical',
    title: '의료부스',
    art: medical,
    tone: '#b4483f',
    lines: [
      '**의료부스** 도움이 필요하면 언제든',
      '화상연고·포도당 캔디·소화제·밴드·파스',
      '기본 구급약·생리대·일회용 인공눈물',
      '의약품은 **처방 확인** 뒤 반입(처방전·약 봉투·앱 기록)',
      '앱은 **실시간 화면만** · **캡처·사본 불가**',
      '주사기는 **의료부스에서만** 쓰고 버려요',
    ],
  },
  {
    id: 'access',
    title: '배리어프리 패스',
    art: access,
    tone: '#9a4f6a',
    lines: [
      '**배리어프리 패스** 임산부·교통약자',
      '임산부 **배지 확인 필수**(수첩·의료 서류도 가능)',
      '동반은 **1인**만',
      '의료 목적 휠체어(전동 포함)·유아차 반입 가능',
    ],
  },
]
