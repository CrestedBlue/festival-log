import { APP_NAME } from '../../../components/AppHeader'
import type { Festival } from '../../../data/schema'
import { mixOklab } from '../../../lib/color'
import { formatDayLabel } from '../../../lib/time'
import { dayArtSource } from './art'
import { fitLabel, lineHeightOf, type MeasureText } from './fitLabel'
import {
  GRID_TOP,
  HEADER_HEIGHT,
  HOURS_WIDTH,
  PAD_X,
  STAGE_HEAD_HEIGHT,
  shareLayout,
  type SetBox,
  type ShareLayout,
  type StageColumn,
} from './layout'

// The day theme (tokens.css) whatever the phone is set to: a shared picture looks the same to everyone.
const PAPER = '#fbf6ea'
const SURFACE = '#fffcf4'
const INK = '#1b1d1a'
const INK_SOFT = '#5f625a'
const LINE = '#e3d9c5'
const ON_ACCENT = '#fffaf0'

const BODY_FONT = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif"
const DISPLAY_FONT = "'Black Han Sans', 'Pretendard Variable', sans-serif"
const SERIF_FONT = "Georgia, 'Times New Roman', AppleMyungjo, 'Noto Serif KR', serif"

/** Sets you did not star fade back so your own route stands out; with nothing starred nothing fades. */
const FADED_ALPHA = 0.4
const NOTCH = 12
const STAR_SIZE = 24
const STAR_PATH = 'm12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z'
const ART_BOX = { w: 230, h: 160 } as const
const TITLE_SIZES = [64, 58, 52, 46, 40, 36] as const
const CHIP_SIZES = [34, 30, 26] as const
const STAGE_NAME_SIZES = [25, 22, 19] as const

export interface ShareImageInput {
  festival: Festival
  day: string
  favorites: ReadonlySet<string>
  /** "GMF 2026" above the title, when the festival has one. */
  eyebrow: string | null
  /** The festival's main color for the date; ink when it has none. */
  accent: string | null
  /** The festival's picture beside the title. */
  art: string | null
}

const measureWith =
  (ctx: CanvasRenderingContext2D, weight: number, family: string): MeasureText =>
  (text, size) => {
    ctx.font = `${weight} ${size}px ${family}`
    return ctx.measureText(text).width
  }

/** The fonts come in per-glyph pieces: fetch the ones this picture uses. Offline, the fallbacks draw instead. */
async function loadFonts(text: string): Promise<void> {
  await Promise.allSettled([
    document.fonts.load(`64px ${DISPLAY_FONT}`, text),
    document.fonts.load(`800 26px ${BODY_FONT}`, text),
    document.fonts.load(`600 22px ${BODY_FONT}`, text),
    document.fonts.load(`400 21px ${BODY_FONT}`, text),
  ])
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`그림을 불러오지 못했어요: ${src}`))
    image.src = src
  })
}

/** A ticket with a quarter circle cut from each corner; the outline follows the cuts. */
function ticketPath(x: number, y: number, w: number, h: number, r: number): Path2D {
  const path = new Path2D()
  path.moveTo(x + r, y)
  path.lineTo(x + w - r, y)
  path.arc(x + w, y, r, Math.PI, Math.PI / 2, true)
  path.lineTo(x + w, y + h - r)
  path.arc(x + w, y + h, r, (Math.PI * 3) / 2, Math.PI, true)
  path.lineTo(x + r, y + h)
  path.arc(x, y + h, r, 0, -Math.PI / 2, true)
  path.lineTo(x, y + r)
  path.arc(x, y, r, Math.PI / 2, 0, true)
  path.closePath()
  return path
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, filled: boolean): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(STAR_SIZE / 24, STAR_SIZE / 24)
  const star = new Path2D(STAR_PATH)
  ctx.lineJoin = 'round'
  ctx.lineWidth = 2
  ctx.strokeStyle = color
  ctx.fillStyle = color
  if (filled) ctx.fill(star)
  ctx.stroke(star)
  ctx.restore()
}

function drawHeader(ctx: CanvasRenderingContext2D, input: ShareImageInput, width: number, art: HTMLImageElement | null) {
  const textWidth = width - PAD_X * 2 - (art ? ART_BOX.w + 24 : 0)
  ctx.textBaseline = 'top'
  ctx.fillStyle = INK

  if (input.eyebrow) {
    // Letter-spaced by hand: canvas letterSpacing is not in every browser yet.
    ctx.font = `700 30px ${SERIF_FONT}`
    let x = PAD_X
    for (const char of input.eyebrow) {
      ctx.fillText(char, x, 52)
      x += ctx.measureText(char).width + 9
    }
  }

  const title = input.festival.name
  const titleFit = fitLabel(title, { firstLineWidth: textWidth, lineWidth: textWidth, height: 80 }, measureWith(ctx, 400, DISPLAY_FONT), {
    sizes: TITLE_SIZES,
    reserve: 0,
  })
  ctx.font = `400 ${titleFit.size}px ${DISPLAY_FONT}`
  ctx.fillText(titleFit.lines[0] ?? title, PAD_X, 100 + (64 - titleFit.size) / 2)

  const venue = input.festival.venue.name.trim()
  const chipText = venue ? `${formatDayLabel(input.day)} · ${venue}` : formatDayLabel(input.day)
  const chipFit = fitLabel(chipText, { firstLineWidth: textWidth - 60, lineWidth: textWidth - 60, height: 40 }, measureWith(ctx, 800, BODY_FONT), {
    sizes: CHIP_SIZES,
    reserve: 0,
  })
  const chipLabel = chipFit.lines[0] ?? chipText
  ctx.font = `800 ${chipFit.size}px ${BODY_FONT}`
  const chipW = ctx.measureText(chipLabel).width + 60
  ctx.fillStyle = input.accent ?? INK
  ctx.beginPath()
  ctx.roundRect(PAD_X, 200, chipW, 60, 10)
  ctx.fill()
  ctx.fillStyle = ON_ACCENT
  ctx.textBaseline = 'middle'
  ctx.fillText(chipLabel, PAD_X + 30, 231)

  if (art) {
    const naturalW = art.naturalWidth || ART_BOX.w
    const naturalH = art.naturalHeight || ART_BOX.h
    const scale = Math.min(ART_BOX.w / naturalW, ART_BOX.h / naturalH)
    const w = naturalW * scale
    const h = naturalH * scale
    ctx.drawImage(art, width - PAD_X - w, 50 + (ART_BOX.h - h) / 2, w, h)
  }
}

function drawStageHead(ctx: CanvasRenderingContext2D, stage: StageColumn) {
  const x = stage.x + 4
  const y = HEADER_HEIGHT + 4
  const w = stage.w - 8
  const h = STAGE_HEAD_HEIGHT - 16
  ctx.fillStyle = mixOklab(stage.color, PAPER, 0.26)
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 10)
  ctx.fill()

  // A dot in the stage color stands in for the app's stage icon.
  ctx.fillStyle = stage.color
  ctx.beginPath()
  ctx.arc(x + 20, y + h / 2, 8, 0, Math.PI * 2)
  ctx.fill()

  const textX = x + 36
  const textW = w - 36 - 10
  const fit = fitLabel(stage.name, { firstLineWidth: textW, lineWidth: textW, height: h - 12 }, measureWith(ctx, 700, SERIF_FONT), {
    sizes: STAGE_NAME_SIZES,
    reserve: 0,
  })
  const lineH = lineHeightOf(fit.size)
  ctx.font = `700 ${fit.size}px ${SERIF_FONT}`
  ctx.fillStyle = INK
  ctx.textBaseline = 'top'
  const top = y + (h - fit.lines.length * lineH) / 2 + 2
  fit.lines.forEach((line, i) => ctx.fillText(line, textX, top + i * lineH))
}

function drawGrid(ctx: CanvasRenderingContext2D, layout: ShareLayout) {
  const right = layout.width - PAD_X
  ctx.strokeStyle = LINE
  for (const mark of layout.marks) {
    ctx.lineWidth = mark.label ? 2 : 1
    ctx.setLineDash(mark.label ? [] : [6, 6])
    ctx.beginPath()
    ctx.moveTo(HOURS_WIDTH, mark.y)
    ctx.lineTo(right, mark.y)
    ctx.stroke()
  }
  ctx.lineWidth = 1
  ctx.setLineDash([6, 6])
  for (const stage of layout.stages) {
    ctx.beginPath()
    ctx.moveTo(stage.x, GRID_TOP)
    ctx.lineTo(stage.x, layout.gridBottom)
    ctx.stroke()
  }
  ctx.setLineDash([])

  ctx.font = `600 22px ${BODY_FONT}`
  ctx.fillStyle = INK_SOFT
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  layout.marks.forEach((mark, i) => {
    if (mark.label) ctx.fillText(mark.label, HOURS_WIDTH - 14, i === 0 ? mark.y + 12 : mark.y)
  })
  ctx.textAlign = 'left'
}

function drawSet(ctx: CanvasRenderingContext2D, set: SetBox, faded: boolean) {
  const edge = set.isFavorite ? 4 : 2
  const path = ticketPath(set.x + edge / 2, set.y + edge / 2, set.w - edge, set.h - edge, NOTCH)
  ctx.save()
  // Paper under a faded set, so the grid lines don't show through it.
  ctx.fillStyle = PAPER
  ctx.fill(path)
  ctx.globalAlpha = faded ? FADED_ALPHA : 1
  ctx.fillStyle = mixOklab(set.color, SURFACE, set.isFavorite ? 0.34 : 0.12)
  ctx.fill(path)
  ctx.lineWidth = edge
  ctx.strokeStyle = set.isFavorite ? set.color : mixOklab(set.color, SURFACE, 0.32)
  ctx.stroke(path)
  ctx.clip(path)

  const padTop = 11
  const padLeft = 16
  const padRight = 12
  drawStar(ctx, set.x + set.w - padRight - STAR_SIZE, set.y + padTop, set.isFavorite ? set.color : mixOklab(set.color, INK, 0.55), set.isFavorite)

  const box = {
    firstLineWidth: set.w - padLeft - padRight - STAR_SIZE - 6,
    lineWidth: set.w - padLeft - padRight,
    height: set.h - padTop - 9,
  }
  const fit = fitLabel(set.artist, box, measureWith(ctx, 800, BODY_FONT))
  const lineH = lineHeightOf(fit.size)
  ctx.font = `800 ${fit.size}px ${BODY_FONT}`
  ctx.fillStyle = INK
  ctx.textBaseline = 'top'
  fit.lines.forEach((line, i) => ctx.fillText(line, set.x + padLeft, set.y + padTop + i * lineH))
  if (fit.showTime) {
    ctx.font = `400 21px ${BODY_FONT}`
    ctx.fillStyle = set.isFavorite ? mixOklab(INK_SOFT, INK, 0.45) : INK_SOFT
    ctx.fillText(set.time, set.x + padLeft, set.y + padTop + fit.lines.length * lineH + 2)
  }
  ctx.restore()
}

function drawFooter(ctx: CanvasRenderingContext2D, layout: ShareLayout) {
  const y = layout.gridBottom + 50
  ctx.textBaseline = 'middle'
  ctx.fillStyle = INK_SOFT
  if (layout.favoriteCount > 0) {
    ctx.font = `700 24px ${BODY_FONT}`
    ctx.fillText(`★ 찜한 공연 ${layout.favoriteCount}개`, PAD_X, y)
  }
  ctx.font = `800 24px ${BODY_FONT}`
  ctx.textAlign = 'right'
  ctx.fillText(APP_NAME, layout.width - PAD_X, y)
  ctx.textAlign = 'left'
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지를 만들지 못했어요'))), 'image/png'),
  )

/** Draws one day's whole timetable as a long PNG: your starred sets inked deep, the rest faded back. */
export async function renderShareImage(input: ShareImageInput): Promise<Blob> {
  const layout = shareLayout({
    stages: input.festival.stages,
    performances: input.festival.performances,
    day: input.day,
    favorites: input.favorites,
  })
  const allText = [input.festival.name, input.festival.venue.name, ...layout.stages.map((s) => s.name), ...layout.sets.map((s) => s.artist)].join('')
  await loadFonts(`${allText}0123456789:·-★…${APP_NAME}찜한공연개월화수목금토일() `)
  // Without its picture the image still works, so a picture that fails to load is left out.
  const art = input.art ? await dayArtSource(input.art).then(loadImage).catch(() => null) : null

  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이 브라우저에서는 이미지를 그릴 수 없어요')

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, layout.width, layout.height)
  drawHeader(ctx, input, layout.width, art)
  layout.stages.forEach((stage) => drawStageHead(ctx, stage))
  drawGrid(ctx, layout)
  const fades = layout.favoriteCount > 0
  layout.sets.forEach((set) => drawSet(ctx, set, fades && !set.isFavorite))
  drawFooter(ctx, layout)
  return toBlob(canvas)
}
