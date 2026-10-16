import { z } from 'zod'
import { MAX_NAME_LENGTH } from '../lib/limits'
import { spanOf } from '../lib/schedule'
import { MAX_FESTIVAL_DAYS, dayDiff, isIsoDate, listDays, parseClock } from '../lib/time'

const MAX_ITEMS = 500

const id = z.string().min(1).max(64)
const name = z.string().trim().min(1).max(MAX_NAME_LENGTH)
const isoDate = z.string().refine(isIsoDate, '날짜는 YYYY-MM-DD 형식이어야 해요')
const clock = z.string().refine((v) => parseClock(v) !== null, '시간은 HH:MM 형식이어야 해요')
const latitude = z.number().min(-90).max(90)
const longitude = z.number().min(-180).max(180)
const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i)

export const StageSchema = z.object({ id, name, color: hexColor })

// spanOf never throws, so this stays safe even when start/end already failed the clock check.
export const PerformanceSchema = z
  .object({ id, stageId: id, day: isoDate, artist: name, start: clock, end: clock })
  .refine((p) => spanOf(p.start, p.end) !== null, '끝나는 시간이 시작보다 빠르거나 12시간을 넘어요')

// The first five can be picked when adding a pin; the rest mirror the official festival map legend.
export const USER_PIN_KINDS = ['stage', 'food', 'toilet', 'meet', 'etc'] as const
export const PIN_KINDS = [
  ...USER_PIN_KINDS,
  'info',
  'firstaid',
  'wristband',
  'luggage',
  'water',
  'eating',
  'shop',
  'slogan',
  'radar',
  'photo',
  'smoking',
  'sponsor',
  'artist',
  'vinyl',
] as const
export const PinSchema = z.object({
  id,
  name,
  kind: z.enum(PIN_KINDS),
  lat: latitude,
  lng: longitude,
})

export const VenueSchema = z.object({ name: z.string().trim().max(MAX_NAME_LENGTH), lat: latitude, lng: longitude })

const hasDuplicates = (ids: readonly string[]) => new Set(ids).size !== ids.length

export const FestivalSchema = z
  .object({
    id,
    name,
    startDate: isoDate,
    endDate: isoDate,
    venue: VenueSchema,
    stages: z.array(StageSchema).max(MAX_ITEMS),
    performances: z.array(PerformanceSchema).max(MAX_ITEMS * 4),
    pins: z.array(PinSchema).max(MAX_ITEMS),
  })
  .superRefine((f, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
    if (!isIsoDate(f.startDate) || !isIsoDate(f.endDate)) return
    const length = dayDiff(f.startDate, f.endDate)
    if (length < 0) return fail('종료일이 시작일보다 빨라요')
    if (length >= MAX_FESTIVAL_DAYS) return fail(`페스티벌 기간은 최대 ${MAX_FESTIVAL_DAYS}일이에요`)

    const days = new Set(listDays(f.startDate, f.endDate))
    const stageIds = new Set(f.stages.map((s) => s.id))
    if (f.performances.some((p) => !days.has(p.day))) fail('페스티벌 기간 밖의 공연이 있어요')
    if (f.performances.some((p) => !stageIds.has(p.stageId))) fail('존재하지 않는 스테이지를 가리키는 공연이 있어요')
    if ([f.stages, f.performances, f.pins].some((list) => hasDuplicates(list.map((item) => item.id)))) {
      fail('중복된 ID가 있어요')
    }
  })

export const AppDataSchema = z.object({
  version: z.literal(1),
  activeFestivalId: id.nullable(),
  festivals: z.array(FestivalSchema),
  favorites: z.array(id),
})

export type Stage = z.infer<typeof StageSchema>
export type Performance = z.infer<typeof PerformanceSchema>
export type PinKind = (typeof PIN_KINDS)[number]
export type Pin = z.infer<typeof PinSchema>
export type Venue = z.infer<typeof VenueSchema>
export type Festival = z.infer<typeof FestivalSchema>
export type AppData = z.infer<typeof AppDataSchema>

export const EMPTY_DATA: AppData = { version: 1, activeFestivalId: null, festivals: [], favorites: [] }

export const STAGE_COLORS = ['#ff4d2e', '#3d5afe', '#16a34a', '#a855f7', '#f59e0b', '#0891b2', '#db2777'] as const

export const nextStageColor = (festival: Pick<Festival, 'stages'>): string =>
  STAGE_COLORS[festival.stages.length % STAGE_COLORS.length] ?? STAGE_COLORS[0]
