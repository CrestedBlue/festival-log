/** Which slide of a side-scrolling strip is in view: the one covering most of it. */
export function slideIndexAt(scrollLeft: number, slideWidth: number, count: number): number {
  if (slideWidth <= 0 || count <= 0) return 0
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / slideWidth)))
}
