import lineup1 from '../../assets/lineups/herorock2026-1.webp'
import lineup2 from '../../assets/lineups/herorock2026-2.webp'
import type { Festival } from '../schema'
import { HERO_ROCK_2026_ID } from './ids'
import type { LineupImage } from './lineup'
import { HERO_ROCK } from './series/heroRock'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * 2026 히어로 락 페스티벌 - 인천 (2026-12-18/20, Songdo Convensia, Incheon).
 * Source: Melon Ticket product page (ticket.melon.com/performance/index.htm?prodId=214033), and the 2nd line-up post on
 * Instagram (@herorockfestival, 2026-10-26: instagram.com/p/De_DYNHCWuJ).
 * The line-up is out but the timetable is not, so there are no stages or performances yet: the timetable
 * tab shows the line-up posters instead. Fill them in once the official timetable is out.
 * The venue and its map pins belong to the festival, not the year: see series/heroRock.ts.
 */
export { HERO_ROCK_2026_ID }

/** Admin notices, summarised from the Melon Ticket page and the Instagram ticket posts (2026). */
export const HERO_ROCK_2026_NOTICES: readonly string[] = [
  '모바일 티켓으로만 들어갈 수 있어요. 멜론티켓 앱 › 마이티켓 › 예매내역 › 모바일티켓에서 확인해요.',
  '사흘 모두 오전 10시 30분에 시작해요(관람 시간 690분).',
  '장애인·국가유공자·미성년자 30% 할인으로 샀다면 증빙자료를 챙기세요. 없으면 현장에서 차액을 내요.',
  '관람일 당일이나 취소 마감 시간이 지나면 취소·환불이 안 돼요.',
  '일반 티켓은 10월 28일(수) 오후 2시 멜론티켓에서 열려요. 3일권 129,000원, 2일권(금토·토일·금일) 119,000원, ' +
    '1일권 77,000원이고 1인 4매까지예요. 매진되면 취소표로만 살 수 있어요.',
]

/** Official ticket seller: Melon Ticket, as the Instagram ticket posts say. */
export const HERO_ROCK_2026_TICKETS: readonly TicketSeller[] = [SELLERS.melon(214033)]

/** Official line-up posters in the order they were announced (add each new one at the end). */
export const HERO_ROCK_2026_LINEUP: readonly LineupImage[] = [
  {
    src: lineup1,
    label: '1차 라인업',
    alt:
      '2026 히어로 락 페스티벌 인천 1차 라인업 포스터: YB, 부활, 국카스텐, LACUNA COIL, 데이브레이크, 크라잉넛, ' +
      'MARTY FRIEDMAN, 쏜애플, 터치드, 로맨틱펀치, GUMX, QWER, HANABIE., Sable Hills, 브로큰 발렌타인, 카디, ' +
      '극동아시아타이거즈 외. 2026년 12월 18일(금)·19일(토)·20일(일), 송도컨벤시아',
    width: 700,
    height: 880,
  },
  {
    src: lineup2,
    label: '2차 라인업',
    alt:
      '2026 히어로 락 페스티벌 인천 2차 라인업 포스터. 12월 18일(금): 부활, 쏜애플, 노브레인, 카디, 솔루션스, ' +
      '너드커넥션, 송소희, 캔트비블루, 크랙샷, 롤링쿼츠, 더 픽스, 심아일랜드. 12월 19일(토): YB, LACUNA COIL, ' +
      'MARTY FRIEDMAN, 크라잉넛, GUMX, HANABIE., Sable Hills, 극동아시아타이거즈, 크래쉬, 디아블로, 메써드, ' +
      '브로큰 발렌타인. 12월 20일(일): 국카스텐, 데이브레이크, 로맨틱펀치, 터치드, QWER, 소란, 3호선 버터플라이, ' +
      '서울전자음악단, 해리빅버튼, 갤럭시익스프레스, 아시안체어샷, 아디오스오디오 외. 송도컨벤시아',
    width: 700,
    height: 875,
  },
]

export function createHeroRock2026(): Festival {
  return {
    id: HERO_ROCK_2026_ID,
    name: '2026 히어로 락 페스티벌 - 인천',
    startDate: '2026-12-18',
    endDate: '2026-12-20',
    venue: HERO_ROCK.venue,
    stages: [],
    performances: [],
    pins: HERO_ROCK.pins(),
  }
}
