import type { CollectionSource } from './types'

/** Where a festival's official channel lives on the web. */
export const sourceHref = ({ method, value }: CollectionSource): string =>
  method === '인스타' ? `https://www.instagram.com/${value.replace(/^@/, '')}/` : value

/** How the channel is shown: the @handle, or the site without its scheme and www. */
export const sourceLabel = ({ method, value }: CollectionSource): string =>
  method === '인스타' ? value : value.replace(/^https?:\/\/(www\.)?/, '')
