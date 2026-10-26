/**
 * Turns an OpenStreetMap XML download into the compact JSON the map scripts read (map-src/<code>/osm.json).
 *
 *   curl -o area.osm "https://api.openstreetmap.org/api/0.6/map?bbox=<west>,<south>,<east>,<north>"
 *   node scripts/map/extract-osm.mjs area.osm map-src/<code>/osm.json [--only=busStops | --add] [--via=<host>]
 *
 * --only=<key> updates just that part (ways, relations, subwayEntrances, busStops) of an existing JSON and keeps the
 * rest as it is — to add something from a fresh download without moving the shapes the maps were drawn from.
 * --add adds what the existing JSON does not have yet (ways and relations by id, entrances and stops by place) and
 * keeps everything it has as it is — to widen the area without moving what was drawn already.
 * --via names where it was downloaded from (default api.openstreetmap.org; a big area comes from overpass-api.de,
 * since the API's map call stops at 50 000 nodes).
 *
 * Keeps only the tags the map scripts use. The data is © OpenStreetMap contributors (ODbL): keep the credit.
 */
import fs from 'node:fs'

const KEEP_TAGS = new Set(['highway', 'building', 'name', 'leisure', 'amenity', 'landuse', 'natural', 'railway', 'water', 'waterway', 'place', 'ref', 'bridge', 'layer'])

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

function tagsOf(body) {
  const tags = {}
  for (const [, k, v] of body.matchAll(/<tag k="([^"]*)" v="([^"]*)"\s*\/>/g)) tags[unescape(k)] = unescape(v)
  return tags
}

const keep = (tags) => Object.fromEntries(Object.entries(tags).filter(([k]) => KEEP_TAGS.has(k)))

const isBusStop = (tags) => tags.highway === 'bus_stop' || (tags.public_transport === 'platform' && tags.bus === 'yes')

export function extractOsm(xml) {
  const nodes = new Map()
  const subwayEntrances = []
  const busStops = []
  for (const [, head, body = ''] of xml.matchAll(/<node\b([^>]*?)(?:\/>|>([\s\S]*?)<\/node>)/g)) {
    const id = attr(head, 'id')
    const lat = Number(attr(head, 'lat'))
    const lng = Number(attr(head, 'lon'))
    nodes.set(id, [lat, lng])
    const tags = tagsOf(body)
    if (tags.railway === 'subway_entrance') subwayEntrances.push({ lat, lng, ref: tags.ref ?? '' })
    if (isBusStop(tags)) busStops.push({ lat, lng, name: tags.name ?? '', ref: tags.local_ref ?? tags.ref ?? '' })
  }
  const ways = []
  for (const [, head, body] of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const pts = [...body.matchAll(/<nd ref="(\d+)"\s*\/>/g)].map(([, ref]) => nodes.get(ref)).filter(Boolean)
    if (pts.length < 2) continue
    ways.push({ id: attr(head, 'id'), tags: keep(tagsOf(body)), pts })
  }
  const relations = []
  for (const [, head, body] of xml.matchAll(/<relation\b([^>]*)>([\s\S]*?)<\/relation>/g)) {
    const tags = tagsOf(body)
    if (tags.type !== 'multipolygon' && !tags.leisure) continue
    const members = [...body.matchAll(/<member type="way" ref="(\d+)" role="([^"]*)"\s*\/>/g)]
    relations.push({
      id: attr(head, 'id'),
      tags: keep(tags),
      outer: members.filter(([, , role]) => role !== 'inner').map(([, ref]) => ref),
      inner: members.filter(([, , role]) => role === 'inner').map(([, ref]) => ref),
    })
  }
  return { ways, relations, subwayEntrances, busStops }
}

/** existing + what `fresh` has that it lacks (ways and relations by id, entrances and stops by place); existing items unchanged. */
export function addOsm(existing, fresh) {
  const newById = (key) => {
    const have = new Set((existing[key] ?? []).map((x) => x.id))
    return [...(existing[key] ?? []), ...fresh[key].filter((x) => !have.has(x.id))]
  }
  const newByPlace = (key) => {
    const at = (x) => `${x.lat.toFixed(6)},${x.lng.toFixed(6)}`
    const have = new Set((existing[key] ?? []).map(at))
    return [...(existing[key] ?? []), ...fresh[key].filter((x) => !have.has(at(x)))]
  }
  return { ...existing, ways: newById('ways'), relations: newById('relations'), subwayEntrances: newByPlace('subwayEntrances'), busStops: newByPlace('busStops') }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2)
  const option = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
  const only = option('only')
  const via = option('via') ?? 'api.openstreetmap.org'
  if (!input || !output) throw new Error('usage: node scripts/map/extract-osm.mjs <in.osm> <out.json> [--only=<key> | --add] [--via=<host>]')
  const today = new Date().toISOString().slice(0, 10)
  const data = extractOsm(fs.readFileSync(input, 'utf8'))
  if (process.argv.includes('--add')) {
    const existing = JSON.parse(fs.readFileSync(output, 'utf8'))
    const merged = addOsm(existing, data)
    const source = `${existing.source}; more area added ${today} via ${via}`
    fs.writeFileSync(output, `${JSON.stringify({ ...merged, source })}\n`)
    const added = (key) => merged[key].length - (existing[key] ?? []).length
    console.log(`added ${added('ways')} ways, ${added('relations')} relations, ${added('subwayEntrances')} subway entrances, ${added('busStops')} bus stops →`, output)
  } else if (only) {
    if (!(only in data)) throw new Error(`--only: no part called ${only}`)
    const existing = JSON.parse(fs.readFileSync(output, 'utf8'))
    const source = `${existing.source}; ${only} downloaded ${today}`
    fs.writeFileSync(output, `${JSON.stringify({ ...existing, source, [only]: data[only] })}\n`)
    console.log(`${data[only].length} ${only} →`, output)
  } else {
    const source = `© OpenStreetMap contributors (ODbL), downloaded ${today} via ${via}`
    fs.writeFileSync(output, `${JSON.stringify({ source, ...data })}\n`)
    console.log(`${data.ways.length} ways, ${data.relations.length} relations, ${data.subwayEntrances.length} subway entrances, ${data.busStops.length} bus stops →`, output)
  }
}
