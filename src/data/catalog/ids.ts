/**
 * Festival ids are UUIDs. Each festival also has a festival code (the series it belongs to, the same every
 * year) and a yearly code (festival code + year) that prefixes its stage/performance/pin ids.
 */
export const GRAND_MINT_SERIES = 'gmf'
export const GRAND_MINT_2026_ID = 'e3bd21f7-d9b6-4b69-a61a-8210e787c5b9'
/** Also the festival's id in app versions before the catalog. */
export const GRAND_MINT_2026_KEY = `${GRAND_MINT_SERIES}2026`

export const HERO_ROCK_SERIES = 'herorock'
export const HERO_ROCK_2026_ID = 'c108bb49-35c1-4607-ab5f-c52869eb1dfa'
export const HERO_ROCK_2026_KEY = `${HERO_ROCK_SERIES}2026`
