import { importFestival } from '../../data/actions'
import { PRESETS, type FestivalPreset } from '../../data/presets'
import type { AppData } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'

export function PresetSection({ data }: { data: AppData }) {
  const load = (preset: FestivalPreset, exists: boolean) => {
    const message = `'${preset.label}'를 앱에 들어있는 최신 정보로 다시 불러올까요? 직접 추가하거나 고친 공연·핀은 사라지고, 찜은 유지돼요.`
    if (exists && !window.confirm(message)) return
    updateData((d) => importFestival(d, preset.create()))
    showNotice('info', `'${preset.label}'를 불러왔어요.`)
  }

  return (
    <div className="form-grid">
      <p className="hint">타임테이블과 행사장 핀이 미리 들어있는 페스티벌이에요.</p>
      <ul className="stage-list">
        {PRESETS.map((preset) => {
          const exists = data.festivals.some((f) => f.id === preset.id)
          return (
            <li key={preset.id} style={{ borderLeftColor: 'var(--color-accent)' }}>
              <span className="stage-list__name">{preset.label}</span>
              <button type="button" className="btn btn--small" onClick={() => load(preset, exists)}>
                {exists ? '다시 불러오기' : '추가'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
