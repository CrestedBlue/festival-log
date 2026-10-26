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

/** Shapes drawn beside a stage name (StageIcon). Catalog festivals pick one per stage in their theme; "dot" is the plain default. */
export const STAGE_ICONS = ['dot', 'leaf', 'sunset', 'flower', 'radar', 'star', 'bolt', 'cup', 'roof', 'wave', 'breath'] as const
export type StageIconName = (typeof STAGE_ICONS)[number]

export const StageSchema = z.object({ id, name, color: hexColor, icon: z.enum(STAGE_ICONS).optional() })

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
  /** The pin's role when a festival has several of it (화장실, 개수대, …): the pin list shows them as one row. */
  group: name.optional(),
  /** Where its row goes in the pin list when the position is unknown (lower first; else by kind). */
  rank: z.number().int().min(0).max(999).optional(),
  /** More about the place, shown when the pin is selected (who uses it, what is there). */
  detail: z.string().trim().max(200).optional(),
  // How an illustrated map draws a catalog pin (never set on the user's own pins):
  /** The map's icon for it (a key into the bundled map's icons); without one it is a plain pin. */
  mapIcon: z.string().max(40).optional(),
  /** A short name written beside the icon. */
  caption: z.string().trim().max(40).optional(),
  /** Where the map draws it, when not at the place itself (a badge set beside its booth). */
  spot: z.object({ lat: latitude, lng: longitude }).optional(),
})

export const VenueSchema = z.object({ name: z.string().trim().max(MAX_NAME_LENGTH), lat: latitude, lng: longitude })

const hasDuplicates = (ids: readonly string[]) => new Set(ids).size !== ids.length

export const FestivalSchema = z
  .object({
    id,
    name,
    startDate: isoDate,
    endDate: isoDate,
    // Dates not announced yet: startDate/endDate are placeholders inside the right year and are not shown.
    datesTbd: z.boolean().optional(),
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

/** What the previous app version saved (every festival stored in full on the device). Read only for migration. */
export const LegacyAppDataSchema = z.object({
  version: z.literal(1),
  activeFestivalId: id.nullable(),
  festivals: z.array(FestivalSchema),
  favorites: z.array(id),
})

const MAX_TICKET_LINK_LENGTH = 500

/**
 * What one device keeps. Festivals themselves come from the admin-maintained catalog in the app; the
 * device stores only which ones the user picked (by id) plus the user's own records.
 */
export const UserDataSchema = z.object({
  version: z.literal(2),
  myFestivalIds: z.array(id).max(MAX_ITEMS),
  activeFestivalId: id.nullable(),
  favorites: z.array(id).max(MAX_ITEMS * 4),
  userPins: z.record(id, z.array(PinSchema).max(MAX_ITEMS)),
  ticketLinks: z.record(id, z.string().url().max(MAX_TICKET_LINK_LENGTH)),
  // Festivals the user typed in with an older version: kept read-only so nothing is lost.
  archivedFestivals: z.array(FestivalSchema).max(MAX_ITEMS),
  // For each festival on my list, the catalog's update date as of when I last opened it: a newer one means new
  // content (a red dot). Data saved before this was kept has none (see updates.ts).
  seenUpdates: z.record(id, isoDate).default({}),
})

export type Stage = z.infer<typeof StageSchema>
export type Performance = z.infer<typeof PerformanceSchema>
export type PinKind = (typeof PIN_KINDS)[number]
export type Pin = z.infer<typeof PinSchema>
export type Venue = z.infer<typeof VenueSchema>
export type Festival = z.infer<typeof FestivalSchema>
export type LegacyAppData = z.infer<typeof LegacyAppDataSchema>
export type UserData = z.infer<typeof UserDataSchema>

export const EMPTY_USER_DATA: UserData = {
  version: 2,
  myFestivalIds: [],
  activeFestivalId: null,
  favorites: [],
  userPins: {},
  ticketLinks: {},
  archivedFestivals: [],
  seenUpdates: {},
}
