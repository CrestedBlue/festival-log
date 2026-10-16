import { addDays, toIsoDate } from '../lib/time'
import { STAGE_COLORS, type Festival } from './schema'

// Fictional lineup so the sample never looks like a real festival's schedule.
const LINEUP: ReadonlyArray<readonly [stage: 0 | 1, start: string, end: string, artist: string]> = [
  [0, '13:00', '13:50', '새벽세탁소'],
  [0, '14:30', '15:30', '파란 고래 클럽'],
  [0, '16:10', '17:20', '노을방송국'],
  [0, '18:00', '19:20', '은하수 자전거'],
  [0, '20:00', '21:30', '오렌지 행성'],
  [0, '22:10', '23:40', '심야 라디오 밴드'],
  [1, '13:30', '14:20', '유리병 편지'],
  [1, '15:00', '16:00', '모래시계 오케스트라'],
  [1, '16:40', '17:40', '구름 수집가'],
  [1, '18:30', '19:40', '형광 고양이'],
  [1, '20:30', '21:40', '종이비행기 연합'],
  [1, '23:00', '00:30', 'DJ 미드나잇 스낵'],
]

export function createSampleFestival(today: Date, makeId: () => string): Festival {
  const day1 = toIsoDate(today)
  const days = [day1, addDays(day1, 1)]
  const stages = [
    { id: makeId(), name: '선셋 스테이지', color: STAGE_COLORS[0] },
    { id: makeId(), name: '리버 스테이지', color: STAGE_COLORS[1] },
  ]
  const performances = days.flatMap((day, dayIndex) =>
    LINEUP.map(([stage, start, end, artist]) => ({
      id: makeId(),
      stageId: stages[stage]?.id ?? '',
      day,
      artist: dayIndex === 0 ? artist : `${artist} (2일차)`,
      start,
      end,
    })),
  )
  return {
    id: makeId(),
    name: '샘플 페스티벌',
    startDate: days[0] ?? day1,
    endDate: days[1] ?? day1,
    venue: { name: '난지한강공원', lat: 37.5664, lng: 126.8787 },
    stages,
    performances,
    pins: [
      { id: makeId(), name: '선셋 스테이지', kind: 'stage', lat: 37.5672, lng: 126.8762 },
      { id: makeId(), name: '리버 스테이지', kind: 'stage', lat: 37.5651, lng: 126.8811 },
      { id: makeId(), name: '푸드트럭 존', kind: 'food', lat: 37.5662, lng: 126.8790 },
      { id: makeId(), name: '화장실', kind: 'toilet', lat: 37.5669, lng: 126.8801 },
      { id: makeId(), name: '친구들 만나는 곳', kind: 'meet', lat: 37.5658, lng: 126.8775 },
    ],
  }
}
