import type { Festival } from '../data/schema'
import { addFestival } from '../features/manage/addFestival'
import { PlusIcon } from './icons'

/**
 * A festival opened from the catalog but not on my list: one bar above the tabs, the same on every tab, that adds it
 * (the user, 2026-11-27: "둘러보는중 >> 내 페스티벌에 추가").
 */
export function AddFestivalBar({ festival }: { festival: Festival }) {
  return (
    <button type="button" className="add-festival-bar" onClick={() => addFestival(festival)}>
      <PlusIcon />
      내 페스티벌에 추가
    </button>
  )
}
