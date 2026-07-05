# 스틱스텝 사이언스 (StickStep Science)

Brilliant처럼 개념을 만지며 배우고, 토스처럼 매끄러운 터치감으로, Duolingo처럼 꾸준히 —
중학교 1학년 과학을 교과서 순서 그대로 정복하는 모바일 웹 학습 앱.

- **스택**: Vite + TypeScript, 프레임워크 없는 바닐라 웹 표준 (Capacitor 포장 대비)
- **학습 공식**: 스틱맨 도입(hook·만화) → 핵심 랩(캔버스 시뮬) → 카드 정리(recap, 펼치면 심화·상식) → 다양한 형식의 문제
- **게임 요소**: 정복 지도(순차 잠금), XP·스트릭, 단원 보너스 미니게임
- **아트**: 손그림 스틱맨 래스터(만화 컷·아바타·소품)는 `qa/*_prompts.txt` 프롬프트로 발주, 없으면 SVG 폴백

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입체크 + 프로덕션 번들 (dist/)
```

모바일 뷰 기준으로 만들어졌어요. 데스크톱에서는 가운데 기기 프레임으로 보여요.

## 지금까지 담긴 것 (중1 · 2022 개정 교육과정)

- **대단원 I. 과학과 인류의 지속가능한 삶** — 6개 레슨
  과학적 탐구 방법(스틱맨 쌤 만화 · 변인 통제 · 자료 해석 그래프), 과학과 인류 문명,
  첨단 과학기술(플립 카드), 지속가능한 삶, 대단원 마무리.
- **대단원 II. 생물의 구성과 다양성** — 6개 레슨
  세포(구조 라벨링), 세포 관찰 실험(현미경 시뮬레이터), 생물의 구성 단계,
  생물다양성(변이·자연선택 시뮬레이터), 생물의 분류(5계 검색표·생물 분류함), 보전.
- **대단원 III. 열** — 5개 레슨 + 보너스 미니게임
  온도와 입자 운동(입자 시뮬), 열평형(칸막이 제거·실시간 그래프), 열의 이동(캠핑 만화 ·
  전도 레이스 · 대류 배치 실험 · 복사 가림판), 비열(물vs식용유 가열·냉각 레이스),
  열팽창(막대 팽창 · 바이메탈 예측), **단열 디펜스**(전도·대류·복사 방어 게임, XP 도전).

## 구조

설계 헌법은 [CLAUDE.md](CLAUDE.md), 레슨 저작 기준은 [LESSON_GUIDE.md](LESSON_GUIDE.md) 참고.
핵심 원칙: **레슨은 코드가 아니라 데이터.** `src/content/`에 단원을 데이터로 얹어요.

```
src/
  core/      dom · icons · haptics · store(진행도/XP) · router · anim
  lessons/   types · player(레슨 구동) · registry · steps/(스텝 렌더러들)
  ui/        blocks · figures · thermo · heatFigures · avatar · canvas
  content/   dsl(저작 팩토리) · curriculum · unit1 · unit2 · unit3
  screens/   splash · onboarding · home(정복 지도) · done · minigame
```
