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

/** The year chip that lists every year together ("전체"). */
export const ALL_YEARS = 'all'

export interface ShownYear {
  /** A year, or ALL_YEARS. */
  year: string
  /** The years to choose from, newest first. */
  years: string[]
  festivals: Festival[]
}

/** What a festival list shows for a year chip: the year asked for, else the viewed festival's year, else the newest. */
export function inShownYear(festivals: readonly Festival[], requested: string | null, activeYear: string | undefined): ShownYear {
  const groups = groupByYear(festivals)
  const years = groups.map((g) => g.year)
  if (requested === ALL_YEARS) return { year: ALL_YEARS, years, festivals: [...festivals] }
  const year = [requested, activeYear].find((y) => y && years.includes(y)) ?? years[0] ?? ''
  return { year, years, festivals: groups.find((g) => g.year === year)?.festivals ?? [] }
}
