import { useEffect, useId, useRef, useState } from 'react'
import { CloseIcon, ShareIcon } from '../../../components/icons'
import type { ResolvedFestival } from '../../../data/resolve'
import type { Festival } from '../../../data/schema'
import { formatDayLabel } from '../../../lib/time'
import { renderShareImage } from './draw'
import { canShareImage, downloadImage, shareImage } from './share'

type Sheet =
  | { kind: 'making' }
  | { kind: 'failed' }
  | { kind: 'ready'; file: File; url: string; shareFailed: boolean }

interface Props {
  festival: Festival
  day: string
  favorites: readonly string[]
  edition: ResolvedFestival['edition']
  accent: string | null
  art: string | null
}

/**
 * Shares the chosen day's timetable as a picture. The picture opens in a sheet first: the second tap
 * ("공유하기") is a fresh tap, which the phone's share sheet requires after the drawing took a moment.
 */
export function ShareButton({ festival, day, favorites, edition, accent, art }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Bumped on every open and close, so a picture finished after its sheet closed is dropped.
  const requestRef = useRef(0)
  const [sheet, setSheet] = useState<Sheet>({ kind: 'making' })
  const titleId = useId()
  const dayLabel = formatDayLabel(day)
  const previewUrl = sheet.kind === 'ready' ? sheet.url : null
  const canShare = sheet.kind === 'ready' && canShareImage(sheet.file)

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const open = async () => {
    const request = ++requestRef.current
    setSheet({ kind: 'making' })
    dialogRef.current?.showModal()
    try {
      const blob = await renderShareImage({
        festival,
        day,
        favorites: new Set(favorites),
        eyebrow: edition ? `${edition.series.toUpperCase()} ${edition.year}` : null,
        accent,
        art,
      })
      if (request !== requestRef.current) return
      const code = edition ? `${edition.series}${edition.year}` : 'timetable'
      const file = new File([blob], `${code}-${day}.png`, { type: 'image/png' })
      setSheet({ kind: 'ready', file, url: URL.createObjectURL(blob), shareFailed: false })
    } catch {
      if (request === requestRef.current) setSheet({ kind: 'failed' })
    }
  }

  const close = () => dialogRef.current?.close()

  const onClosed = () => {
    requestRef.current += 1
    setSheet({ kind: 'making' })
  }

  const share = async (file: File) => {
    const result = await shareImage(file)
    if (result === 'shared') close()
    if (result === 'failed') setSheet((s) => (s.kind === 'ready' ? { ...s, shareFailed: true } : s))
  }

  return (
    <>
      <button
        type="button"
        className="share-button"
        aria-label={`${dayLabel} 타임테이블을 이미지로 공유`}
        title="이미지로 공유"
        onClick={() => void open()}
      >
        <ShareIcon />
      </button>
      {/* A tap on the backdrop (the dialog itself, outside its body) closes it too. */}
      <dialog
        ref={dialogRef}
        className="share-sheet"
        aria-labelledby={titleId}
        onClose={onClosed}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="share-sheet__body">
          <header className="share-sheet__head">
            <h2 id={titleId} className="share-sheet__title">
              {dayLabel} 타임테이블 공유
            </h2>
            <button type="button" className="share-sheet__close" aria-label="닫기" onClick={close}>
              <CloseIcon />
            </button>
          </header>
          <div className="share-sheet__preview">
            {sheet.kind === 'making' && <p className="share-sheet__status">이미지 만드는 중…</p>}
            {sheet.kind === 'failed' && <p className="share-sheet__status">이미지를 만들지 못했어요. 잠시 뒤 다시 해 주세요.</p>}
            {sheet.kind === 'ready' && <img src={sheet.url} alt={`${dayLabel} 타임테이블 이미지`} />}
          </div>
          {sheet.kind === 'ready' && (
            <>
              <div className="share-sheet__actions">
                {canShare && (
                  <button type="button" className="btn btn--primary" onClick={() => void share(sheet.file)}>
                    공유하기
                  </button>
                )}
                <button type="button" className="btn" onClick={() => downloadImage(sheet.file)}>
                  이미지 저장
                </button>
              </div>
              {sheet.shareFailed && (
                <p className="share-sheet__error" role="alert">
                  공유하지 못했어요. 이미지 저장으로 받아 주세요.
                </p>
              )}
              <p className="share-sheet__hint">
                {canShare
                  ? '카카오톡·인스타그램은 공유하기에서 골라요. 이미지를 길게 눌러 저장할 수도 있어요.'
                  : '이미지를 저장해서 카카오톡·인스타그램에 올려 주세요. 휴대폰에서는 이미지를 길게 눌러도 저장돼요.'}
              </p>
            </>
          )}
        </div>
      </dialog>
    </>
  )
}
