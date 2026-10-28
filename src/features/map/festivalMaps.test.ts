import { describe, expect, test } from 'vitest'
import { CDF_SERIES, GRAND_MINT_SERIES, HERO_ROCK_SERIES, JUMF_SERIES, PENTAPORT_SERIES, WONDERLIVET_SERIES } from '../../data/catalog/ids'
import { isInsideBounds } from '../../lib/geo'
import { parseMapMeta, seriesMapFor, withImages } from './festivalMaps'

describe('parseMapMeta', () => {
  const valid = {
    attribution: 'test',
    bounds: [
      [37.5, 127.1],
      [37.6, 127.2],
    ],
    initialView: [
      [37.52, 127.12],
      [37.58, 127.18],
    ],
  }

  test('accepts well-formed metadata', () => {
    expect(parseMapMeta(valid).bounds).toEqual([
      [37.5, 127.1],
      [37.6, 127.2],
    ])
  })

  test('rejects bounds whose south-west is not below the north-east', () => {
    expect(() => parseMapMeta({ ...valid, bounds: [[37.6, 127.2], [37.5, 127.1]] })).toThrow()
  })

  test('reads official marks', () => {
    const meta = parseMapMeta({ ...valid, marks: [{ id: 1, kind: 'toilet', zone: 'Mint Breeze', lat: 37.55, lng: 127.15 }] })
    expect(meta.marks).toEqual([{ id: 1, kind: 'toilet', zone: 'Mint Breeze', lat: 37.55, lng: 127.15 }])
  })

  test('rejects marks outside the image or without a kind', () => {
    expect(() => parseMapMeta({ ...valid, marks: [{ id: 1, kind: 'toilet', zone: 'x', lat: 36, lng: 127 }] })).toThrow()
    expect(() => parseMapMeta({ ...valid, marks: [{ id: 2, zone: 'x', lat: 37.55, lng: 127.15 }] })).toThrow()
  })

  test('reads the colour around the image, ignoring anything that is not a hex colour', () => {
    expect(parseMapMeta({ ...valid, background: '#ffffff' }).background).toBe('#ffffff')
    expect(parseMapMeta({ ...valid, background: 'url(x)' }).background).toBeNull()
    expect(parseMapMeta(valid).background).toBeNull()
  })

  test('reads where the map draws a mark, its icons and the names it writes', () => {
    const meta = parseMapMeta({
      ...valid,
      layers: [{ file: 'ground.svg', bounds: valid.bounds }],
      icons: { station: 'icons/station.svg' },
      labels: [{ text: '역', kind: 'station', icon: 'station', minZoom: 14, lat: 37.55, lng: 127.15, colour: '#123456' }],
      marks: [{ id: 1, kind: 'toilet', zone: '', lat: 37.55, lng: 127.15, spot: { lat: 37.551, lng: 127.151 } }],
    })
    expect(meta.marks[0]?.spot).toEqual({ lat: 37.551, lng: 127.151 })
    expect(meta.labels).toEqual([{ text: '역', kind: 'station', icon: 'station', minZoom: 14, lat: 37.55, lng: 127.15, colour: '#123456' }])
    expect(withImages(meta, { 'ground.svg': '/g.svg', 'icons/station.svg': '/s.svg' }).icons).toEqual({ station: '/s.svg' })
  })

  test('rejects a mark spot or a label outside the map, a label of no known kind or with an unknown icon', () => {
    const label = { text: '역', kind: 'station', minZoom: 14, lat: 37.55, lng: 127.15 }
    expect(() => parseMapMeta({ ...valid, marks: [{ id: 1, kind: 'toilet', zone: '', lat: 37.55, lng: 127.15, spot: { lat: 36, lng: 127 } }] })).toThrow()
    expect(() => parseMapMeta({ ...valid, labels: [{ ...label, lat: 36 }] })).toThrow()
    expect(() => parseMapMeta({ ...valid, labels: [{ ...label, kind: 'castle' }] })).toThrow()
    expect(() => parseMapMeta({ ...valid, labels: [{ ...label, icon: 'missing' }] })).toThrow()
    expect(() => parseMapMeta({ ...valid, labels: [{ ...label, badges: [{ text: '인천1', colour: 'blue' }] }] })).toThrow()
    const lines = [{ text: '5', colour: '#996cac' }, { text: '9', colour: '#bdb092' }]
    expect(parseMapMeta({ ...valid, labels: [{ ...label, badges: lines }] }).labels[0]).toMatchObject({ badges: lines })
  })
})

describe('withImages', () => {
  const meta = parseMapMeta({
    bounds: [
      [37.5, 127.1],
      [37.6, 127.2],
    ],
    initialView: [
      [37.52, 127.12],
      [37.58, 127.18],
    ],
    layers: [
      { file: 'ground.svg', bounds: [[37.5, 127.1], [37.6, 127.2]] },
      { file: 'pins.svg', bounds: [[37.52, 127.12], [37.58, 127.18]] },
    ],
  })

  test('gives each listed layer its own image, bottom first', () => {
    const map = withImages(meta, { 'ground.svg': '/g.svg', 'pins.svg': '/p.svg' })
    expect(map.layers.map((l) => l.url)).toEqual(['/g.svg', '/p.svg'])
    expect(map.layers[1]?.bounds).toEqual([
      [37.52, 127.12],
      [37.58, 127.18],
    ])
  })

  test('fails when a listed layer is not bundled', () => {
    expect(() => withImages(meta, { 'ground.svg': '/g.svg' })).toThrow()
  })

  test('rejects a layer reaching outside the map', () => {
    expect(() => parseMapMeta({ bounds: [[37.5, 127.1], [37.6, 127.2]], initialView: [[37.52, 127.12], [37.58, 127.18]], layers: [{ file: 'x.svg', bounds: [[37.4, 127.1], [37.6, 127.2]] }] })).toThrow()
  })
})

describe('seriesMapFor', () => {
  test('returns nothing for festivals without a map', () => {
    expect(seriesMapFor(JUMF_SERIES)).toBeNull()
  })

  // festivals with no venue map yet: the big area map alone, with the venue and the stations as the map's own icons
  test.each([
    [HERO_ROCK_SERIES, ['인천대입구역', '센트럴파크역', '지식정보단지역']],
    [WONDERLIVET_SERIES, ['킨텍스역', '대화역']],
    [CDF_SERIES, ['킨텍스역', '대화역']],
  ])('returns the big area map of %s with its venue and stations', (series, stations) => {
    const map = seriesMapFor(series)
    expect(map?.layers).toHaveLength(1)
    const kinds = map?.marks.map((m) => m.kind) ?? []
    expect(kinds.filter((k) => !k.startsWith('exit-'))).toEqual(['venue', ...stations.map(() => expect.stringMatching(/^station-/))])
    // the stations' numbered exits, each with the key of its station
    const exits = map?.marks.filter((m) => m.kind.startsWith('exit-')) ?? []
    expect(exits.length).toBeGreaterThan(stations.length)
    expect(new Set(exits.map((m) => `station-${m.zone}`))).toEqual(new Set(kinds.filter((k) => k.startsWith('station-'))))
    for (const mark of map?.marks ?? []) expect(map?.icons[mark.kind], mark.kind).toBeTruthy()
    expect(map?.labels.filter((l) => l.kind === 'station').map((l) => l.text)).toEqual(stations)
    expect(map?.labels.filter((l) => l.kind === 'building').length).toBeGreaterThan(2)
    const venue = map?.marks[0]
    expect(venue && map && isInsideBounds(venue, map.initialView)).toBe(true)
  })

  test('gives the two KINTEX festivals one area map, each naming its own festival', () => {
    expect(seriesMapFor(CDF_SERIES)?.layers).toEqual(seriesMapFor(WONDERLIVET_SERIES)?.layers)
    expect(seriesMapFor(WONDERLIVET_SERIES)?.attribution).toContain('원더리벳')
    expect(seriesMapFor(CDF_SERIES)?.attribution).toContain('카운트다운 판타지')
    expect(seriesMapFor(CDF_SERIES)?.attribution).not.toContain('원더리벳')
  })

  // big map's layer 1, small map's layers 1 and 2 (layer 3's pins are drawn by the app as icons, inside the venue);
  // opens on the small map (the venue), the big map is there to zoom out to
  const expectLayered = (series: string) => {
    const map = seriesMapFor(series)
    expect(map?.layers).toHaveLength(3)
    for (const layer of map?.layers ?? []) expect(layer.url).toBeTruthy()
    const venue = map?.layers[1]?.bounds
    expect(map?.marks.length).toBeGreaterThan(0)
    for (const mark of map?.marks ?? []) expect(venue && isInsideBounds(mark.spot ?? mark, venue), `mark ${mark.id}`).toBe(true)
    for (const mark of map?.marks ?? []) expect(map?.icons[mark.kind], `icon for ${mark.kind}`).toBeTruthy()
    expect(map?.initialView).toEqual(venue)
    return map
  }

  test('returns the layered Grand Mint map, with the stations it is walked to from', () => {
    const map = expectLayered(GRAND_MINT_SERIES)
    const stations = map?.labels.filter((l) => l.kind === 'station')
    expect(stations?.map((l) => l.text)).toEqual(['몽촌토성역', '한성백제역', '올림픽공원역', '송파나루역'])
    expect(stations?.[2]?.badges?.map((b) => b.text)).toEqual(['5', '9'])
    expect(map?.labels.filter((l) => l.kind === 'stage').map((l) => l.text)).toEqual(['MINT BREEZE STAGE', 'LOVING FOREST GARDEN', 'CLUB MIDNIGHT SUNSET'])
    expect(map?.labels.filter((l) => l.kind === 'bus' && l.icon === 'bus').length).toBeGreaterThan(0)
  })

  test('returns the layered Pentaport map: the big ground under the venue layers, with its places inside it', () => {
    const map = expectLayered(PENTAPORT_SERIES)
    expect(map?.labels.map((l) => l.text)).toEqual(expect.arrayContaining(['송도달빛축제공원역', '송도 랜드마크 푸르지오시티', '송도 한라웨스턴파크', '송도 씨워크인테라스 한라']))
    // city bus stops from OpenStreetMap, with a bus icon
    expect(map?.labels.filter((l) => l.kind === 'bus' && l.icon === 'bus').length).toBeGreaterThan(0)
  })
})
