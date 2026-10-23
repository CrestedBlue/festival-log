// Layer 2 objects read off the official site map, in official-map pixels.
// Standing things are anchored at their foot (bottom centre); labels, blankets and the LUSH booth at their centre.
const line = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / (n - 1), a[1] + ((b[1] - a[1]) * i) / (n - 1)])
// [base, light, dark] per material (style B: tones of one hue, no outlines)
const TENT = { fnb: ['#ff8a3d', '#ffb066', '#e8662a'], bar: ['#ffc94d', '#ffdd85', '#f0a830'], vendor: ['#4c6fd6', '#7a93e6', '#3553b0'], dreamer: ['#f58cc0', '#f9b3d6', '#db6aa4'], promo: ['#ffc94d', '#ffdd85', '#e9a020'], medical: ['#3dba6a', '#6fd392', '#2a9653'], police: ['#3e4fa8', '#6577c4', '#2b3984'], fire: ['#ef5350', '#f48280', '#cc3a3a'], artistMd: ['#9b5de5', '#b98af0', '#7a3fc4'] }
const BOX = { security: ['#3f6ea3', '#5c8bc0', '#2f5885'], lockers: ['#f5b731', '#ffd466', '#d99a1c'] }
export const GROUPS = [
  { id: 'routes', name: '입장 동선', items: [
    { kind: 'route', colour: '#e8455a', pts: [[1013, 768], [1007, 800], [985, 832], [930, 834], [870, 824], [830, 846], [800, 872], [778, 898], [770, 930], [772, 955], [795, 975], [806, 995], [790, 1018], [760, 1035], [728, 1030], [708, 1006], [702, 978]] },
    { kind: 'route', colour: '#2f6fe8', pts: [[345, 390], [334, 418], [323, 450]] },
  ] },
  { id: 'blankets', name: '피크닉 돗자리', items: [
    [[420, 595], 'check'], [[445, 617], 'dots'], [[520, 597], 'dots'], [[600, 433], 'check'], [[640, 438], 'check'],
    [[737, 570], 'check'], [[892, 573], 'dots'], [[908, 601], 'check'], [[474, 947], 'check'], [[463, 964], 'dots'],
  ].map(([s, k]) => ({ kind: 'blanket', s, args: [k] })) },
  { id: 'stages', name: '무대', items: [
    { id: 'monsterStage', kind: 'stage', s: [452, 400], args: ['monster'] }, { id: 'kbStage', kind: 'stage', s: [830, 372], args: ['kb'] }, { id: 'stanleyStage', kind: 'stage', s: [270, 685], args: ['stanley'] },
    { id: 'lush', kind: 'lush', s: [612, 262] },
  ] },
  { id: 'domes', name: '쿨존 돔', items: [
    { kind: 'dome', s: [262, 470], args: [54] }, { kind: 'dome', s: [997, 612], args: [46] }, { kind: 'dome', s: [918, 742], args: [34] }, { kind: 'dome', s: [955, 748], args: [34] },
    { kind: 'dome', s: [631, 386], args: [30] }, { kind: 'dome', s: [675, 830], args: [84, '#30b7ec'] }, { kind: 'pool', s: [156, 680], args: [52] },
  ] },
  { id: 'tents', name: '텐트·부스', items: [
    ...[[362, 692], [365, 717], [372, 742], [380, 767], [392, 792], [405, 812], [420, 832], [440, 850], [465, 864], [492, 868], [520, 872], [548, 872], [575, 868], [600, 862]].map((s) => ({ kind: 'tent', s, args: TENT.fnb, tag: 'F&B' })),
    ...[[360, 670], [518, 690], [590, 617], [995, 550], [683, 690], [711, 704], [893, 722]].map((s) => ({ kind: 'tent', s, args: TENT.bar, tag: '주류·라운지' })),
    ...line([217, 488], [174, 568], 5).map((s) => ({ kind: 'tent', s, args: [...TENT.vendor, 38], tag: '벤더' })),
    ...[[367, 424], [357, 442], [350, 459], [345, 477]].map((s) => ({ kind: 'tent', s, args: [...TENT.dreamer, 34], tag: '펜타 드리머' })),
    { kind: 'tent', s: [342, 520], args: [...TENT.promo, 36], tag: '홍보 부스' },
    ...[[194, 622], [971, 397], [998, 744], [673, 386]].map((s) => ({ kind: 'tent', s, args: [...TENT.medical, 38], tag: '의료' })),
    { kind: 'tent', s: [1000, 655], args: [...TENT.police, 40], tag: '경찰' }, { kind: 'tent', s: [998, 697], args: [...TENT.fire, 40], tag: '소방' },
    ...[[592, 1072], [635, 1057], [674, 1045]].map((s) => ({ kind: 'stripedTent', s, tag: '공식MD' })),
    ...[[362, 1030], [387, 1050], [412, 1070], [442, 1087]].map((s) => ({ kind: 'tent', s, args: [...TENT.artistMd, 40], tag: '아티스트MD' })),
    ...[[92, 825], [131, 808], [167, 822], [125, 844], [169, 839], [197, 850], [167, 861]].map((s) => ({ kind: 'campTent', s, tag: '리프레시 텐트' })),
    { id: 'lounge', kind: 'lounge', s: [802, 715] }, { id: 'monsterBooth', kind: 'monsterBooth', s: [641, 750] },
    ...[[500, 752], [475, 788], [520, 808]].map((s) => ({ kind: 'umbrellaTable', s })),
  ] },
  { id: 'facilities', name: '시설', items: [
    ...[[560, 340], [703, 337], [977, 440], [982, 468], [225, 905]].map((s) => ({ kind: 'toiletPair', s })),
    ...[[548, 386], [990, 512]].map((s) => ({ kind: 'accessibleToilet', s })),
    ...[...line([552, 724], [575, 796], 5), [577, 927], [592, 919], [607, 912]].map((s) => ({ kind: 'kiosk', s })),
    ...line([752, 888], [848, 836], 6).map((s) => ({ kind: 'container', s, args: BOX.security, tag: '물품검색' })),
    ...line([818, 918], [918, 846], 6).map((s) => ({ kind: 'container', s, args: BOX.lockers, tag: '물품보관' })),
    { kind: 'tower', s: [457, 520] }, { kind: 'tower', s: [827, 512] },
    { kind: 'washStation', s: [735, 790] }, { kind: 'charging', s: [588, 386] }, { kind: 'hut', s: [660, 336] },
    { kind: 'table', s: [580, 706], args: ['#e8455a'] }, { kind: 'table', s: [557, 655], args: ['#bdbdbd'] },
    { kind: 'shelter', s: [85, 730] }, { kind: 'shelter', s: [612, 1110] }, { kind: 'building', s: [717, 958] },
  ] },
  { id: 'gates', name: '게이트', items: [
    { id: 'gate2', kind: 'arch', s: [352, 398], args: ['GATE 2'] }, { id: 'gate1', kind: 'arch', s: [762, 1037], args: ['GATE 1'] }, { kind: 'arch', s: [527, 940], args: ['GATE'] },
  ] },
  { id: 'flags', name: '구역 깃발', items: [
    { kind: 'flag', s: [615, 500], args: ['피크닉존', '#ffd23f', { pole: 108 }] }, { kind: 'flag', s: [472, 655], args: ['피크닉존', '#ffd23f', { pole: 98 }] },
    { kind: 'flag', s: [800, 602], args: ['피크닉존', '#ffd23f', { pole: 52 }] }, { kind: 'flag', s: [423, 975], args: ['피크닉존', '#ffd23f', { pole: 70 }] },
    { kind: 'flag', s: [438, 790], args: ['F&amp;B', '#ffd23f', { pole: 70 }] }, { kind: 'flag', s: [130, 660], args: ['키즈존', '#ffd23f', { pole: 35 }] },
    { kind: 'flag', s: [52, 805], args: ['리프레시존', '#ffd23f', { pole: 63 }] },
    { kind: 'flag', s: [580, 1015], args: ['공식MD', '#f7b6c6', { pole: 73 }] }, { kind: 'flag', s: [470, 1087], args: ['아티스트MD', '#d3b0ee', { pole: 72 }] },
  ] },
  { id: 'labels', name: '이름표', items: [
    { kind: 'label', of: 'monsterStage', s: [415, 246], args: [[['MONSTER', '#4f9a1f', 'en'], ['STAGE', '#2b2b2b', 'en']]] },
    { kind: 'label', of: 'kbStage', s: [955, 224], args: [[['KB국민카드', '#6f6450', 'kr'], ['STAGE', '#2b2b2b', 'en']]] },
    { kind: 'label', of: 'stanleyStage', s: [277, 702], args: [[['STANLEY', '#2b2b2b', 'en'], ['STAGE', '#2b2b2b', 'en']]] },
    { kind: 'label', of: 'lounge', s: [801, 630], args: [[['KB국민카드', '#6f6450', 'kr'], ['LOUNGE', '#2b2b2b', 'en']]] },
    { kind: 'label', of: 'monsterBooth', s: [643, 708], args: [[['MONSTER ENERGY', '#4f9a1f', 'en']], { size: 10 }] },
    { kind: 'label', of: 'lush', s: [613, 292], args: [[['LUSH', '#2b2b2b', 'en']], { size: 12, shadow: '#c9d63a' }] },
    { kind: 'label', of: 'gate1', s: [857, 1035], args: [[['제1 입장동선', '#2b2b2b', 'kr']], { size: 14, shadow: '#e8455a' }] },
    { kind: 'label', of: 'gate2', s: [260, 361], args: [[['제2 입장동선', '#2b2b2b', 'kr']], { size: 14, shadow: '#2f6fe8' }] },
  ] },
]
