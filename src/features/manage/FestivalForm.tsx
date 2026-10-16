import { useState, type FormEvent } from 'react'

export interface FestivalFormValues {
  name: string
  startDate: string
  endDate: string
  venueName: string
}

interface Props {
  initial: FestivalFormValues
  submitLabel: string
  /** Returns an error message to show, or null on success. */
  onSubmit: (values: FestivalFormValues) => string | null
  onCancel?: () => void
}

export function FestivalForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const set = (key: keyof FestivalFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(onSubmit(values))
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field">
        페스티벌 이름
        <input value={values.name} onChange={set('name')} required maxLength={80} placeholder="예: 가을 록 페스티벌 2026" />
      </label>
      <div className="form-grid__row">
        <label className="field">
          시작일
          <input type="date" value={values.startDate} onChange={set('startDate')} required />
        </label>
        <label className="field">
          종료일
          <input type="date" value={values.endDate} onChange={set('endDate')} required />
        </label>
      </div>
      <label className="field">
        장소 이름
        <input value={values.venueName} onChange={set('venueName')} maxLength={80} placeholder="예: 난지한강공원" />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
