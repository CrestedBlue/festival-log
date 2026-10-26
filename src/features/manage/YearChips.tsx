import { ALL_YEARS } from './years'

/** The year chips over a festival list: "전체" first, then each year, newest first. */
export function YearChips({ years, shown, onYear }: { years: readonly string[]; shown: string; onYear: (year: string) => void }) {
  return (
    <div className="chip-row" role="group" aria-label="연도">
      {[ALL_YEARS, ...years].map((year) => (
        <button key={year} type="button" className="chip chip--compact" aria-pressed={year === shown} onClick={() => onYear(year)}>
          {year === ALL_YEARS ? '전체' : year}
        </button>
      ))}
    </div>
  )
}
