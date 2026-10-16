import { useRef, type ChangeEvent } from 'react'
import { hasIdCollision, importFestival } from '../../data/actions'
import type { AppData, Festival } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { festivalFileName, parseFestivalFile, serializeFestival } from '../../data/transfer'

// Safari can cancel the download if the URL is revoked in the same tick as the click.
const REVOKE_DELAY_MS = 1000

function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}

async function shareOrDownload(file: File, title: string) {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('[festival-log] share failed, falling back to download', error)
    }
  }
  downloadFile(file)
}

export function ShareSection({ data, festival }: { data: AppData; festival: Festival | null }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const exportFestival = () => {
    if (!festival) return
    const file = new File([serializeFestival(festival)], festivalFileName(festival), { type: 'application/json' })
    void shareOrDownload(file, festival.name)
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    let text: string
    try {
      text = await file.text()
    } catch (error) {
      console.error('[festival-log] failed to read import file', error)
      showNotice('error', '파일을 읽지 못했어요.')
      return
    }
    const result = parseFestivalFile(text)
    if (!result.ok) {
      showNotice('error', result.error)
      return
    }
    if (hasIdCollision(data, result.festival)) {
      showNotice('error', '이미 가져온 다른 페스티벌과 공연 정보가 겹쳐서 가져올 수 없어요.')
      return
    }
    const existing = data.festivals.find((f) => f.id === result.festival.id)
    if (existing && !window.confirm(`'${existing.name}'를 받은 파일 내용으로 바꿀까요? (내 찜 목록은 유지돼요)`)) return
    updateData((d) => importFestival(d, result.festival))
    showNotice('info', `'${result.festival.name}'를 가져왔어요.`)
  }

  return (
    <div className="form-grid">
      <p className="hint">
        타임테이블·핀을 파일로 보내면 친구도 똑같이 가져올 수 있어요. 찜 목록은 각자 따로 저장돼요.
      </p>
      <div className="form-actions form-actions--start">
        {festival && (
          <button type="button" className="btn btn--primary" onClick={exportFestival}>
            파일로 보내기
          </button>
        )}
        <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
          받은 파일 가져오기
        </button>
        <input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={onFile} />
      </div>
    </div>
  )
}
