import { z } from 'zod'
import { FestivalSchema, type Festival } from './schema'

export const EXPORT_APP_ID = 'festival-log'
export const MAX_IMPORT_CHARS = 1_000_000

const ExportFileSchema = z.object({
  app: z.literal(EXPORT_APP_ID),
  version: z.literal(1),
  exportedAt: z.string().optional(),
  festival: FestivalSchema,
})

export type ImportResult = { ok: true; festival: Festival } | { ok: false; error: string }

export function serializeFestival(festival: Festival, now: Date = new Date()): string {
  return JSON.stringify({ app: EXPORT_APP_ID, version: 1, exportedAt: now.toISOString(), festival }, null, 2)
}

export function parseFestivalFile(text: string): ImportResult {
  if (text.length > MAX_IMPORT_CHARS) return { ok: false, error: '파일이 너무 커요 (최대 1MB).' }
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'JSON 파일이 아니에요.' }
  }
  let parsed: ReturnType<typeof ExportFileSchema.safeParse>
  try {
    parsed = ExportFileSchema.safeParse(json)
  } catch (error) {
    console.error('[festival-log] import validation crashed', error)
    return { ok: false, error: '파일 내용을 확인하지 못했어요.' }
  }
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: `페스티벌 로그 파일이 아니거나 내용이 잘못됐어요. (${first?.message ?? '알 수 없는 오류'})` }
  }
  return { ok: true, festival: parsed.data.festival }
}

export function festivalFileName(festival: Festival): string {
  const safe = festival.name.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '')
  return `${safe || 'festival'}.festival.json`
}
