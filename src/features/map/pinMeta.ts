import type { PinKind } from '../../data/schema'

export const PIN_META: Record<PinKind, { emoji: string; label: string }> = {
  stage: { emoji: '🎤', label: '스테이지' },
  food: { emoji: '🍜', label: '먹거리' },
  toilet: { emoji: '🚻', label: '화장실' },
  meet: { emoji: '🙌', label: '만남 장소' },
  etc: { emoji: '📍', label: '기타' },
  info: { emoji: 'ℹ️', label: '인포메이션' },
  firstaid: { emoji: '⛑️', label: '의료부스' },
  wristband: { emoji: '🎟️', label: '손목밴드 교환' },
  luggage: { emoji: '🧳', label: '물품보관소' },
  water: { emoji: '💧', label: '프리워터존' },
  eating: { emoji: '🍽️', label: '취식존' },
  shop: { emoji: '👕', label: '민트샵' },
  slogan: { emoji: '⭐', label: '슬로건 전시' },
  radar: { emoji: '📻', label: 'RADAR' },
  photo: { emoji: '📷', label: '포토존' },
  smoking: { emoji: '🚬', label: '흡연구역' },
  sponsor: { emoji: '🎁', label: '스폰서 존' },
  artist: { emoji: '🎵', label: 'Artist & Label' },
  vinyl: { emoji: '💿', label: 'Vinyl & Accessory' },
}
