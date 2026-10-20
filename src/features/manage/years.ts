import type { Festival } from '../../data/schema'

export interface YearGroup {
  year: string
  festivals: Festival[]
}

/** Festivals by the year they start, newest year first; earliest festival first within a year. */
export function groupByYear(festivals: readonly Festival[]): YearGroup[] {
  const byYear = new Map<string, Festival[]>()
  for (const festival of festivals) {
    const year = festival.startDate.slice(0, 4)
    byYear.set(year, [...(byYear.get(year) ?? []), festival])
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, list]) => ({ year, festivals: [...list].sort((a, b) => a.startDate.localeCompare(b.startDate)) }))
}
