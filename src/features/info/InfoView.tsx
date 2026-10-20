import { useState, type FormEvent } from 'react'
import { EditIcon } from '../../components/icons'
import { updateData } from '../../data/store'
import { setTicketLink } from '../../data/userData'
import { linkLabel, parseTicketLink } from '../../lib/ticketLink'
import './info.css'

interface Props {
  festivalId: string
  /** Saved on this device by the user. */
  ticketLink: string | null
  /** From the festival catalog (admin). */
  notices: readonly string[]
}

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

export function InfoView({ festivalId, ticketLink, notices }: Props) {
  return (
    <div className="info">
      <section className="panel" aria-labelledby="info-ticket">
        <h2 id="info-ticket" className="panel__title">
          티켓
        </h2>
        <TicketLink key={festivalId} festivalId={festivalId} ticketLink={ticketLink} />
      </section>
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
    </div>
  )
}
