# 코드 그림 (샘플)

스틱맨 그림을 이미지 생성 모델 없이 코드로 그려 SVG로 뽑는 도구다. `sketch-art-sample` 브랜치의 판정용 샘플이고, 평가와 수치, 전체 교체의 어림은 `D:\Brilliant Science\output\sketch-art-sample\README.md`에 있다.

- 앱에서 보기: 주소에 `?sketch`를 붙인다(끄기는 `?sketch=0`). 한눈에 보기는 `/qa-sketch.html`.
- 그림 원본은 `scenes/`의 장면 코드다. `public/sketch/*.svg`와 `src/ui/sketchArt.generated.ts`는 생성물이라 손으로 고치지 않는다.

| 파일 | 하는 일 |
| --- | --- |
| `lib/sk.mjs` | 손그림 SVG 엔진: 떨리는 굵은 선(`ink`), 살짝 어긋난 채움과 마커 결(`fill`), 경로 단순화, 기준점 기록(`mark`) |
| `lib/figure.mjs` | 막대 인물: 머리 모양, 안경, 표정, 머리띠, 겉옷, 관절 좌표 자세. 인물 설정(TEACHER, KID, LIND, SAILOR_*) |
| `lib/props.mjs` | 소품 |
| `scenes/*.mjs` | 장면: 만화 u1l1 7컷, 스플래시 7컷, 원형 스틱맨 5종과 계정 화면 그림 |
| `build.mjs` | 장면 → 정적 SVG와 앱이 읽는 표. 말풍선 자리는 화자 머리 기준점에서 계산한다 |
| `preview.mjs`, `one.mjs`, `sheet-characters.mjs` | 눈검수용 시트 |
| `compare.mjs`, `bench.mjs`, `../shot-sketch.mjs` | 전후 비교 자료와 측정 |

```bash
node qa/sketch/build.mjs
```

```bash
node qa/sketch/preview.mjs all
```

새 만화를 그릴 때: `scenes/`에 장면 파일을 만들고(`comic-u1l1.mjs`가 본보기), `build.mjs`에 한 줄을 더한 다음, `preview.mjs`로 찍어 보며 좌표를 고친다. 인물에 `name`을 주면 머리 꼭대기 좌표가 기록되고, `BUBBLES`에 `{ who, text }`를 적으면 말풍선 자리가 계산된다.
