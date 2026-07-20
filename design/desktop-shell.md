# 데스크톱 셸 — 방향 확정 기록 & 인수인계 (2026-07-20)

다른 계정·다른 세션에서 이어서 작업하기 위한 핸드오프 문서(tutor-monetization.md 문법).
읽는 순서: 이 문서 → design/desktop-variants.html(시안 목업 5종, 브라우저로 열면 렌더) → styles/desktop.css.

## 배경과 결정

- 문제: 브라우저 가로 화면이 넓어도 앱이 모바일 크기로 나온다 — base.css의 **의도된 기기 프레임**
  (≥520px에서 402px 폰 목업, 라운드+그림자) 때문. 사용자가 데스크톱 전용 레이아웃을 요청.
- 시안 5종 비교 후 **B. 대시보드 3칼럼형 확정**(사용자, 2026-07-20):
  - A 집중 칼럼형 — 사이드바 + 중앙 660px. ✅ **이미 구현 완료**(아래 "현재 상태"). B의 1단계.
  - **B 대시보드 3칼럼형 — 확정.** A + 홈 우측 위젯 레일(스트릭·보유 스텝·오답 대기·이어서 학습).
    빈 여백이 "복귀 동선"으로 바뀌는 게 핵심(Duolingo 데스크톱 완성형 문법).
  - C 상단 GNB형 — 기각: 모바일(하단 탭)과 내비 구조가 갈라져 두 벌 유지 부담 + 레슨 리스트가
    지도 트레일 서사와 중복.
  - D 투페인 레슨형(왼쪽 무대 고정 + 오른쪽 설명·CTA, 브릴리언트 문법) — 기각 아님,
    **랩 스텝 한정 후속 후보**. 스텝 렌더러 전체가 세로 흐름 전제라 전면 적용은 공수 최대이고,
    퀴즈·recap 같은 텍스트 스텝은 칼럼이 오히려 낫다.
  - E 폰 프레임 + 컴패니언 위젯 — 기각: 공수 최소지만 "가로 화면인데 모바일 크기" 인상을 해소 못 함.

## 현재 상태 = B의 1단계(시안 A) 구현 완료 + **옵트인 전환(2026-07-20 사용자 확정)**

- **옵트인**: 자동 반응형(≥1024px 즉시 적용)은 폐기 — 웹 접속 시 메인 디자인이 저절로 바뀌는 것을
  원치 않음(사용자). 기본은 넓은 화면에서도 폰 프레임, `store.desktopMode`(기기 설정, 동기화 제외) →
  **`html.dt` 클래스**(main.ts 부트 부착 + 마이 탭 토글이 갱신)로만 켜진다. desktop.css 전 규칙이
  `html.dt` + ≥1024px 이중 게이트. 토글 UI = 마이 탭 "넓은 화면 레이아웃" 행(≥1024px 뷰포트에서만
  노출, monitor 아이콘·값 켜짐/꺼짐·스낵 피드백). **이후 데스크톱 규칙(위젯 레일 포함)은 반드시
  html.dt 아래에 쓴다.** QA로 셸을 보려면 localStorage 시드에 `desktopMode: true`를 넣거나
  `document.documentElement.classList.add("dt")`.
- **파일**: `src/styles/desktop.css`(단일 시트, `html.dt` 게이트 + `@media (min-width: 1024px)`) +
  `src/main.ts` import·클래스 부착 + `core/store.ts` desktopMode + `screens/my.ts` 토글 행 +
  `core/icons.ts` monitor. 콘텐츠·스텝 렌더러 코드 무수정.
- 내용:
  - 기기 프레임 해제(풀블리드) / gnav → 좌측 사이드바 224px(`::before`로 워드마크 — DOM 무수정 트릭)
  - 홈(#sc-home)·탭 화면(.tabscr): `padding-left: 224px` + 내부 중앙 칼럼 660~680px
  - 풀스크린 화면(레슨·시험·페이월·오답노트 등 사이드바 없는 집중 모드): lheader/obhead/scroll/footer
    중앙 칼럼 760px + **`.stepWrap` 660px 캡**(제목·무대·슬라이더·보기가 한 축에 정렬)
  - CTA `display: block` + 520px 캡, 바텀 시트·스낵은 중앙 플로팅 카드화
- 검증: 1440×900 실캡처(홈·도전 탭·레슨 hook→heatParticles 랩→recap→퀴즈) 눈검수 통과.
  **모바일(<1024px)·e2e(뷰포트 420px = 브레이크포인트 아래)·Capacitor 포장 완전 불변.**

## 우측 위젯 레일(B 완성) — **구현 완료(2026-07-20)**

- 레이아웃(홈 #sc-home에만): 사이드바 224 | 중앙 지도 칼럼(660 캡 센터링) | 우측 레일 300 고정
  (`position: fixed; right: 24px`, `#sc-home { padding-right: 348px }`). 1024~1279px 애매 구간은
  레일 숨김(`@media (min-width: 1280px)`에서만 표시) — 그 구간은 시안 A로 동작.
- 위젯 4종(시안 vB 목업 그대로, home.ts `.home-rail`/`.hr-*`):
  1. **연속 학습** — `currentStreak()` + 최근 7일 도트(오른쪽 끝 = 오늘). 학습일 판정은 스트릭 정의
     역산([lastStudyDay−(streak−1), lastStudyDay] 창) — 별도 기록 없이 정확, 지어낸 데이터 0.
  2. **보유 스텝·장화** — totalXp(파랑 강조)·lifeXp 누적·`bootLevel()`+`bootArt` 글리프.
  3. **오답노트 대기** — `wrongNoteCount().open` + 단원별 상위 2 브레이크다운(findLesson으로 lessonId→
     단원 집계), 버튼 → main.ts `openNotebook` 게이트(프리미엄 페이월 포함, nav2.onOpenNotebook).
  4. **이어서 학습** — 현재 단원 첫 `isUnlocked && !isDone` 레슨(프리미엄이면 라벨 병기, openLesson
     게이트가 페이월 안내). **renderMap()이 단원·학년 전환마다 `updateRailNext()`로 갱신** —
     comingSoon 조기 return보다 앞이라 준비 중 단원도 카드가 산다.
- 구현 형태 = **desktopMode 분기 렌더**(제안 ②의 옵트인판): `getState().desktopMode`일 때만 레일
  DOM을 만든다 — 모바일·e2e(420px)는 DOM이 아예 없어 셀렉터 계약이 구조적으로 안전하고, 옵트인
  토글은 마이 탭에서만 바뀌므로 홈은 항상 새로 그려져 리스너 정리 불요.
- ~~"폰 화면으로 보기" 수동 토글~~ → **역방향으로 이행 완료(2026-07-20)**: 데스크톱 셸 자체가
  옵트인 토글이 됐다(기본 = 폰 프레임, 위 "현재 상태" 참조). 남은 후보: 랩 스텝 한정 D식 투페인,
  게임·시험·rotateStage 가로 랩의 데스크톱 폭 개별 검수.

## 함정 기록(이번 구현에서 실제로 밟은 것)

- **`.btn`은 button 기본 display(inline-block)** — `max-width` + `margin: auto`로 중앙 정렬이 안 된다.
  `display: block` 명시가 필요(desktop.css CTA 규칙에 반영 완료). 다른 버튼 캡 추가 시 동일 주의.
- **무대(.stage)만 폭을 캡하면 실패** — 아래 슬라이더·조작부·보기와 축이 어긋난다(1차 시도 실사고).
  `.stepWrap` 통칼럼 캡이 정답(무대·컨트롤이 같은 폭을 공유).
- QA 스크립트에서 `addInitScript`로 시딩하면 **reload마다 시드가 패치를 덮어쓴다** —
  "키가 없을 때만 시딩" 가드를 넣을 것(검토 모드 토글 후 reload 시나리오에서 실사고).
- 홈 지도는 %-좌표 규칙(serpentine) 덕에 칼럼 확장에 안전 — 별도 보정 불필요를 실캡처로 확인.
