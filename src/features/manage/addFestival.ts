import type { Festival } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { markSeen } from '../../data/updates'
import { addMyFestival } from '../../data/userData'

/** Puts a festival on my list and opens it (the browse list's + and the add bar of a festival opened to look at). */
export function addFestival(festival: Festival): void {
  updateData((d) => markSeen(addMyFestival(d, festival.id), festival.id))
  showNotice('info', `'${festival.name}'를 추가했어요.`)
}
