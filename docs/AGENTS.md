# festival — 작업 주의사항

> 이 work 를 작업할 때 에이전트가 반드시 지킬 규칙. 객체의 보편 정보는 wiki 를 링크하고,
> 여기에는 "이 작업에서의 역할·제약"만 적는다.

## 절대 규칙 / 금지
- **문서 정본은 이 `docs/` 한 곳**(저장소 `festival-log/docs`)이다. `~/workspace/ai/work/festival/` 에는 링크만 둔다 — `docs` 심볼릭 링크와 이 파일들을 가리키는 안내 파일. 복사본을 만들지 않는다.
  - 링크 재생성: `ln -s ~/Documents/workspace/festival-log/docs ~/workspace/ai/work/festival/docs`
  - 공개 저장소에 올라간다 — 개인 경로는 `~` 로 쓰고, 이메일·키·회사 정보는 적지 않는다.
- **커밋 작성자는 저장소 로컬 설정 `CrestedBlue <294632025+CrestedBlue@users.noreply.github.com>` 만 쓴다.** 공개 저장소라 전역 설정(회사 메일)으로 커밋하면 회사 메일이 그대로 공개된다. 새로 clone 하면 `git config user.name/user.email` 부터 다시 건다.
- **커밋 메시지는 되도록 한글로 쓴다**(사용자 지시, 2026-10-20). 형식은 `<type>: <설명>` 그대로(type 은 feat, fix, docs 등 영어 유지), 설명과 본문을 한글로. 코드 이름·경로·고유명사는 원래 표기 그대로 둔다.
- **festival-log 폴더 안의 작업은 사용자에게 확인받지 않고 알아서 진행하고, 작업 끝에는 반드시 push 한다**(사용자 지시, 2026-10-16). 스스로 내린 판단은 HISTORY.md 에 남긴다.
- **`main` push = 즉시 운영 배포**(GitHub Actions → Pages). 그래서 push 전 `npm test && npm run build` 를 통과시킨다. 깨지면 고쳐서 통과시킨 뒤 push 하고, 끝내 안 되는 부분은 그 부분만 되돌려서라도 push 한다.
- 공개 저장소다 — 키·토큰·개인정보를 커밋하지 않는다.
- OpenStreetMap 타일을 **일괄 선다운로드(prefetch)하지 않는다**(OSM 타일 이용 정책 위반). 오프라인 지도는 "본 타일만 서비스워커 캐시" 방식만 허용.
- 프리셋 페스티벌 데이터는 **공식 출처만** 쓴다. 추정값(끝 시간 미정 공연, 대략 위치 핀)은 코드 주석·핀 이름에 "(대략)"으로 표시한다.
- Workbox `runtimeCaching.urlPattern` 에 **설정 파일의 변수를 참조하는 함수를 쓰지 않는다** — sw.js 로 직렬화되며 변수가 사라진다. 자급식 정규식만 쓴다.
- **지도 레이어는 절대 합치지 않는다**(사용자 지시, 2026-10-23: "레이어는 평생 합치지 말아주세요"). 그려서 만드는 지도는 레이어 1 바닥(길·잔디·구역), 레이어 2 운영 표시(무대·텐트·게이트·깃발·이름표·동선), 레이어 3 핀을 레이어마다, 방향(공식 안내도 방향·북쪽 위)마다 따로 파일로 둔다. 합친 SVG/PNG 를 결과물로 만들지 않는다. 겹친 그림은 확인용 미리보기로만 쓴다.

## 대상 객체와 이 작업에서의 역할·제약
- GitHub 저장소 `CrestedBlue/festival-log` — wiki: `~/workspace/ai/wiki/github-ssh-key-setup.md` / 이 작업에서: **코드 정본**이자 배포 소스. SSH(`git@github.com:`)로 push 하며 CrestedBlue 키로 인증된다.
- GitHub Pages `https://crestedblue.github.io/festival-log/` — wiki: 없음 / 이 작업에서: 운영 사이트. 친구들이 이 주소로 PWA 를 설치한다. 하위 경로 배포라 빌드 시 `BASE_PATH=/festival-log/` 필요(워크플로가 자동 주입).
- NOL 티켓 상품 페이지 — wiki: 없음 / 이 작업에서: 프리셋 데이터 출처(읽기만). 타임테이블은 상세 이미지에만 있다.

## 핵심 경로 / 접속
- 저장소: https://github.com/CrestedBlue/festival-log
- 배포: https://crestedblue.github.io/festival-log/
- 배포 워크플로: `.github/workflows/deploy.yml` (push to `main` → test → build → deploy-pages)
- 공식 정보 수집 절차(주 1회 예약 작업): [COLLECT.md](COLLECT.md)
- 로컬 작업 사본: `~/Documents/workspace/festival-log` (커밋 작성자 로컬 설정 완료). 다른 컴퓨터에서 새로 clone 하면 작성자 설정부터 다시 건다
- 프리셋: `src/data/presets/` (GMF 2026 = `grandMint2026.ts`)
- 지도 이미지 생성: `node scripts/map/build-gmf.mjs` — 입력 `map-src/gmf/`(공식 지도 크롭·OSM 추출), 출력 `src/assets/maps/gmf.{webp,json}`. 지도·장소·지도 핀은 연도가 아니라 페스티벌 코드(`gmf`) 단위다(`src/data/catalog/series/`).
- 펜타포트 지도: `node scripts/map/build-pentaport.mjs` — 공식 입장 동선 안내 그림(`map-src/pentaport/official-entrance-map.jpg`)을 그대로 쓰되, 실제 위치(OSM)와 맞는 기준점(역, 야구장, 푸르지오, 한라, KB 스테이지=대공연장)을 정확히 지나도록 thin-plate spline(`scripts/map/tps.mjs`)으로 펴서 `src/assets/maps/pentaport.{webp,json}` 을 만든다. 그림 위 장소(스테이지, 게이트, 티켓부스, 셔틀)는 같은 변환으로 좌표가 되어 핀이 된다. OSM 원본은 `node scripts/map/extract-osm.mjs <받은.osm> map-src/<코드>/osm.json` 으로 만든다
- **레이어 지도(공식 행사장 안내도를 실제 좌표로 다시 그리기)**: 절차는 [MAP.md](MAP.md) — 새 지도도 이 절차로 만든다. 펜타포트: `node scripts/map/layers/pentaport/build.mjs --preview` → `map-src/pentaport/layers/out/`(레이어 1 바닥 · 2 운영 표시 · 3 핀, 공식 방향·북쪽 위 각각). 앱 지도 탭에는 아직 연결하지 않았다
- 공식 안내 이미지(체크리스트, 행사장 안내도)는 `src/assets/guides/guide-*.webp` 로 넣고 카탈로그의 `guides` 에 등록한다. 용량이 커서 설치 때 미리 받지 않고(서비스워커 globIgnores) 처음 볼 때 캐시한다 **지도 그림은 이 스크립트로만 바꾼다**(webp 를 직접 고치지 않는다). 지형 출처 OSM 은 ODbL 이라 지도에 출처 표기를 유지한다
- 제목 오른쪽 그림(페스티벌 디자인 테마): `src/assets/art/<코드>.*`. GMF·펜타포트는 손으로 쓴 SVG, 히어로 락·JUMF 는 공식 로고 이미지로 만드는 스크립트(`node scripts/art/build-<코드>.mjs`, 원본은 `art-src/<코드>/` 또는 저장소 안 포스터). 그림을 바꿀 때는 스크립트를 고쳐 다시 만든다
- 화면 확인: Claude 앱 미리보기 서버는 `~/Documents` 를 못 읽는다 → 로컬 사본에서 `npm run build` 후 `dist/` 를 세션 폴더로 복사해 미리보기
