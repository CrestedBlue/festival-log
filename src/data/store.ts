import { useSyncExternalStore } from 'react'
import { makeId } from '../lib/id'
import { addFestival } from './actions'
import { createSampleFestival } from './sample'
import { EMPTY_DATA, type AppData, type Festival } from './schema'
import { STORAGE_KEY, loadAppData, saveAppData } from './storage'

export interface Notice {
  id: number
  kind: 'error' | 'info'
  message: string
}

interface StoreState {
  data: AppData
  notice: Notice | null
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) }
}

/** Some browsers (private modes, blocked site data) throw just from touching localStorage. */
function resolveStorage(): { storage: StorageLike; persistent: boolean } {
  try {
    const storage = window.localStorage
    storage.getItem('probe')
    return { storage, persistent: true }
  } catch (error) {
    console.error('[festival-log] localStorage unavailable', error)
    return { storage: memoryStorage(), persistent: false }
  }
}

const resolved = resolveStorage()
let storage = resolved.storage
const persistent = resolved.persistent
let noticeSeq = 0
const makeNotice = (kind: Notice['kind'], message: string): Notice => ({ id: ++noticeSeq, kind, message })

function initialState(): StoreState {
  const loaded = loadAppData(storage)
  if (loaded.status === 'ok') {
    return {
      data: loaded.data,
      notice: persistent ? null : makeNotice('error', '이 브라우저에서는 기록이 저장되지 않아요.'),
    }
  }
  const seeded = addFestival(EMPTY_DATA, createSampleFestival(new Date(), makeId))
  if (loaded.status === 'corrupted' && !loaded.backedUp) {
    // Couldn't copy the unreadable data aside, so don't overwrite it: run this session in memory only.
    storage = memoryStorage()
    return {
      data: seeded,
      notice: makeNotice('error', '저장된 기록을 읽지 못했어요. 원래 데이터를 지키려고 이번에는 저장하지 않고 실행해요.'),
    }
  }
  saveAppData(storage, seeded)
  const notice =
    loaded.status === 'corrupted'
      ? makeNotice('error', '저장된 기록을 읽지 못해서 따로 백업해 두고 샘플로 시작했어요.')
      : makeNotice('info', '샘플 페스티벌을 넣어뒀어요. 관리 탭에서 내 페스티벌을 추가해 보세요.')
  return { data: seeded, notice }
}

let state: StoreState = initialState()
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

// The installed app and a browser tab share storage: pick up the other one's writes instead of clobbering them.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY || event.newValue === null) return
  const loaded = loadAppData(storage)
  if (loaded.status !== 'ok') return
  state = { ...state, data: loaded.data }
  emit()
})
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getSnapshot = () => state

export function updateData(recipe: (data: AppData) => AppData): void {
  const next = recipe(state.data)
  if (next === state.data) return
  const saved = saveAppData(storage, next)
  state = { data: next, notice: saved.ok ? state.notice : makeNotice('error', saved.error) }
  emit()
}

export function showNotice(kind: Notice['kind'], message: string): void {
  state = { ...state, notice: makeNotice(kind, message) }
  emit()
}

export function dismissNotice(): void {
  state = { ...state, notice: null }
  emit()
}

export const useAppState = () => useSyncExternalStore(subscribe, getSnapshot)

export const selectActiveFestival = (data: AppData): Festival | null =>
  data.festivals.find((f) => f.id === data.activeFestivalId) ?? data.festivals[0] ?? null
