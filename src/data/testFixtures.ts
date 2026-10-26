import type { Festival, Pin, UserData } from './schema'

export const makeFestival = (overrides: Partial<Festival> = {}): Festival => ({
  id: 'f1',
  name: '테스트 페스티벌',
  startDate: '2026-10-17',
  endDate: '2026-10-18',
  venue: { name: '난지한강공원', lat: 37.5664, lng: 126.8787 },
  stages: [{ id: 's1', name: '메인', color: '#ff4d2e' }],
  performances: [{ id: 'p1', stageId: 's1', day: '2026-10-17', artist: 'A', start: '18:00', end: '19:00' }],
  pins: [],
  ...overrides,
})

export const makePin = (overrides: Partial<Pin> = {}): Pin => ({
  id: 'pin1',
  name: '만남의 장소',
  kind: 'meet',
  lat: 37.519,
  lng: 127.125,
  ...overrides,
})

export const makeUserData = (overrides: Partial<UserData> = {}): UserData => ({
  version: 2,
  myFestivalIds: [],
  activeFestivalId: null,
  favorites: [],
  userPins: {},
  ticketLinks: {},
  archivedFestivals: [],
  seenUpdates: {},
  ...overrides,
})
