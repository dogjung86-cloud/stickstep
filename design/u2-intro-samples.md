# 중1 Ⅱ 도입(훅) 다시 만들기 샘플 (2026-11-11, 사용자 판정 대기)

레슨 맨 앞의 도입 상호작용을 새 형식으로 만든 샘플 세 개다. 정본이 아니다. 병행 토글 뒤에서만 보인다.
판정 자료(실측 표, 기준, 비교 그림, 정할 것)는 저장소 밖 `D:\Brilliant Science\output\intro-redesign\README.md`가 정본이다.

## 보는 방법

- 샘플로 열기: `http://localhost:<포트>/?u2intro=u2l4`(긴 세포), `?u2intro=u2l9`(두 바구니), `?u2intro=u2l2`(빵 공장)
- 지금 도입으로 열기(견주기): `?u2intro=now:u2l4`
- 지도에서 보기: `?u2intro`(세션 `ss.u2intro`에 남는다). 끄기: `?u2intro=0`
- 꺼져 있으면 `CURRICULUM`의 Ⅱ단원은 `UNIT2_V5` 그 객체다(`content/unit2intro.ts`의 `withU2IntroSamples`).

## 구조

| 무엇 | 파일 |
|---|---|
| 배선, 토글, 샘플 자료 | `src/content/unit2intro.ts`(+ `curriculum.ts` 한 줄, `main.ts`의 바로 열기) |
| 틀(`opener` 스텝) | `src/lessons/steps/opener/opener.ts`, `src/styles/opener.css`(접두 `.opn-`) |
| 장면 | `opener/longCell.ts`(u2l4), `opener/baskets.ts`(u2l9), `opener/factoryOff.ts`(u2l2) |
| 그림 | `qa/sketch/scenes/intro-u2.mjs`, `intro-u2-factory.mjs` → `node qa/sketch/build-intro.mjs` → `src/ui/introArt.generated.ts`(생성물) |

틀의 화면: 제목(질문 한 줄, 30px) → 무대(960×544, 화면에서 346×196) → 아래 칸(조작 줄, 예측 보기, 쌤의 말).
한 화면 예산은 390×700의 스크롤 영역 554px이다. 가장 긴 시점(질문 두 줄 + 보기 셋 + 쌤의 말 두 줄)이 537px이다.
예측 보기는 공용 `hookAsk.ask()`를 그대로 쓴다. 고른 뒤에는 고르지 않은 보기가 접히고 쌤의 말이 누른 보기 바로 아래에 붙는다.
두 바구니 장면만 무대가 아래로 길다(960×860, 보기 예측이 없어 자리가 남는다).

## 새 장면을 만들 때(이번에 걸렸던 것)

- **예측은 결과보다 앞에 둔다.** 다 해 본 뒤에 묻는 예측은 답이 뻔하다(1차 눈검수의 높음 지적). 처음 화면에서 걸고, 조작으로 확인하고, 맺는 말이 고른 보기와 견준다.
- **보기 셋은 길이와 말투가 나란해야 한다.** 하나만 교과서 말투이거나 하나만 뜬금없으면 답이 드러난다. 길이를 묻는데 굵기를 섞지 않는다.
  제목이 이미 "긴 세포"라고 말하면 짧은 보기는 스스로 지워진다(보기를 모두 긴 쪽에 둔다).
- **실제와 다르게 그린 것은 무대에 적는다.** 길이만 줄자에 맞추고 굵기를 키웠으면 "실제보다 굵게 그렸어요"라고 쓴다.
- **맺는 말은 버튼으로 이어져야 한다.** "무슨 일을 맡았을까요?" → "세포에게 일 맡기기". 다음 화면에서 처음 나올 낱말(계, 검색표)은 맺는 말에서 한 번 풀어 준다.
- **까닭 없는 퇴짜는 "정해진 답 맞히기"로 읽힌다.** 돌려보내는 장면에는 까닭을 이름표로 남긴다.
- 비유가 세포에 틀린 그림을 심지 않게 한다: 통제실이 멈춘 모습은 "조절이 끊겼다"이지 "기계가 날뛴다"가 아니다. 맺는 말에서 시설 이름을 세포에 그대로 대지 않는다(세포막은 문 하나가 아니다).
- 손그림 엔진의 묶음에는 `transform` 속성이 없어 CSS 변형을 바로 걸 수 있다. 키프레임이 `opacity`를 움직이는 묶음을 숨길 때는 `visibility`를 쓴다.
- 파이썬으로 같은 파일을 연달아 고쳐 쓰면 dev 서버가 마지막 변경을 놓칠 때가 있다. 한 번 더 건드려 다시 읽게 한다.

## QA

```bash
PORT=5557 node qa/check-u2intro-fit.mjs
```

```bash
PORT=5557 node qa/e2e-u2intro.mjs
```

```bash
node qa/check-u2intro-lang.mjs
```

```bash
PPORT=4557 node qa/check-u2intro-dist.mjs
```

- 캡처: `PORT=5557 node qa/shot-u2intro.mjs <폴더>` → `python qa/make-u2intro-compare.py <폴더> <출력 폴더>`
- 엿보기: `PORT=5557 node qa/u2intro-peek.mjs u2l4 <폴더> [폭] [높이] [예측 낱말]`
- 지금 훅 실측: `PORT=5557 node qa/audit-u2-hooks.mjs <폴더>`, 걸리는 시간 어림: `PORT=5557 node qa/time-u2intro.mjs`
- 눈검수는 만든 세션이 아닌 눈에게 캡처만 넘겨 맡긴다(두 번 맡겼고 두 번 다 보기의 결, 그림의 축척, 다리 문장이 걸렸다).
