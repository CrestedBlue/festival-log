import { useState, type FormEvent } from 'react'
import { USER_PIN_KINDS, type PinKind } from '../../data/schema'
import { PIN_META } from './pinMeta'

interface Props {
  onSave: (name: string, kind: PinKind) => void
  onCancel: () => void
}

export function PinForm({ onSave, onCancel }: Props) {
  const [kind, setKind] = useState<PinKind>('meet')
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave(trimmed || PIN_META[kind].label, kind)
  }

  return (
    <form className="pin-form" onSubmit={submit}>
      <h2 className="map-panel__title">여기에 핀 꽂기</h2>
      <div className="chip-row" role="group" aria-label="핀 종류">
        {USER_PIN_KINDS.map((k) => (
          <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {PIN_META[k].emoji} {PIN_META[k].label}
          </button>
        ))}
      </div>
      <label className="field">
        이름 (비우면 종류 이름으로 저장)
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="예: 우리 돗자리, 2번 게이트" />
      </label>
      <div className="pin-form__actions">
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn--accent">
          저장
        </button>
      </div>
    </form>
  )
}
