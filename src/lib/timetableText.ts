import { MAX_NAME_LENGTH } from './limits'
import { spanOf } from './schedule'
import { parseClock } from './time'

export interface TimetableEntry {
  start: string
  end: string
  artist: string
}

export interface TimetableLineError {
  lineNumber: number
  line: string
  reason: string
}

const RANGE_PATTERN = /(\d{1,2}:\d{2})\s*[-~–—]\s*(\d{1,2}:\d{2})/
const EDGE_SEPARATORS = /^[\s|,·:/-]+|[\s|,·:/-]+$/g

const normalizeClock = (text: string) => {
  const minutes = parseClock(text)
  if (minutes === null) return null
  if (minutes === 24 * 60) return '24:00'
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function parseLine(line: string): TimetableEntry | string {
  const match = RANGE_PATTERN.exec(line)
  if (!match) return '시간 범위(예: 18:30-19:40)를 찾지 못했어요'
  const start = normalizeClock(match[1] ?? '')
  const end = normalizeClock(match[2] ?? '')
  if (!start || !end) return '없는 시간이에요'
  if (!spanOf(start, end)) return '끝나는 시간이 시작보다 빠르거나 12시간을 넘어요'
  const artist = line.replace(match[0], ' ').replace(EDGE_SEPARATORS, '').trim()
  if (!artist) return '아티스트 이름이 없어요'
  if (artist.length > MAX_NAME_LENGTH) return `아티스트 이름은 ${MAX_NAME_LENGTH}자까지만 돼요`
  return { start, end, artist }
}

/** Turns pasted lines like "18:30-19:40 아티스트" into timetable entries. */
export function parseTimetableText(text: string): { entries: TimetableEntry[]; errors: TimetableLineError[] } {
  const results = text.split(/\r?\n/).map((line, index) => ({ line, lineNumber: index + 1 }))
  const nonBlank = results.filter(({ line }) => line.trim() !== '')
  const parsed = nonBlank.map((item) => ({ ...item, result: parseLine(item.line) }))
  return {
    entries: parsed.flatMap(({ result }) => (typeof result === 'string' ? [] : [result])),
    errors: parsed.flatMap(({ result, line, lineNumber }) =>
      typeof result === 'string' ? [{ lineNumber, line, reason: result }] : [],
    ),
  }
}
