# festival — 공식 안내도를 레이어 지도로 다시 그리기

> 펜타포트 2026 행사장 안내도로 만든 방법이다(2026-10-22~23, 사용자와 함께 정함). **새 페스티벌 지도도 이 순서로 만든다.**
> 작업 규칙(커밋 작성자, 한글 커밋, push 전 검증)은 [AGENTS.md](AGENTS.md) 를 따른다.
> 스크립트: `scripts/map/layers/pentaport/` · 입력과 결과: `map-src/pentaport/layers/` · 중간 파일·위성 타일: `node_modules/.cache/festival-map/pentaport/`(git 밖)

## 정한 것 (사용자 결정)

- **레이어 3개, 절대 합치지 않는다.** 레이어 1 바닥(길·잔디·구역), 레이어 2 운영 표시(무대·텐트·게이트·깃발·이름표·동선), 레이어 3 핀. 레이어마다, 방향(공식 안내도 방향 / 북쪽 위)마다 파일을 따로 둔다. 겹친 그림은 확인용 미리보기로만 쓴다.
- **레이어 1 = 실제 모양 + 공식 색.** 길과 구역 경계는 실제 길(OSM)과 위성 사진을 따르고, 색은 공식 안내도의 구역 색을 단색으로 쓴다. 공식 안내도의 찌그러진 모양은 따르지 않는다.
- **레이어 2 = 스타일 B(플랫 일러스트).** 외곽선 없음, 같은 색 계열의 밝음·기본·어두움으로만 면을 나눔, 모서리 2–5 px 둥글게, 바닥에 옅은 그림자. (시안 A 2.5D 입체, C 픽토그램 배지와 비교해 B 를 골랐다 — `kb-variants.mjs`)
- **레이어 3 = 공식 핀 모양.** 흰 원 + 얇은 회색 테두리 + 아래 검은 그림자, 아이콘은 Tabler(MIT)를 공식 색으로.
- 결과는 **SVG(벡터)**. 디자인 도구에서 고칠 수 있게 구역·종류마다 한글 이름의 그룹으로 나눈다.
- **북쪽 위 판**은 물체를 똑바로 세우고 이름표·핀을 다시 배치한다. 임의 각도로 돌리기는 TODO(지도 탭).

## 0. 자료

| 자료 | 어디서 | 저장 |
|---|---|---|
| 공식 행사장 안내도 | 인스타·공홈 MAP 글 ([COLLECT.md](COLLECT.md)) | `map-src/<코드>/layers/official-site-map.jpg` (원본 그대로) |
| 실제 길·잔디·건물 | OpenStreetMap — `node scripts/map/extract-osm.mjs <받은.osm> map-src/<코드>/osm.json` | `map-src/<코드>/osm.json` |
| 위성 사진 | Esri World Imagery 타일(z18) — `frame.mjs` 의 `satellite()` 가 받는다 | **캐시에만.** 재배포가 안 되니 커밋하지 않는다. 확인용으로만 쓴다 |
| 핀 아이콘 | Tabler Icons(MIT) | 쓰는 것만 `map-src/icons/tabler/` 에 복사(LICENSE 포함) |

## 1. 공식 안내도 분석 — 원래 지도를 어떻게 가공했나

1. 공식 안내도와 위성·OSM 에 둘 다 보이는 것(무대 건물, 원형 잔디, 주차장, 화장실 건물, 숲 …)을 10곳 넘게 짝짓는다. 
   - 도구: `read-official-grid.mjs`(공식 안내도를 20 px 격자 2배 타일로), `read-osm-ways.mjs`(위성 위에 OSM 길 번호와 50 m 격자).
   - 짝은 `map-src/<코드>/layers/control-points.json` 에 `{ name, s: [공식 x, y], m: [동 m, 북 m] }` 로 적는다.
2. **닮음 변환(회전 + 축척 + 이동)만** 맞추고 오차를 본다: `node scripts/map/layers/pentaport/check-fit.mjs`.
   - 펜타포트: 0.45 m/px, −179.5°(남쪽이 위), 평균 오차 16.6 m. 공식 안내도는 실제 공원을 거의 축척대로 따라 그린 **평면도**이고, 물체만 정면 입체로 세운 것이었다.
   - 휘는 변환(thin-plate spline)은 레이어에 쓰지 않는다. 기준점 밖에서 크게 휘어 가장자리 핀이 40 m 밀렸다.
3. `official-frame.mjs --check` 로 공식 안내도를 위성 위에 겹쳐(55 %) 어긋난 곳을 본다. 공식 안내도가 **좁게 그린 구간**을 여기서 찾는다(펜타포트: 아티스트MD 쪽 실제 길이 그림보다 약 50 m 서쪽).

## 2. 레이어 1 — 바닥 (`layer1.mjs`)

1. **칸 나누기**: OSM 길 중심선, 원형 잔디 테두리, 무대 건물로 화면을 칸(face)으로 나눈다(`faces.mjs`).
2. **칸마다 구역 하나**: 칸 안의 점 하나(`SEEDS`)로 구역을 통째로 정한다. 공식 안내도 색을 픽셀마다 읽어 칠하면 얼룩·꼬리·자투리가 생긴다(첫 버전의 실패).
3. **나눌 칸만 선 하나로** (`SPLITS`): 공식 안내도의 경계를 따라 점을 찍고, 양 끝은 길에 닿을 때까지 자동으로 늘린다. 테두리와 길 사이에 가는 고리가 있으면(원형 잔디) `cross` 로 고리까지 넘겨 끊는다.
4. **축제 산책로** (`WALKWAYS`): 공식 안내도에는 있고 OSM 에는 없는 길. 공식 픽셀로 찍어 같은 변환으로 옮기고, 폭 5 m 로 그린다. 앞에 놓인 산책로에 닿으면 멈추므로, 세로 기둥 2개 → 가로대 순서로 두면 H 모양이 된다.
5. 1,000 m² 보다 작은 자투리 칸은 포장면(회색)으로 둔다.
6. **행사장 바깥선**: 구역이 정해진 칸 + 공원 밖까지 나간 공식 실루엣(리프레시존)을 6 m 넓혀 매끈하게. 안쪽 8 m 는 회색 띠.
7. **길은 한 도형**: 5 m 안에서 끊긴 길 끝을 옆 길에 붙이고, 길·바깥 띠·포장면을 합친 뒤 닫기(1.5 m)·열기(0.8 m)로 교차로의 홈과 갈고리를 없앤다.
8. **벡터로**: 구역 마스크를 1.5 px 흐리게 한 뒤 0.5 높이에서 윤곽을 딴다(d3-contour) — 이웃 구역이 같은 경계를 나눠 가져 틈이 없다. Douglas–Peucker 0.2 m 로 줄이고 centripetal Catmull–Rom 베지어로 곡선을 만든다(`vector.mjs`). 행사장 바탕은 회색이라 세 구역이 만나는 점의 아주 작은 틈도 길처럼 보인다.
9. 색(공식 안내도에서 뽑음): 길 `#c8c8ca`, 잔디 `#74bc6c`, 스탠딩 `#048444`, 피크닉 `#04a49c`, KB 스탠딩 `#4f68a8`, F&B `#c4b49c`, 아스팔트 `#545458`, 리프레시 `#319fd7`, 숲 `#4e8a5c`.
- 확인: `DEBUG_FACES=1 DEBUG_CROP=x,y,w,h node …/layer1.mjs` → 캐시 `debug-faces.png`(칸, seed, 분할선·산책로).

## 3. 레이어 3 — 핀 (레이어 2보다 먼저 해도 된다)

1. `pins-detect.mjs`: 흰 원(지름 30–60 px, 둘레가 거의 한 바퀴 흰색이 아님)을 찾아 번호를 매긴다 → 캐시 `candidates.jpg` 를 눈으로 본다.
2. `pins-classify.mjs`: 범례 배지를 **지도 핀 크기로 줄여**(범례 50 px, 지도 39 px) 정규화 상관으로 비교해 종류를 정한다. 흰색이 아닌 핀(초록·파랑)은 색으로 찾아 더한다. 캐시 `pins-official.jpg` 로 전부 눈으로 확인한 뒤 `pins-official.json` 을 커밋한다.
3. `pins-place.mjs`: 닮음 변환만 쓴다(공식 방향에서는 핀이 원래 픽셀 그대로). 주변 색으로 핀을 옮기는 방법은 텐트·길 색에 속아서 버렸다.
4. `layer3.mjs`: 배지와 아이콘을 그리고 앱용 좌표(`layer3-pins.json`)를 쓴다. 아이콘은 진한 테두리 위에 공식 색 선을 겹쳐 노랑처럼 옅은 색도 보이게 한다.

## 4. 레이어 2 — 운영 표시 (`objects.mjs` + `sprites.mjs` + `layer2.mjs`)

1. **위치**: 격자 타일을 보며 공식 픽셀로 `objects.mjs` 에 적는다. 서 있는 것은 발(아래 가운데), 이름표·돗자리·LUSH 는 가운데. 줄지어 선 것은 `line(a, b, n)`. 이름표는 가리키는 물체를 `of` 로 단다.
2. **그림**: `sprites.mjs` 의 부품(텐트, 돔, 컨테이너, 화장실, 키오스크, 무대, 아치, 깃발, 이름표 …)을 스타일 B 규칙으로 그린다. 재질마다 `[기본, 밝음, 어두움]` 3단 색.
3. 이름표 글자 폭은 **실제로 그려서 잰다**(librsvg 는 `textLength` 를 무시한다).
4. 브랜드 로고는 옮기지 않고 글자로 쓴다. 관객·불꽃·나무 같은 장식은 넣지 않는다.
5. 디자인을 고칠 때는 같은 물체를 여러 방향으로 그려 지도에 끼워 비교한다(`kb-variants.mjs` 의 A/B/C).

## 5. 북쪽 위 판 (`layout-north-up.mjs`)

- **물체**: 그림의 시각 중심을 실제 좌표로 옮겨 똑바로 세운다(발을 기준으로 하면 남쪽 위 안내도와 반대로 매달린다).
- **이름표**: 위 → (무대면 무대 윗면) → 아래 → 옆 순서로, 다른 물체를 가리지 않는 자리를 먼저 쓴다. 안 되면 핀을 놓은 뒤 핀·이름표만 피하는 가장 가까운 자리.
- **핀**: 같은 종류의 가장 가까운 레이어 2 물체(시설)에 연결해, 공식 안내도와 같은 화면 방향에 둔다. 겹치면 둘레의 빈자리, 다 막히면 덜 겹치는 자리. 게이트·메인쿨존 핀을 먼저 놓는다.
- 앱용 핀 좌표는 핀이 아니라 **시설의 위치**다.

## 6. 실행

```
node scripts/map/layers/pentaport/build.mjs --preview
```

| 순서 | 스크립트 | 결과 |
|---|---|---|
| 1 | `official-frame.mjs` | 캐시: 공식 안내도를 실제 틀에 놓은 그림, 실루엣 |
| 2 | `layer1.mjs` | `out/layer1-ground-{official-view,north-up}.svg`, `out/north-up-bounds.json` |
| 3 | `pins-place.mjs` | 캐시: 핀 좌표 |
| 4 | `layout-north-up.mjs` | 캐시: 북쪽 위 이름표·핀 자리 |
| 5 | `layer2.mjs` | `out/layer2-operations-{official-view,north-up}.svg` |
| 6 | `layer3.mjs` | `out/layer3-pins-{official-view,north-up}.svg`, `out/layer3-pins.json` |
| (확인) | `preview.mjs` | 캐시: `preview-vs-official.jpg`, `preview-official-view@2x.png`, `preview-north-up.jpg` |

- 공식 방향 SVG 는 1080×1350(공식 안내도와 같은 틀)이라 공식 안내도 위에 그대로 겹쳐 볼 수 있다. 북쪽 위 SVG 는 1 단위 = 1 m, 위경도 범위는 `north-up-bounds.json`.
- 그림을 바꿀 때는 SVG 를 직접 고치지 않고 스크립트를 고쳐 다시 만든다.

## 7. 확인

- `preview-vs-official.jpg` 로 공식 안내도와 나란히, `preview-official-view@2x.png` 로 크게(경계·교차로), `preview-north-up.jpg` 로 북쪽 위를 본다.
- 숫자: `check-fit.mjs` 의 평균 오차, `layer1.mjs` 가 찍는 구역별 면적, `layout-north-up.mjs` 가 찍는 "자리를 옮긴 핀".

## 8. 새 페스티벌에 쓸 때

1. `scripts/map/layers/pentaport/` 를 `scripts/map/layers/<코드>/` 로, `map-src/pentaport/layers/` 를 `map-src/<코드>/layers/` 로 복사한다.
2. 바꿀 것:
   - `paths.mjs` (코드), `frame.mjs` (기준 위경도 `LAT0/LNG0`, 그릴 범위 `BOX`, 위성 범위)
   - `control-points.json` (1단계)
   - `layer1.mjs` 의 `SEEDS`·`SPLITS`·`WALKWAYS`·손으로 딴 다각형(예: `KB_TURF`)
   - `pins-classify.mjs` 의 범례 번호, `layout-north-up.mjs` 의 `MARKS`(핀 종류 ↔ 물체 종류)
   - `objects.mjs` (물체 목록), 그 페스티벌만의 그림(무대 등)은 `sprites.mjs`
3. 그대로 쓰는 것: `vector.mjs`, `faces.mjs` 의 칸 나누기, `official-to-m.mjs`, `geometry.mjs`, 레이어 2·3 빌더, 확인 도구.
4. **사람이 정하는 것**(사용자 확인): 기준점, 구역 나누기(분할선·산책로), 디자인 방향. 고른 이유는 HISTORY.md 에 남긴다.

## 9. 겪은 함정

- sharp 는 `resize` 를 `composite` 보다 먼저 적용한다 → 합친 결과를 버퍼로 받은 뒤 줄인다.
- sharp `raw()` 의 채널 수는 `info.channels` 로 확인한다(3이 아닐 수 있다).
- SVG 속성 안의 `&` 는 `&amp;`. 한 요소에 같은 속성(`stroke`)을 두 번 쓰면 SVG 가 열리지 않는다.
- 다듬기·흐리기 단계가 칸 밖 픽셀까지 칠할 수 있다 → 행사장 안 픽셀만 다룬다.
- 위성 사진의 높은 건물 지붕은 기울어져 보인다(대공연장 약 10 m). 바닥 위치는 OSM 건물을 기준으로 한다.
- 공식 안내도가 좁게 그린 구간은 실제 길까지 늘려 잇는다(산책로 `reach`).
