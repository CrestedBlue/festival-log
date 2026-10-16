/** Sets that start before this wall-clock minute belong to the previous festival night. */
export const DAY_CUTOFF_MINUTES = 6 * 60
export const MINUTES_PER_DAY = 24 * 60
export const MAX_FESTIVAL_DAYS = 31
const MS_PER_DAY = 86_400_000
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

const CLOCK_PATTERN = /^(\d{1,2}):(\d{2})$/
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export interface FestivalMoment {
  day: string
  minutes: number
}

export function parseClock(text: string): number | null {
  const match = CLOCK_PATTERN.exec(text.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours === 24 && minutes === 0) return MINUTES_PER_DAY
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

export function toFestivalMinutes(clock: string): number {
  const minutes = parseClock(clock)
  if (minutes === null) throw new Error(`잘못된 시간 형식: "${clock}"`)
  return minutes < DAY_CUTOFF_MINUTES ? minutes + MINUTES_PER_DAY : minutes
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export function formatClock(festivalMinutes: number): string {
  const wall = ((festivalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  return `${pad2(Math.floor(wall / 60))}:${pad2(wall % 60)}`
}

/** Parses YYYY-MM-DD into a UTC timestamp so day math never drifts with the local timezone. */
function isoToUtc(day: string): number | null {
  const match = ISO_DATE_PATTERN.exec(day)
  if (!match) return null
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const utc = Date.UTC(y, m - 1, d)
  const check = new Date(utc)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null
  return utc
}

const utcToIso = (utc: number) => new Date(utc).toISOString().slice(0, 10)

export function isIsoDate(day: string): boolean {
  return isoToUtc(day) !== null
}

export function addDays(day: string, amount: number): string {
  const utc = isoToUtc(day)
  if (utc === null) throw new Error(`잘못된 날짜 형식: "${day}"`)
  return utcToIso(utc + amount * MS_PER_DAY)
}

export function listDays(startDate: string, endDate: string): string[] {
  const start = isoToUtc(startDate)
  const end = isoToUtc(endDate)
  if (start === null || end === null || end < start) return []
  const count = Math.min((end - start) / MS_PER_DAY + 1, MAX_FESTIVAL_DAYS)
  return Array.from({ length: count }, (_, i) => utcToIso(start + i * MS_PER_DAY))
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function festivalMoment(now: Date): FestivalMoment {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const today = toIsoDate(now)
  if (minutes >= DAY_CUTOFF_MINUTES) return { day: today, minutes }
  return { day: addDays(today, -1), minutes: minutes + MINUTES_PER_DAY }
}

export function formatDayLabel(day: string): string {
  const utc = isoToUtc(day)
  if (utc === null) return day
  const date = new Date(utc)
  return `${date.getUTCMonth() + 1}.${date.getUTCDate()} (${WEEKDAYS_KO[date.getUTCDay()]})`
}

export function dayDiff(from: string, to: string): number {
  const a = isoToUtc(from)
  const b = isoToUtc(to)
  if (a === null || b === null) throw new Error(`잘못된 날짜 형식: "${from}", "${to}"`)
  return Math.round((b - a) / MS_PER_DAY)
}
