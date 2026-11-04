// The Busan Rock map (lib/venue-map.mjs). The 2026 layout is only in the official app; its notice "공식 어플리케이션
// 안내" (2026) shows the app's map: 행사장 A — SAMROCK, WAVE and GREEN with their standing zones, the field grid, the
// food lounges, the main gate — the HIDDEN stage on an oval track, and 행사장 B with RIVER. Drawn with south up: its
// plaza, the diamond of paths beside it and the oval track are 삼락생태공원's (the satellite), turned half round. So
// each place of the drawing (px of the app screen in that image, `app`) is carried onto the ground by that half turn
// about the plaza, 0.85 m a pixel (fitted on the plaza, the track and the field grid's width; places within ~20 m).
//   node scripts/map/layers/busanrock/map.mjs   → map-src/busanrock/layers/out/, src/assets/maps/busanrock/, src/assets/maps/busanrock.json
import { frame, bigFrame } from './frame.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { buildVenueMap } from '../lib/venue-map.mjs'

const PLAZA_PX = [300, 685], M_PER_PX = 0.85
/** A place of the app's drawing on the ground, [lat, lng]: half a turn about the plaza (the drawing has south up). */
export const app = ([x, y]) => frame.toLL([-(x - PLAZA_PX[0]) * M_PER_PX, (y - PLAZA_PX[1]) * M_PER_PX])
const box = ([x0, y0, x1, y1]) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(app)
// Colours of the app's map: teal-green grounds, white paths, each stage's standing zone in its colour, orange lounges.
await buildVenueMap({ root: ROOT, code: 'busanrock', out: OUT, cache: CACHE, frame, bigFrame,
  venue: { fill: '#7ccab0', path: '#f4f4ee', parts: [
    { ll: [[115, 680], [160, 415], [510, 415], [510, 265], [655, 265], [600, 880], [485, 880], [485, 750], [160, 750]].map(app) }, // 행사장 A
    { ll: box([150, 1050, 360, 1195]) }, // 행사장 B
    { osm: ['415939905'] }, // the track (HIDDEN)
  ] },
  zones: [
    { name: 'track', label: 'HIDDEN', unnamed: true, colour: '#9fd8c4', osm: ['415939905'] },
    { name: 'samrock', label: 'SAMROCK 스탠딩', unnamed: true, colour: '#f7ec7a', solid: true, ll: box([348, 455, 470, 570]) },
    { name: 'green', label: 'GREEN 스탠딩', unnamed: true, colour: '#d6ec6e', solid: true, ll: box([515, 290, 645, 400]) },
    { name: 'wave', label: 'WAVE 스탠딩', unnamed: true, colour: '#a9d3f2', solid: true, ll: box([170, 415, 255, 450]) },
    { name: 'river', label: 'RIVER 스탠딩', unnamed: true, colour: '#f7b6d2', solid: true, ll: box([180, 1060, 270, 1180]) },
    { name: 'lounge1', label: 'FOOD LOUNGE', colour: '#f6b26b', solid: true, ll: box([490, 570, 605, 670]) },
    { name: 'lounge2', label: 'FOOD LOUNGE', colour: '#f6b26b', solid: true, ll: box([490, 695, 600, 875]) },
  ],
  stages: [
    { text: 'SAMROCK', stage: 'samrock', colour: '#c9a100', at: app([410, 430]) },
    { text: 'GREEN', stage: 'green', colour: '#4fae3a', at: app([580, 280]) },
    { text: 'WAVE', stage: 'wave', colour: '#1d9fb0', at: app([213, 400]) },
    { text: 'RIVER', stage: 'river', colour: '#e0679a', at: app([160, 1115]) },
    { text: 'HIDDEN', stage: 'hidden', colour: '#8a6fd6', at: [35.17014, 128.97408] }, // the track
  ],
  stations: [{ key: 'sasang', name: '사상역', near: [1028, -675], radius: 150, lines: [{ text: '2', colour: '#81bf48' }, { text: '경전철', colour: '#8652a1' }] }],
  landmarks: [['르네시떼', ['471714271']], ['이마트', ['471714276']]],
  attribution: '지도: 2026 부산국제록페스티벌 공식 앱 안내 이미지의 행사장 배치를 삼락생태공원 실제 모양에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
