import type { PinKind } from '../../data/schema'

/** The name of each kind of pin (its icon: pinIcons.ts). */
export const PIN_META: Record<PinKind, { label: string }> = {
  stage: { label: '스테이지' },
  food: { label: '먹거리' },
  toilet: { label: '화장실' },
  meet: { label: '만남 장소' },
  etc: { label: '기타' },
  info: { label: '인포메이션' },
  firstaid: { label: '의료부스' },
  wristband: { label: '손목밴드 교환' },
  luggage: { label: '물품보관소' },
  water: { label: '프리워터존' },
  eating: { label: '취식존' },
  shop: { label: '민트샵' },
  slogan: { label: '슬로건 전시' },
  radar: { label: 'RADAR' },
  photo: { label: '포토존' },
  smoking: { label: '흡연구역' },
  sponsor: { label: '스폰서 존' },
  artist: { label: 'Artist & Label' },
  vinyl: { label: 'Vinyl & Accessory' },
}
