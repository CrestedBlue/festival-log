// Layer 2 objects read off the GMF FESTIVAL MAP (official-map pixels, 840×840). Each has the zone whose fit carries it
// to the ground (official-to-m.mjs) and `k`, a size factor (the GMF art draws things smaller than Pentaport's).
// Standing things are anchored at their foot (bottom centre); labels and blankets at their centre.
const line = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / (n - 1), a[1] + ((b[1] - a[1]) * i) / (n - 1)])
const TENT = { fnb: ['#ffc94d', '#ffdd85', '#f0a830'], sponsor: ['#ffc94d', '#ffdd85', '#f0a830'], booth: ['#3dba6a', '#6fd392', '#2a9653'], shop: ['#5bc0e8', '#8fd6f2', '#2f9fcf'], art: ['#f58cc0', '#f9b3d6', '#db6aa4'] }
const BROWN = '#8b5a3c'
export const GROUPS = [
  { id: 'blankets', name: '피크닉 돗자리', items: [[[180, 355], 'check'], [[225, 392], 'dots'], [[305, 392], 'check'], [[355, 325], 'dots'], [[320, 352], 'check']]
    .map(([s, kind]) => ({ kind: 'blanket', s, args: [kind], zone: 'mintBreeze', k: 0.8 })) },
  { id: 'stages', name: '무대', items: [
    { id: 'mintStage', kind: 'stage', s: [270, 236], args: ['mint'], zone: 'mintBreeze', k: 0.7 },
    { id: 'lfgStage', kind: 'stage', s: [607, 250], args: ['lfg'], zone: 'lovingForest', k: 0.7 },
    { id: 'cmsStage', kind: 'stage', s: [560, 634], args: ['cms'], zone: 'clubMidnight', k: 0.7 },
  ] },
  { id: 'tents', name: '텐트·부스', items: [
    ...[[160, 252], [185, 252]].map((s) => ({ kind: 'tent', s, args: [...TENT.fnb, 34], tag: 'F&B', zone: 'mintBreeze', k: 0.8 })),
    ...[[352, 252], [377, 252]].map((s) => ({ kind: 'tent', s, args: [...TENT.sponsor, 34], tag: '스폰서', zone: 'mintBreeze', k: 0.8 })),
    ...[[128, 269], [144, 269], [136, 280], [152, 280]].map((s) => ({ kind: 'table', s, args: ['#3f5fbf'], tag: '취식', zone: 'mintBreeze', k: 0.7 })),
    { kind: 'hut', s: [272, 350], args: ['#2f7a68', '#1f5a4c', '#235b4e'], tag: '포토 부스', zone: 'mintBreeze', k: 0.9 }, // the FOX booth under a photo pin
    { kind: 'hut', s: [355, 416], args: ['#f9b3d6', '#e86f98', '#bb86a0'], tag: '의료부스', zone: 'mintBreeze', k: 0.8 },
    ...line([680, 412], [730, 418], 3).map((s) => ({ kind: 'tent', s, args: [...TENT.fnb, 34], tag: '푸드', zone: 'hungryEast', k: 0.8 })),
    ...[[665, 440], [682, 440], [678, 455], [695, 455], [613, 479], [630, 479], [623, 495], [640, 495]].map((s) => ({ kind: 'table', s, args: ['#3f5fbf'], tag: '취식', zone: 'hungryEast', k: 0.8 })),
    ...line([205, 595], [251, 599], 3).map((s) => ({ kind: 'tent', s, args: [...TENT.shop, 32], tag: '민트샵', zone: 'artZone', k: 0.8 })),
    ...line([218, 642], [241, 644], 2).map((s) => ({ kind: 'tent', s, args: [...TENT.shop, 32], tag: '인포', zone: 'artZone', k: 0.8 })),
    ...line([280, 650], [330, 654], 3).map((s) => ({ kind: 'tent', s, args: [...TENT.art, 32], tag: 'Artist & Label · Vinyl', zone: 'artZone', k: 0.8 })),
    ...line([240, 760], [305, 760], 4).map((s, i) => ({ ...(i === 0 ? { id: 'ticket' } : {}), kind: 'hut', s, args: ['#ffffff', '#5b4a3a', '#bfbfbf'], tag: '티켓 부스', zone: 'ticketBooth', k: 0.8 })),
    { kind: 'shelter', s: [780, 410], tag: '흡연구역', zone: 'hungryEast', k: 0.8 }, // east of the food tents, by the pool
  ] },
  { id: 'gates', name: '게이트', items: [
    { id: 'mainGate', kind: 'arch', s: [268, 470], args: ['MAIN GATE', 'teal'], zone: 'mintBreeze', k: 0.8 },
    { id: 'lfgGate', kind: 'arch', s: [603, 322], args: ['GATE', 'pink'], zone: 'lovingForest', k: 0.7 },
    { kind: 'sign', s: [422, 398], args: ['SUB GATE', '#2aa58e'], zone: 'mintBreeze', k: 0.8 },
    { kind: 'sign', s: [451, 742], args: ['GATE 2-1', '#e04f45'], zone: 'clubMidnight', k: 0.8 },
    { kind: 'sign', s: [450, 607], args: ['GATE 2-2', '#e04f45'], zone: 'clubMidnight', k: 0.8 },
    { kind: 'sign', s: [535, 555], args: ['GATE 2-3', '#e04f45'], zone: 'clubMidnight', k: 0.8 },
  ] },
  { id: 'flags', name: '구역 표지', items: [
    { kind: 'flag', s: [75, 290], args: ['HUNGRY ZONE', BROWN, { pole: 40, textColour: '#ffffff' }], zone: 'mintBreeze', k: 0.8 },
    { kind: 'flag', s: [555, 495], args: ['HUNGRY ZONE', BROWN, { pole: 40, textColour: '#ffffff' }], zone: 'hungryEast', k: 0.8 },
    { kind: 'flag', tag: 'RADAR', s: [626, 462], args: ['RADAR', '#f06a6a', { pole: 30, textColour: '#ffffff' }], zone: 'hungryEast', k: 0.8 },
    { kind: 'flag', s: [131, 640], args: ['ART ZONE', BROWN, { pole: 40, textColour: '#ffffff' }], zone: 'artZone', k: 0.8 },
    { kind: 'flag', s: [214, 588], args: ['Mint Shop', '#3cc0a6', { pole: 34, size: 11, textColour: '#ffffff', left: true }], zone: 'artZone', k: 0.8 },
  ] },
  { id: 'labels', name: '이름표', items: [
    { kind: 'label', of: 'mintStage', s: [211, 147], args: [[['MINT BREEZE', '#1d8a76', 'en'], ['STAGE', '#2b2b3a', 'en']], { shadow: '#7fd1bf' }], zone: 'mintBreeze' },
    { kind: 'label', of: 'lfgStage', s: [606, 160], args: [[['LOVING FOREST', '#d6577f', 'en'], ['GARDEN', '#2b2b3a', 'en']], { shadow: '#f8b9cf' }], zone: 'lovingForest' },
    { kind: 'label', of: 'cmsStage', s: [686, 730], args: [[['CLUB MIDNIGHT', '#d94a3f', 'en'], ['SUNSET', '#2b2b3a', 'en']], { shadow: '#f5a59a' }], zone: 'clubMidnight' },
    { kind: 'label', of: 'ticket', side: 'below', s: [272, 792], args: [[['TICKET BOOTH', '#5b4a3a', 'en']], { size: 11, shadow: '#d9d9b3' }], zone: 'ticketBooth' },
  ] },
]
