import { useState, type FormEvent } from 'react'
import { EditIcon } from '../../components/icons'
import type { GuideSet } from '../../data/catalog/guide'
import { sourceHref, sourceLabel } from '../../data/catalog/series/sources'
import type { CollectionSource } from '../../data/catalog/series/types'
import { updateData } from '../../data/store'
import { setTicketLink } from '../../data/userData'
import { linkLabel, parseTicketLink } from '../../lib/ticketLink'
import { GuideCarousel } from './GuideCarousel'
import './info.css'

interface Props {
  festivalId: string
  /** Saved on this device by the user. */
  ticketLink: string | null
  /** From the festival catalog (admin). */
  notices: readonly string[]
  /** Official guide pages (checklist, venue map, …) from the catalog (admin). */
  guides: readonly GuideSet[]
  /** Official channels (Instagram, website) from the catalog (admin). */
  sources: readonly CollectionSource[]
}

const CHANNEL_NAMES: Record<CollectionSource['method'], string> = { 인스타: '인스타그램', 공홈: '공식 홈페이지' }

function TicketLink({ festivalId, ticketLink }: Pick<Props, 'festivalId' | 'ticketLink'>) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(ticketLink ?? '')
  const [error, setError] = useState<string | null>(null)

  const startEditing = () => {
    setDraft(ticketLink ?? '')
    setError(null)
    setEditing(true)
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim() === '') {
      updateData((d) => setTicketLink(d, festivalId, null))
      setEditing(false)
      return
    }
    const link = parseTicketLink(draft)
    if (!link) {
      setError('http:// 나 https:// 로 시작하는 주소를 넣어 주세요.')
      return
    }
    updateData((d) => setTicketLink(d, festivalId, link))
    setEditing(false)
  }

  if (editing) {
    return (
      // noValidate: the browser would reject "nol.yanolja.com/..." before parseTicketLink can add https://
      <form className="ticket-form" onSubmit={save} noValidate>
        <label className="field">
          티켓 링크 (비우고 저장하면 지워져요)
          <input
            type="url"
            inputMode="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://..."
            autoFocus
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="ticket-form__actions">
          <button type="button" className="btn btn--small" onClick={() => setEditing(false)}>
            취소
          </button>
          <button type="submit" className="btn btn--small btn--primary">
            저장
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="ticket-row">
      {ticketLink ? (
        <a className="ticket-row__link" href={ticketLink} target="_blank" rel="noopener noreferrer">
          {linkLabel(ticketLink)}
        </a>
      ) : (
        <span className="ticket-row__empty">예매한 티켓 링크를 넣어 두세요</span>
      )}
      <button type="button" className="ticket-row__edit" aria-label="티켓 링크 수정" onClick={startEditing}>
        <EditIcon />
      </button>
    </div>
  )
}

export function InfoView({ festivalId, ticketLink, notices, guides, sources }: Props) {
  return (
    <div className="info">
      <section className="panel" aria-labelledby="info-ticket">
        <h2 id="info-ticket" className="panel__title">
          티켓
        </h2>
        <TicketLink key={festivalId} festivalId={festivalId} ticketLink={ticketLink} />
      </section>
      {sources.length > 0 && (
        <section className="panel" aria-labelledby="info-channels">
          <h2 id="info-channels" className="panel__title">
            공식 채널
          </h2>
          <ul className="channel-list">
            {sources.map((source) => (
              <li key={`${source.method}-${source.value}`}>
                <span className="channel-list__name">{CHANNEL_NAMES[source.method]}</span>
                <a className="channel-list__link" href={sourceHref(source)} target="_blank" rel="noopener noreferrer">
                  {sourceLabel(source)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="panel" aria-labelledby="info-notices">
        <h2 id="info-notices" className="panel__title">
          주의사항
        </h2>
        {notices.length > 0 ? (
          <ul className="notice-list">
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        ) : (
          <p className="hint">아직 등록된 주의사항이 없어요.</p>
        )}
      </section>
      {guides.map((guide, i) => (
        <GuideCarousel key={`${festivalId}-${guide.title}`} guide={guide} headingId={`info-guide-${i}`} />
      ))}
    </div>
  )
}
