/**
 * Turns an OpenStreetMap XML download into the compact JSON the map scripts read (map-src/<code>/osm.json).
 *
 *   curl -o area.osm "https://api.openstreetmap.org/api/0.6/map?bbox=<west>,<south>,<east>,<north>"
 *   node scripts/map/extract-osm.mjs area.osm map-src/<code>/osm.json
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

export function extractOsm(xml) {
  const nodes = new Map()
  const subwayEntrances = []
  for (const [, head, body = ''] of xml.matchAll(/<node\b([^>]*?)(?:\/>|>([\s\S]*?)<\/node>)/g)) {
    const id = attr(head, 'id')
    const lat = Number(attr(head, 'lat'))
    const lng = Number(attr(head, 'lon'))
    nodes.set(id, [lat, lng])
    const tags = tagsOf(body)
    if (tags.railway === 'subway_entrance') subwayEntrances.push({ lat, lng, ref: tags.ref ?? '' })
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
  return { ways, relations, subwayEntrances }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [input, output] = process.argv.slice(2)
  if (!input || !output) throw new Error('usage: node scripts/map/extract-osm.mjs <in.osm> <out.json>')
  const today = new Date().toISOString().slice(0, 10)
  const data = extractOsm(fs.readFileSync(input, 'utf8'))
  const source = `© OpenStreetMap contributors (ODbL), downloaded ${today} via api.openstreetmap.org`
  fs.writeFileSync(output, `${JSON.stringify({ source, ...data })}\n`)
  console.log(`${data.ways.length} ways, ${data.relations.length} relations, ${data.subwayEntrances.length} subway entrances →`, output)
}
