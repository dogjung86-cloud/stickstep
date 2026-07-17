# g2u6(중2 VI 동물과 에너지) 인계 문서 — 2026-07-17

다른 세션이 이어받기 위한 정본. **먼저 `CLAUDE.md` + `.claude/skills/build-unit/SKILL.md`를 읽고 이 문서를 본다.**

## 1. 현재 상태 한 줄
codex(gpt-5.6-sol xhigh)가 단원 전체를 1차 제작 완료 → **tsc/build 통과, 콘텐츠·과학 정확성 합격**,
그러나 **랩 6종 중 5종이 "버튼 누르면 CSS 클래스 켜지는" 연출이라 불합격** → 페이블이 드래그 조작으로 재작성 중(2/5 완료).

## 2. 완료된 것 (건드리지 말 것 — 품질 검수 통과)
- **인프라 전부**: `curriculum.ts`(G2_UNIT6 등록·soon 제거), `home.ts` `UNIT_THEME g2u6:"body"` + UNIT_DECOR,
  `tokens.css`(`--subj-body #E23B4B` 계열 + `--body-*` 팔레트), `ui.css` 테마 4종, `mapDecor.ts` 소품 5종,
  `registry.ts` 랩 6종 등록, `dsl.ts` 팩토리 6 + hook scene 6 + kickerTone "body", `hook.ts` 디스패치.
- **`src/content/g2/unit6.ts` (752줄)** — 6레슨 콘텐츠. **검수 통과, 재작성 불필요.**
  - 무료 L1~L3 / 프리미엄 L4~L6(`premium: true` 3건)
  - recap 6블록 × 카드 3장 = 18장, more 18/18(380자 미만 0), `fun` 태그 18
  - 훅 6종 전부 choices[0]=정답, good≠bad, 오개념 겨냥 정확
  - 문제: mcq 7·ox 6·multi 6·order 5·binSort 6
  - 언어 규칙: '교과서' 0건
- **`src/ui/bodyKit.ts`(261줄)** — 공용 팔레트·헬퍼. **캔버스 랩에서 이걸 쓴다**:
  `bodyColor(name)` / `safePointerCapture(el, id)` / `drawMaterialToken` / `drawFlowArrow` /
  `drawVesselTube` / `drawValve` / `drawOrganBlob` / SVG용 `bodyDefs`·`bloodTube`·`valveSvg`·`bodyMatterSvg`·`organSilhouette`
- **`src/ui/bodyFigures.ts`(308줄)** — 퀴즈·개념 SVG + `bodyMiniArt`. 검수 통과.
- **`src/lessons/steps/hookBody.ts`(205줄)** — 훅 6장면. 검수 통과.
- **`src/styles/body.css` / `body-hook.css`** — 랩·훅 CSS.
- **`src/lessons/steps/breathModelLab.ts`(119줄)** — **유일하게 codex가 잘 만든 랩.**
  고무막 실제 드래그 → `setState()`가 부피·압력·풍선 크기 계산. keyboard 지원. **이게 품질 기준선.**

## 3. 페이블이 재작성 완료한 랩 (tsc 클린)
- **`circulationLab.ts`(370줄)** — 캔버스. 적혈구 토큰을 경로 폴리라인 위로 **드래그**해 두 순환 완주.
  `nearestT()`로 최근접 t 스냅 + 역주행 무시(`Math.max(prev, t)`), 허파순환 t>0.5에서 암적→선홍,
  온몸순환 t<0.5 선홍→암적. 심장 탭 → 4방 이름 + `drawValve` 판막. 목표 3개(heart/lung/body).
- **`nutrientTestLab.ts`(308줄)** — 캔버스. 시약병 4개를 **드래그**해 시험관 입구에 떨구기.
  다른 시험관에 떨구면 "반응하지 않아요"(시약 특이성 체험). 베네딕트는 `heatBtn` 가열해야 황적색.
  목표 3개(starch/protein/energy).

## 4. 남은 작업 (여기부터 이어서)
### ① 랩 3종 재작성 — 최우선
현재 상태: **`pointerdown` 0건 = 조작 없음**. 전부 "탭 → CSS 클래스" 또는 2지선다 퀴즈.
- **`nephronLab.ts`(85줄)** — 지금은 탭+2지선다 퀴즈(랩이 아님).
  → **재작성 방향**: 물질 알갱이(포도당·아미노산·물·무기염류·요소·혈구·단백질)를 **드래그**.
    · 여과: 토리→보먼주머니로 끌기. **혈구·단백질은 여과막에 막힘**(크기 큼) — 끌면 튕겨나옴.
    · 재흡수: 세뇨관→모세혈관으로 포도당·아미노산·물 되돌리기.
    · 분비: 모세혈관→세뇨관으로 남은 노폐물 보내기.
    · 결론: 정상 오줌엔 포도당·단백질 없음.
- **`bodyIntegrateLab.ts`(129줄)** — 지금은 탭+2지선다 퀴즈.
  → **재작성 방향**: 물질을 기관계로 **끌어다 연결**(배관 잇기). 소화계→순환계→조직세포(영양소),
    호흡계→순환계→조직세포(산소), 조직세포→순환계→호흡계/배설계(CO₂·요소).
  → **⚠ 버그 수정 필수**: `bodyIntegrateLab.ts:45`에 SVG 문자열 안 인라인 `<style>` 태그
    (`.bil-organ text,.bil-heart text{fill:var(--n800)}`)가 있음 — **문서 전역에 새는 셀렉터**라 제거하고
    각 `<text>`에 `fill` 직접 지정으로 바꿀 것.
- **`digestJourneyLab.ts`(132줄)** — 경계선. 영양소 탭 + 기관 탭(순서 판정은 있음).
  → 여유되면 영양소 토큰을 소화관 따라 **드래그**로 승격. 우선순위는 위 둘보다 낮음.

**재작성 규격(circulationLab·nutrientTestLab을 그대로 베낄 것)**:
`host.append(h1 → sub → pn-badges 목표칩 → helper → stage)` / 목표 3개 `collect()` →
`api.recordQuiz(true) + api.enableCTA()` / `createLoop`+`fitCanvas`(DPR 1.75) /
**`safePointerCapture` 필수**(bodyKit) / cleanup에서 loop.stop·리스너·타이머 전부 해제 /
논리좌표 BASE_W=360 + `scale()` 매핑.

### ② 이미지 발주 (준비 완료, 미실행)
- `qa/body_prompts.txt` — 스틱맨 개념 컷 6장(`public/body/cuts`, 스타일 A) + **인체 해부 교육 일러스트 6장**
  (`public/body/figs`, 스타일 B — 사용자 확정 화풍: "교육용 일러스트").
- `qa/order-body.sh` — 순차 3배치 발주 스크립트. **실행: `bash qa/order-body.sh`**
  (⚠ 병렬 codex 금지 — 다른 codex exec 없는지 `CommandLine -match ' exec '`로 확인 후 실행)
- `qa/process-geo.mjs` ASPECT_DIRS에 `public/body/cuts`·`public/body/figs` **등록 완료**.
- 발주 후: `node qa/process-geo.mjs` → **Read 도구로 눈검수**(심장은 심실벽이 더 두꺼운지, 글자 없는지) →
  약한 SVG 도해를 발주본+라벨 오버레이(`glabeled`/`alabeled` 문법)로 교체.
- **결정된 방침**: 해부 구조(소화계·심장·콩팥단위·허파꽈리)는 발주 일러스트가 낫고,
  경로도·화살표·모식도(이중순환·여과 방향·통합)는 라벨이 본질이라 SVG 유지 = **하이브리드**.

### ③ 검증
- `npx tsc --noEmit` — **주의: `src/content/exams/m2u4l1.ts` TS6133 2건은 다른 세션 작업물이니 건드리지 말 것.**
  g2u6 관련 에러만 0이면 통과.
- `npm run build` 통과 확인.
- e2e: `qa/e2e-g2u6.mjs` **미작성** — 만들면 다른 g2 단원 e2e(`qa/e2e-g2u5.mjs`) 문법 복제.
  ⚠ 다른 세션 dev 서버가 이 폴더에서 돌고 있음 → **워크트리 격리 필수**(CLAUDE.md 참조).
- CLAUDE.md에 g2u6 관행 기록(마지막).

## 5. 참고 자산
- 교과서 전문: `qa/g2u6-textbook.txt`(21쪽 pypdf 추출본)
- 최초 제작 브리프: `qa/g2u6-brief.md` — **주의: 이 브리프의 §2 랩 계약이 "목표 3개→CTA"만 적고
  조작 실체를 명세하지 않아 codex가 버튼-리빌 랩을 만든 원인이 됨.** 재사용 시 조작 명세를 반드시 추가.
- codex 실행 로그: `qa/g2u6-codex.log`(356k줄)

## 6. 설계표(확정)
| id | title | 쪽 | 훅 scene | 랩 | premium |
|----|-------|----|------|----|------|
| g2u6l1 | 영양소 | 202~205 | breadonly | nutrientTestLab ✅재작성 | — |
| g2u6l2 | 소화와 소화효소 | 206~211 | chewrice | digestJourneyLab ⚠경계선 | — |
| g2u6l3 | 순환계 | 212~217 | pulse | circulationLab ✅재작성 | — |
| g2u6l4 | 호흡계와 호흡운동 | 220~225 | deepbreath | breathModelLab ✅codex 양호 | true |
| g2u6l5 | 배설계 | 226~229 | peecolor | nephronLab ❌재작성 필요 | true |
| g2u6l6 | 세포호흡과 통합 | 230~231 | afterrun | bodyIntegrateLab ❌재작성 필요 | true |
