import type { PinKind } from '../../data/schema'

export const PIN_META: Record<PinKind, { emoji: string; label: string }> = {
  stage: { emoji: '🎤', label: '스테이지' },
  food: { emoji: '🍜', label: '먹거리' },
  toilet: { emoji: '🚻', label: '화장실' },
  meet: { emoji: '🙌', label: '만남 장소' },
  etc: { emoji: '📍', label: '기타' },
}
