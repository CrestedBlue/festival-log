/** Sets starting within this many minutes get an "n분 후" badge. */
export const SOON_WITHIN_MIN = 30

export type SetStatus = { kind: 'live' } | { kind: 'soon'; minutes: number } | null

/** Whether a set (in festival minutes) is playing now or about to start; null when it is neither or the day is not today. */
export function setStatus(span: { start: number; end: number }, now: number | null): SetStatus {
  if (now === null) return null
  if (span.start <= now && now < span.end) return { kind: 'live' }
  const wait = span.start - now
  return wait > 0 && wait <= SOON_WITHIN_MIN ? { kind: 'soon', minutes: wait } : null
}
