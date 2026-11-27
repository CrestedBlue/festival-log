import { catalogEntry, festivalMapFor } from '../data/catalog'

/**
 * Offline copies of my festivals only (the user, 2026-11-27). The app itself is precached, but each festival's heavy
 * files (map layers and icons, line-up posters) are built into assets/fest/ and left out of it; this keeps the ones of
 * the festivals on my list in the service worker's cache (vite.config.ts serves assets/fest/ from it) and drops the rest.
 */
export const FESTIVAL_CACHE = 'festival-files'

/** The files of these festivals that load over the network (small ones are inlined as data: URLs). */
export function festivalFileUrls(festivalIds: readonly string[]): string[] {
  const urls = festivalIds.flatMap((id) => {
    const map = festivalMapFor(id)
    const lineup = catalogEntry(id)?.lineup ?? []
    return [...(map?.layers.map((layer) => layer.url) ?? []), ...Object.values(map?.icons ?? {}), ...lineup.map((image) => image.src)]
  })
  return [...new Set(urls)].filter((url) => !url.startsWith('data:'))
}

/** Saves my festivals' files that are not saved yet and removes the others'. Offline, what is missing waits for the next call. */
export async function syncFestivalFiles(myFestivalIds: readonly string[]): Promise<void> {
  if (typeof caches === 'undefined') return
  const cache = await caches.open(FESTIVAL_CACHE)
  const wanted = new Set(festivalFileUrls(myFestivalIds).map((url) => new URL(url, location.href).href))
  const saved = (await cache.keys()).map((request) => request.url)
  await Promise.all(saved.filter((url) => !wanted.has(url)).map((url) => cache.delete(url)))
  const missing = [...wanted].filter((url) => !saved.includes(url))
  // one failed file (offline, a deploy in between) must not stop the others
  await Promise.allSettled(missing.map((url) => cache.add(url)))
}
