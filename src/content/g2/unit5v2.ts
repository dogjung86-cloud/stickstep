// 중2 Ⅴ 식물과 에너지 — 전면 재제작(v2). 교과서 168~197쪽 준거.
// 구성: L1 광합성의 발견 · L2 재료와 산물 · L3 확인 실험 · L4 실험 설계 ·
//       L5 환경요인 · L6 식물의 호흡 · L7 양분의 저장과 이용.
// 무료 L1~L3 / 프리미엄 L4~L7. 설계 근거는 qa/g2u5v2-blueprint.md.
import type { Unit } from "../curriculum";
import {
  lesson, hook, comic, concept, recap, mcq, ox, multi, order, binSort, cut,
  leafZoomLab, gasSensorLab, iodineTestLab,
  photoDesignLab, sugarFlowLab,
  // 사용자 확정(2026-07-26): 환경요인 조절 랩과 호흡 파트는 구판 구현이 더 좋다는 판단으로 그대로 쓴다.
  photoFactorLab, plantRespireLab, dayNightLab, leafFactoryLab,
} from "../dsl";
import {
  leafCellFig, photoPathFig, photoSummaryFig, sensorGraphFig, iodineResultFig,
  distanceBarFig, factorGraphFig, sugarRouteFig, storageFormFig, plantMiniArt,
} from "../../ui/plantFigures2";
// 구판 호흡 파트가 쓰는 그림·미니아트(그대로 재사용).
import { plantMiniArt as oldMiniArt, respirationCycleFig } from "../../ui/plantFigures";

const A = plantMiniArt;

// 발주 교육 일러스트 임베드 — public/plant2/figs/<file>.webp. lazy 금지(.scroll 컨테이너에서 안 뜬다).
const PBASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
const pfig = (file: string, alt: string): string =>
  `<img src="${PBASE}plant2/figs/${file}.webp" alt="${alt}" style="display:block;width:100%;border-radius:12px"/>`;
/** binSort 칩용 재료 사진 — public/plant2/items/<file>.webp. */
/** 구판 발주 사진(public/plant/…) — 이식한 호흡 파트가 쓴다. */
const oldImg = (path: string, alt: string): string =>
  `<img src="${PBASE}plant/${path}" alt="${alt}" draggable="false" style="display:block;width:100%;border-radius:14px"/>`;
const pitem = (file: string, alt: string): string =>
  `<img src="${PBASE}plant2/items/${file}.webp" alt="${alt}" style="display:block;width:38px;height:38px;border-radius:9px;object-fit:cover"/>`;

// ── 구판 호흡 파트에서 가져온 도해 헬퍼(2026-07-26 사용자 지시로 이식) ──
const dayProcessOverlay = (id: string): string =>
  `<svg class="dn-process-map dn-process-day" viewBox="0 0 300 200" role="img" aria-label="낮에는 이산화 탄소가 들어가고 산소가 나오는 광합성이 크게 일어나며 산소를 쓰고 이산화 탄소를 내보내는 호흡도 계속됨">
    <defs>
      <marker id="${id}-carbon-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="dn-marker-carbon" d="M0 0 L10 5 L0 10 Z"/></marker>
      <marker id="${id}-oxygen-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="dn-marker-oxygen" d="M0 0 L10 5 L0 10 Z"/></marker>
    </defs>
    <path class="dn-gas-path dn-photo-path carbon" marker-end="url(#${id}-carbon-arrow)" d="M14 103 C54 103 94 103 126 103"/>
    <path class="dn-gas-path dn-photo-path oxygen" marker-end="url(#${id}-oxygen-arrow)" d="M174 103 C210 103 250 103 286 103"/>
    <g class="dn-process-label photosynthesis"><rect x="105" y="45" width="90" height="26" rx="13"/><text x="150" y="58">광합성</text></g>
    <g class="dn-gas-chip carbon"><rect x="8" y="70" width="88" height="22" rx="11"/><text x="52" y="81">이산화 탄소</text></g>
    <g class="dn-gas-chip oxygen"><rect x="214" y="70" width="58" height="22" rx="11"/><text x="243" y="81">산소</text></g>
    <path class="dn-gas-path dn-resp-path oxygen" marker-end="url(#${id}-oxygen-arrow)" d="M286 164 C244 164 208 164 174 164"/>
    <path class="dn-gas-path dn-resp-path carbon" marker-end="url(#${id}-carbon-arrow)" d="M126 164 C90 164 52 164 14 164"/>
    <g class="dn-process-label respiration"><rect x="112" y="124" width="76" height="24" rx="12"/><text x="150" y="136">호흡</text></g>
    <g class="dn-gas-chip carbon"><rect x="8" y="169" width="88" height="22" rx="11"/><text x="52" y="180">이산화 탄소</text></g>
    <g class="dn-gas-chip oxygen"><rect x="214" y="169" width="58" height="22" rx="11"/><text x="243" y="180">산소</text></g>
  </svg>`;

const nightProcessOverlay = (id: string): string =>
  `<svg class="dn-process-map dn-process-night" viewBox="0 0 300 200" role="img" aria-label="밤에는 산소가 식물로 들어가고 이산화 탄소가 나오는 호흡만 계속됨">
    <defs>
      <marker id="${id}-carbon-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="dn-marker-carbon" d="M0 0 L10 5 L0 10 Z"/></marker>
      <marker id="${id}-oxygen-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path class="dn-marker-oxygen" d="M0 0 L10 5 L0 10 Z"/></marker>
    </defs>
    <path class="dn-gas-path dn-night-path oxygen" marker-end="url(#${id}-oxygen-arrow)" d="M14 132 C52 132 92 132 126 132"/>
    <path class="dn-gas-path dn-night-path carbon" marker-end="url(#${id}-carbon-arrow)" d="M174 132 C210 132 250 132 286 132"/>
    <g class="dn-process-label respiration"><rect x="112" y="76" width="76" height="26" rx="13"/><text x="150" y="89">호흡</text></g>
    <g class="dn-gas-chip oxygen"><rect x="22" y="96" width="58" height="22" rx="11"/><text x="51" y="107">산소</text></g>
    <g class="dn-gas-chip carbon"><rect x="204" y="96" width="88" height="22" rx="11"/><text x="248" y="107">이산화 탄소</text></g>
  </svg>`;

const dayNightToggleFig = (): string =>
  `<div class="plant-day-night-toggle">
    <input class="dn-choice" type="radio" id="g2u5-day-scene" name="g2u5-day-night-scene" checked/>
    <input class="dn-choice" type="radio" id="g2u5-night-scene" name="g2u5-day-night-scene"/>
    <div class="dn-tabs" role="tablist" aria-label="낮과 밤 장면 선택">
      <label class="dn-tab dn-tab-day" for="g2u5-day-scene">낮</label>
      <label class="dn-tab dn-tab-night" for="g2u5-night-scene">밤</label>
    </div>
    <div class="dn-scenes">
      <section class="dn-scene dn-scene-day" aria-label="강한 낮의 식물">
        <div class="dn-art">
          <img src="${PBASE}plant/figs/day-observatory.webp" alt="햇빛이 비치는 식물 관찰실의 화분 식물" draggable="false"/>
          ${dayProcessOverlay("dn-toggle-day")}
        </div>
        <div class="dn-copy">
          <div class="dn-head"><strong>강한 낮</strong><span>광합성 + 호흡</span></div>
          <p>두 과정이 함께 일어나지만 광합성량이 더 커요.</p>
        </div>
      </section>
      <section class="dn-scene dn-scene-night" aria-label="빛 없는 밤의 식물">
        <div class="dn-art">
          <img src="${PBASE}plant/figs/night-observatory.webp" alt="달빛이 비치는 식물 관찰실의 같은 화분 식물" draggable="false"/>
          ${nightProcessOverlay("dn-toggle-night")}
        </div>
        <div class="dn-copy">
          <div class="dn-head"><strong>빛 없는 밤</strong><span>호흡만 진행</span></div>
          <p>광합성은 멈추지만 호흡은 계속돼요.</p>
        </div>
      </section>
    </div>
  </div>`;

const strongDayFig = (): string =>
  `<div class="dn-question-card">
    <div class="dn-art">
      <img src="${PBASE}plant/figs/day-observatory.webp" alt="강한 낮에 햇빛을 받는 화분 식물" draggable="false"/>
      ${dayProcessOverlay("dn-question-day")}
    </div>
    <div class="dn-copy">
      <div class="dn-head"><strong>강한 낮</strong><span>광합성 + 호흡</span></div>
    </div>
  </div>`;

// ── L1. 식물의 밥은 어디서 올까 ──────────────────────────────
const L1 = lesson({
  id: "g2u5l1",
  unitId: "g2u5",
  title: "식물의 밥은 어디서 올까",
  subtitle: "광합성과 엽록체",
  label: "광합성 발견",
  icon: "leaf",
  minutes: 9,
  standard: "책 170~173쪽",
  doneNote: "식물이 스스로 양분을 만드는 과정을 알게 됐어요",
  steps: [
    hook({
      title: "흙은 그대로인데 나무만 컸어요",
      lead: "화분 하나로 시작하는 400년 전 수수께끼",
      narrator: "동물은 다른 생물을 먹어서 양분을 얻잖아요. 그런데 식물은 아무것도 먹지 않는데 어떻게 이렇게 커질까요?",
      done: "흙이 줄지 않았다는 게 결정적인 단서예요. 400년 전 과학자들도 바로 이 지점에서 헤맸답니다.",
      scene: "sproutpot",
      cta: "옛날 과학자 이야기 보기",
    }),
    comic({
      title: "나무의 몸은 어디서 왔을까",
      lead: "반 헬몬트 · 프리스틀리 · 잉엔하우스",
      narrator: "물일까, 흙일까, 공기일까? 세 과학자가 100년씩 이어 달려 답을 찾았어요.",
      cta: "잎 속으로 들어가기",
      panels: [
        {
          img: "comics/g2u5l1/0.webp",
          stage: "1단계 · 질문",
          title: "반 헬몬트, 흙의 무게부터 재요",
          caption: "1600년대 벨기에의 과학자 <b>얀 반 헬몬트</b>는 화분에 담은 흙의 무게를 정확히 재고, 작은 버드나무 묘목을 심었어요. 나무가 자라면 흙이 그만큼 줄어들 거라고 생각했거든요.",
        },
        {
          img: "comics/g2u5l1/1.webp",
          stage: "2단계 · 실험",
          title: "5년 동안 물만 주었어요",
          caption: "반 헬몬트는 거름도 주지 않고 오직 물만 주며 5년을 길렀어요. 나무는 사람 키를 훌쩍 넘길 만큼 자랐지요.",
        },
        {
          img: "comics/g2u5l1/2.webp",
          stage: "3단계 · 결과",
          title: "나무는 무거워지고, 흙은 그대로",
          caption: "나무의 무게는 크게 늘었는데 화분의 흙은 아주 조금밖에 줄지 않았어요. 나무의 몸은 흙에서 온 것이 아니었어요.",
          term: { name: "결정적 관찰", def: "예상과 다른 결과가 나올 때, 과학은 거기서 한 걸음 나아가요. 반 헬몬트의 저울이 그런 순간이었어요." },
        },
        {
          img: "comics/g2u5l1/3.webp",
          stage: "4단계 · 절반의 답",
          title: "반 헬몬트: \"그럼 물이구나!\"",
          caption: "그는 나무의 몸이 모두 물로 만들어졌다고 결론지었어요. 절반은 맞고 절반은 틀렸지요. 눈에 보이지 않는 공기도 재료라는 것은 아직 아무도 몰랐답니다.",
        },
        {
          img: "comics/g2u5l1/4.webp",
          stage: "5단계 · 새 단서",
          title: "프리스틀리의 촛불이 다시 타올랐어요",
          caption: "100여 년 뒤, 영국의 <b>조지프 프리스틀리</b>가 유리 종 안에서 촛불을 태웠어요. 촛불은 곧 꺼졌지만, 식물을 함께 넣어 두자 촛불이 다시 탈 수 있었어요. 식물이 공기를 되살린 거예요.",
        },
        {
          img: "comics/g2u5l1/5.webp",
          stage: "6단계 · 마지막 조각",
          title: "잉엔하우스: 빛이 있어야 했어요",
          caption: "그런데 어떤 날은 실패했어요. 까닭을 찾아낸 사람은 네덜란드의 <b>얀 잉엔하우스</b>예요. 식물이 공기를 되살리는 일은 오직 <b>빛이 있을 때</b>만 일어났어요.",
          term: { name: "빛이라는 조건", def: "같은 장치라도 빛이 없으면 결과가 달라져요. 조건 하나가 결과를 바꿉니다." },
        },
        {
          img: "comics/g2u5l1/6.webp",
          stage: "정리",
          title: "빛 + 공기 + 물 = 광합성",
          caption: "세 사람이 이어 달린 끝에 답이 모였어요. 식물은 빛에너지를 이용해 공기 중의 이산화 탄소와 물을 재료로 스스로 양분을 만들고, 그 과정에서 산소를 내놓아요. 이 과정을 <b>광합성</b>이라고 해요.",
        },
      ],
    }),
    leafZoomLab({
      title: "잎 속을 들여다봐요",
      lead: "양분을 만드는 공장은 어디에 있을까요",
      cta: "이름을 붙이러 가기",
      curio: {
        q: "잎은 왜 초록색으로 보일까요?",
        a: "잎 속 색소는 빛 가운데 초록빛을 잘 흡수하지 못하고 대부분 되쏘아 보내요. 우리 눈에 들어오는 건 바로 그 <b>반사된 초록빛</b>이라서 잎이 초록으로 보인답니다. 가을에 이 색소가 분해되면 그동안 가려져 있던 노랑·주황 색소가 드러나 단풍이 들어요.",
      },
    }),
    concept({
      kicker: "이름 붙이기",
      kickerTone: "plant",
      title: "광합성, 빛으로 양분을 만드는 일",
      lead: "직접 확인한 것에 이름을 붙여 볼게요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l1", "돋보기로 잎을 들여다보다 초록 알갱이를 발견하고 놀라는 스틱맨"), cap: "잎 한 장 안에 공장이 수없이 들어 있어요." },
        { k: "p", html: "모든 생물은 살아가려면 <b>양분</b>이 필요해요. 동물은 다른 생물을 먹어서 얻지만, 식물은 <b>빛에너지</b>를 이용해 스스로 만들어요." },
        { k: "term", name: "광합성", def: "식물이 빛에너지를 이용하여 양분을 만드는 과정이에요.", icon: "leaf" },
        { k: "term", name: "엽록체", def: "광합성이 일어나는 곳이에요. 식물세포 안에 있는 초록색 알갱이랍니다.", icon: "cell" },
        { k: "term", name: "엽록소", def: "엽록체 안에 들어 있는 초록색 색소로, 광합성에 필요한 빛에너지를 흡수해요.", icon: "sun" },
        { k: "figure", svg: pfig("leaf-cell-micro", "현미경으로 본 잎세포와 그 안의 초록색 알갱이"), cap: "현미경으로 본 잎세포, 초록색 알갱이가 촘촘히 들어 있어요." },
        { k: "figure", svg: leafCellFig(), cap: "같은 장면을 그림으로 정리하면, 세포 하나에 엽록체가 여러 개." },
        { k: "note", tone: "bio", html: "정리하면 <b>엽록체 안의 엽록소가 빛에너지를 흡수</b>하고, 그 에너지로 광합성이 일어나요." },
      ],
      cta: "정리하기",
    }),
    recap({
      title: "오늘의 정리",
      narrator: "식물이 스스로 밥을 짓는다는 사실, 이제 근거까지 말할 수 있어요.",
      cards: [
        {
          name: "광합성",
          text: "식물이 <b>빛에너지</b>를 이용해 스스로 <b>양분</b>을 만드는 과정이에요.",
          color: "#27864B",
          art: A("photosynthesis"),
          examples: ["빛에너지 이용", "스스로 양분 합성"],
          more: "<b class='rm-h'>왜 그럴까요?</b>동물은 먹이를 먹어야 양분을 얻지만, 식물은 빛에너지라는 공짜 에너지를 써서 재료를 양분으로 바꿔요. 그래서 식물을 스스로 양분을 만드는 생물이라고 해요.<b class='rm-h'>구체적으로 보면</b>화분 실험에서 흙이 줄지 않았는데 나무만 커진 까닭이 여기에 있어요. 나무의 몸은 흙을 먹어서가 아니라, 공기 중의 이산화 탄소와 뿌리로 올라온 물을 재료로 만든 양분이 쌓여 이루어진 거예요.<b class='rm-h'>시험에서는</b>\"식물은 흙 속 양분을 먹고 자란다\"는 문장이 오답으로 자주 나와요. 흙에서 얻는 것은 물과 아주 적은 양의 무기 양분일 뿐, 몸을 이루는 양분은 광합성으로 직접 만든다는 점을 기억해요. <span class='fun'>버드나무 실험을 한 과학자는 답의 절반만 맞혔지만, 무게를 재서 비교한 그 방법 덕분에 다음 사람이 나머지 절반을 찾을 수 있었어요.</span>",
        },
        {
          name: "엽록체",
          text: "광합성이 일어나는 장소예요. 식물세포 안의 <b>초록색 알갱이</b>랍니다.",
          color: "#12B886",
          art: A("chloroplast"),
          examples: ["식물세포 안", "세포마다 여러 개"],
          more: "<b class='rm-h'>왜 그럴까요?</b>광합성은 잎 아무 데서나 일어나는 것이 아니라 세포 속 특정한 알갱이 안에서 일어나요. 현미경으로 잎을 보면 세포벽으로 나뉜 세포 안에 초록색 알갱이가 가득 들어 있는데, 그것이 엽록체예요.<b class='rm-h'>구체적으로 보면</b>랩에서 배율을 올리며 확인했듯이, 잎 → 잎세포 → 엽록체 순서로 점점 작아져요. 초록빛을 띠는 부분에는 대부분 엽록체가 있어서, 초록색 줄기에서도 광합성이 조금 일어난답니다.<b class='rm-h'>시험에서는</b>\"광합성이 일어나는 곳은?\"이라는 물음의 답은 잎이 아니라 <b>식물세포의 엽록체</b>예요. 잎은 기관 이름이고, 엽록체는 세포 안 구조라는 차이를 구분해 두면 헷갈리지 않아요.",
        },
        {
          name: "엽록소",
          text: "엽록체 속 <b>초록색 색소</b>로, 광합성에 필요한 <b>빛에너지를 흡수</b>해요.",
          color: "#2F9E44",
          art: A("light"),
          examples: ["빛에너지 흡수", "잎이 초록인 까닭"],
          more: "<b class='rm-h'>왜 그럴까요?</b>빛에너지를 붙잡는 역할은 엽록체 안의 색소인 엽록소가 맡아요. 색소가 빛을 흡수해야 그 에너지로 재료를 양분으로 바꿀 수 있어요.<b class='rm-h'>구체적으로 보면</b>엽록소는 빛 가운데 초록빛은 잘 흡수하지 못하고 되쏘아 보내요. 우리 눈에 들어오는 것이 그 반사된 초록빛이라서 잎이 초록으로 보이는 거예요.<b class='rm-h'>시험에서는</b>엽록체(장소)와 엽록소(색소)를 바꿔 쓴 선택지가 단골이에요. <b>엽록체 안에 엽록소가 들어 있다</b>는 포함 관계로 외워 두면 실수하지 않아요.",
        },
      ],
      note: {
        tone: "bio",
        title: "한 줄 요약",
        html: "식물은 <b>엽록체</b>에서 <b>빛에너지</b>를 이용해 스스로 양분을 만들어요. 이 과정이 <b>광합성</b>이에요.",
      },
      outro: "다음 시간엔 광합성에 무엇이 들어가고 무엇이 나오는지 직접 넣어 볼 거예요.",
      cta: "문제 풀기",
    }),
    mcq({
      prompt: "식물에서 광합성이 일어나는 곳은 어디인가요?",
      figure: leafCellFig(),
      options: ["식물세포의 엽록체", "잎 뒷면의 기공", "뿌리의 뿌리털", "줄기의 물관", "잎의 표면 전체"],
      answer: 0,
      explainGood: "맞아요! 광합성은 식물세포 안의 초록색 알갱이인 <b>엽록체</b>에서 일어나요.",
      explainBad: "기공은 기체가 드나드는 문, 물관은 물이 지나는 통로예요. 광합성이 실제로 일어나는 장소는 세포 안의 <b>엽록체</b>랍니다.",
    }),
    ox({
      prompt: "엽록소는 빛에너지를 흡수하는 초록색 색소예요.",
      answer: true,
      explainGood: "맞아요! 엽록체 안에 든 엽록소가 광합성에 필요한 <b>빛에너지를 흡수</b>해요.",
      explainBad: "엽록소는 엽록체 안에 들어 있는 <b>초록색 색소</b>로, 빛에너지를 흡수하는 역할을 해요.",
    }),
    mcq({
      prompt: "화분에 심은 나무를 5년 동안 물만 주며 길렀더니, 나무의 무게는 크게 늘었지만 흙은 거의 줄지 않았어요. 이 결과가 알려 주는 사실로 가장 알맞은 것은 무엇인가요?",
      options: [
        "나무의 몸을 이루는 양분은 흙을 먹어서 생긴 것이 아니다",
        "식물은 물을 전혀 필요로 하지 않는다",
        "흙에는 식물이 쓸 물질이 하나도 없다",
        "나무는 무게를 재는 동안에만 자란다",
        "식물은 다른 생물을 먹어 양분을 얻는다",
      ],
      answer: 0,
      explainGood: "맞아요! 흙이 줄지 않았다는 건 <b>몸을 이루는 재료가 흙이 아니라는 뜻</b>이에요. 재료는 공기 중 이산화 탄소와 물이었어요.",
      explainBad: "이 실험에서 물은 계속 주었으니 물이 필요 없다는 뜻은 아니에요. 흙의 무게가 거의 그대로였다는 사실이 알려 주는 건 <b>나무의 몸이 흙에서 온 것이 아니라는 점</b>이에요.",
    }),
    multi({
      prompt: "광합성에 대한 설명으로 옳은 것을 모두 고르세요.",
      options: [
        "빛에너지를 이용하는 과정이다",
        "식물이 스스로 양분을 만드는 과정이다",
        "식물세포의 엽록체에서 일어난다",
        "식물이 다른 생물을 먹어 양분을 얻는 과정이다",
        "뿌리의 뿌리털에서 가장 활발하게 일어난다",
      ],
      answer: [0, 1, 2],
      explainGood: "맞아요! 광합성은 <b>빛에너지</b>를 이용해 <b>스스로 양분</b>을 만드는 과정이고, 장소는 <b>엽록체</b>예요.",
      explainBad: "먹어서 양분을 얻는 것은 동물의 방식이에요. 또 뿌리에는 엽록체가 거의 없어서 광합성이 일어나기 어렵답니다.",
    }),
  ],
});

// ── L2. 무엇이 들어가고 무엇이 나올까 ───────────────────────
const L2 = lesson({
  id: "g2u5l2",
  unitId: "g2u5",
  title: "무엇이 들어가고 무엇이 나올까",
  subtitle: "광합성의 재료와 산물",
  label: "재료와 산물",
  icon: "flask",
  minutes: 10,
  standard: "책 172~173쪽",
  doneNote: "광합성의 재료와 산물, 그 길까지 익혔어요",
  steps: [
    hook({
      title: "잎 뒷면의 작은 문",
      lead: "매끈해 보이는 잎에 숨은 구멍",
      narrator: "공장에 재료가 들어가려면 문이 있어야겠죠? 잎에도 문이 있을까요?",
      done: "이 작은 문이 오늘 이야기의 출입구예요.",
      scene: "stomapeek",
      cta: "재료의 길 알아보기",
    }),
    concept({
      kicker: "재료가 오는 길",
      kickerTone: "plant",
      title: "물은 뿌리로, 이산화 탄소는 잎으로",
      lead: "두 재료는 서로 다른 문으로 들어와요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l2", "잎을 공장 문처럼 열어 재료 상자를 넣는 스틱맨"), cap: "재료마다 들어오는 문이 달라요." },
        { k: "figure", svg: pfig("stoma-micro", "잎 뒷면 표피를 현미경으로 본 모습과 여러 개의 기공"), cap: "잎 뒷면을 현미경으로 보면, 세포 두 개가 마주 보며 만든 구멍이 기공이에요." },
        { k: "term", name: "기공", def: "잎에 있는 작은 구멍이에요. 이산화 탄소가 들어오고 산소가 나가는 문이랍니다.", icon: "leaf" },
        { k: "term", name: "물관", def: "뿌리에서 흡수한 물이 잎까지 올라가는 통로예요.", icon: "drop" },
        { k: "p", html: "광합성에 필요한 <b>이산화 탄소</b>는 주로 잎의 <b>기공</b>을 통해 들어오고, <b>물</b>은 <b>뿌리</b>에서 흡수되어 <b>물관</b>을 타고 잎까지 올라와요." },
        { k: "note", tone: "amber", html: "물은 잎이 아니라 <b>뿌리</b>로 들어와요. 기공으로 물을 마신다고 생각하기 쉬운데, 기공은 <b>기체</b>가 드나드는 문이에요." },
      ],
      cta: "직접 넣어 보기",
    }),
    leafFactoryLab({
      title: "잎 속 공장을 직접 가동해요",
      lead: "물관·기공 CO₂ 밸브와 빛 스위치를 끊어 보며, 무엇이 있어야 양분이 생기는지 확인하세요.",
      cta: "만들어진 양분 살펴보기",
      curio: {
        q: "잎에서 처음 만들어지는 양분은 왜 곧바로 <b>녹말</b>로 바뀔까요?",
        a: "포도당은 물에 잘 녹아 세포 안 농도를 크게 바꿀 수 있어요. 물에 잘 녹지 않는 <b>녹말</b>로 바꾸면 잎 속에 비교적 안전하게 모아 둘 수 있답니다.",
      },
    }),
    concept({
      kicker: "산물 정리",
      kickerTone: "plant",
      title: "포도당은 곧 녹말로 바뀌어요",
      lead: "만들어진 양분은 그대로 두지 않아요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l2b", "알갱이를 실에 꿰어 목걸이처럼 길게 잇는 스틱맨"), cap: "작은 알갱이를 길게 이으면 보관하기 좋아요." },
        { k: "p", html: "광합성으로 만들어지는 양분은 <b>포도당</b>이에요. 포도당은 곧 <b>녹말</b>로 바뀌어 엽록체에 저장돼요." },
        { k: "term", name: "녹말", def: "많은 수의 포도당으로 이루어진 탄수화물이에요. 물에 잘 녹지 않아 저장하기 좋아요.", icon: "layers" },
        { k: "p", html: "광합성이 일어나면 포도당과 함께 <b>산소</b>도 만들어져요. 산소는 잎의 <b>기공</b>을 통해 식물 밖으로 나가요." },
        { k: "figure", svg: photoSummaryFig(), cap: "이산화 탄소 + 물 → (빛에너지) → 포도당 + 산소" },
      ],
      cta: "정리하기",
    }),
    recap({
      title: "오늘의 정리",
      narrator: "공장에 무엇이 들어가고 무엇이 나오는지, 길까지 함께 외워요.",
      cards: [
        {
          name: "필요한 물질",
          text: "<b>이산화 탄소</b>와 <b>물</b>, 그리고 <b>빛에너지</b>가 있어야 해요.",
          color: "#5A6472",
          art: A("carbon"),
          examples: ["이산화 탄소 · 기공", "물 · 뿌리와 물관"],
          more: "<b class='rm-h'>왜 그럴까요?</b>양분을 만들려면 재료와 에너지가 모두 있어야 해요. 재료는 이산화 탄소와 물이고, 그 둘을 붙여 새 물질로 바꾸는 힘이 빛에너지예요.<b class='rm-h'>구체적으로 보면</b>랩에서 물만 올리고 빛을 켜지 않았을 때 공장이 멈춰 있던 것을 떠올려 봐요. 셋 중 하나라도 없으면 광합성은 일어나지 않아요.<b class='rm-h'>시험에서는</b>\"물은 기공으로 들어온다\"는 문장이 대표적인 오답이에요. 물은 <b>뿌리</b>에서 흡수되어 <b>물관</b>을 타고 잎까지 올라온다는 경로를 정확히 기억해요.",
        },
        {
          name: "만들어지는 물질",
          text: "<b>포도당</b>과 <b>산소</b>가 만들어져요. 포도당은 곧 <b>녹말</b>로 바뀌어요.",
          color: "#8D72D9",
          art: A("glucose"),
          examples: ["포도당 → 녹말", "산소 · 기공으로"],
          more: "<b class='rm-h'>왜 그럴까요?</b>광합성으로 처음 만들어지는 양분은 포도당이에요. 그런데 포도당은 물에 잘 녹아서 그대로 두면 세포 안을 돌아다녀요. 그래서 물에 잘 녹지 않는 녹말로 바꾸어 엽록체에 차곡차곡 저장해요.<b class='rm-h'>구체적으로 보면</b>녹말은 포도당 여러 개가 길게 이어진 탄수화물이에요. 알갱이를 실에 꿰어 목걸이로 만들면 흩어지지 않는 것과 같은 원리예요.<b class='rm-h'>시험에서는</b>\"광합성으로 처음 만들어지는 양분은 단백질이다\"는 틀린 문장이에요. 처음 만들어지는 것은 <b>포도당</b>이고, 저장 형태가 <b>녹말</b>이라는 순서를 지켜서 답해요.",
        },
        {
          name: "드나드는 문",
          text: "기체는 <b>기공</b>으로, 물은 <b>뿌리 → 물관</b>으로 다녀요.",
          color: "#4DA3F5",
          art: A("stoma"),
          examples: ["이산화 탄소 들어옴", "산소 나감"],
          more: "<b class='rm-h'>왜 그럴까요?</b>기체와 액체는 지나는 길이 달라요. 기공은 잎 표면에 있는 작은 구멍으로 기체가 드나드는 문이고, 물관은 뿌리에서 잎까지 이어진 물의 통로예요.<b class='rm-h'>구체적으로 보면</b>기공은 콩팥 모양 세포 두 개가 마주 보며 만든 틈이에요. 이 틈으로 이산화 탄소가 들어오고, 광합성으로 만들어진 산소가 밖으로 나가요.<b class='rm-h'>시험에서는</b>그림에서 화살표 방향을 묻는 문제가 자주 나와요. <b>들어오는 기체 = 이산화 탄소</b>, <b>나가는 기체 = 산소</b>(낮 기준)를 그림과 함께 익혀 두면 빠르게 답할 수 있어요.",
        },
      ],
      note: {
        tone: "bio",
        title: "한 줄 요약",
        html: "<b>이산화 탄소 + 물</b>이 <b>빛에너지</b>를 받아 <b>포도당 + 산소</b>가 돼요.",
      },
      outro: "그런데 정말 그런지, 다음 시간엔 실험으로 확인해 볼게요.",
      cta: "문제 풀기",
    }),
    binSort({
      title: "재료일까, 산물일까",
      lead: "네 가지 물질을 알맞은 통에 넣어 보세요.",
      bins: [
        { id: "in", label: "광합성에 필요한 물질", color: "#5A6472", hint: "들어가는 것" },
        { id: "out", label: "광합성으로 만들어지는 물질", color: "#8D72D9", hint: "나오는 것" },
      ],
      items: [
        { label: "이산화 탄소", bin: "in" },
        { label: "물", bin: "in" },
        { label: "포도당", bin: "out" },
        { label: "산소", bin: "out" },
      ],
      explainGood: "맞아요! <b>이산화 탄소와 물</b>이 재료, <b>포도당과 산소</b>가 산물이에요.",
      explainBad: "화살표를 떠올려 봐요. 이산화 탄소와 물이 <b>왼쪽(재료)</b>, 포도당과 산소가 <b>오른쪽(산물)</b>이랍니다.",
    }),
    mcq({
      prompt: "그림은 식물에 드나드는 물질을 나타낸 것이에요. ㉠~㉣ 중 <b>물의 이동</b>을 나타낸 것은 무엇인가요?",
      figure: photoPathFig(),
      shuffle: false,
      options: ["㉠", "㉡", "㉢", "㉣", "㉠과 ㉢"],
      answer: 3,
      explainGood: "맞아요! 물은 <b>뿌리에서 흡수되어 물관을 따라 위로</b> 올라가요. ㉣이 그 이동이에요.",
      explainBad: "㉠은 빛에너지, ㉡은 잎으로 들어오는 이산화 탄소, ㉢은 잎에서 나가는 산소예요. 물은 <b>뿌리에서 잎으로 올라가는 ㉣</b>이랍니다.",
    }),
    ox({
      prompt: "광합성에 필요한 물은 잎의 기공을 통해 식물 안으로 들어와요.",
      answer: false,
      explainGood: "맞아요! 물은 <b>뿌리</b>에서 흡수되어 <b>물관</b>을 타고 잎까지 올라와요. 기공은 기체가 드나드는 문이에요.",
      explainBad: "기공으로 드나드는 것은 <b>기체</b>예요. 물은 <b>뿌리 → 물관 → 잎</b> 경로로 이동한답니다.",
    }),
    mcq({
      prompt: "광합성으로 만들어진 포도당은 곧 무엇으로 바뀌어 엽록체에 저장되나요?",
      options: ["녹말", "단백질", "지방", "설탕", "이산화 탄소"],
      answer: 0,
      explainGood: "맞아요! 포도당은 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 엽록체에 저장돼요.",
      explainBad: "포도당이 처음 바뀌어 저장되는 형태는 <b>녹말</b>이에요. 설탕은 나중에 다른 기관으로 <b>이동할 때</b>의 형태랍니다.",
    }),
  ],
});

// ── L3. 광합성을 눈으로 확인해요 ────────────────────────────
const L3 = lesson({
  id: "g2u5l3",
  unitId: "g2u5",
  title: "광합성을 눈으로 확인해요",
  subtitle: "센서 실험과 아이오딘 검정",
  label: "확인 실험",
  icon: "microscope",
  minutes: 11,
  standard: "책 174~175쪽",
  doneNote: "두 가지 실험으로 광합성의 증거를 찾았어요",
  steps: [
    hook({
      title: "겉으로는 똑같아 보여요",
      lead: "하루 동안 빛을 못 본 잎",
      narrator: "한쪽 상추에만 어둠상자를 씌우고 하루를 두었어요. 상자를 열면 무엇이 달라져 있을까요?",
      done: "겉모습이 아니라 잎 <b>속</b>을 봐야 해요. 두 가지 방법으로 확인해 볼게요.",
      scene: "darkbox",
      cta: "센서로 재 보기",
    }),
    gasSensorLab({
      title: "기체를 재 볼까요",
      lead: "빛을 비추면 용기 안 공기는 어떻게 달라질까요",
      cta: "잎 속 양분 확인하러 가기",
      curio: {
        q: "이산화 탄소는 왜 ppm으로 잴까요?",
        a: "공기 중 산소는 약 21%나 되지만 이산화 탄소는 <b>0.04% 정도</b>로 아주 적어요. 백분율로 쓰면 소수점 아래가 길어져 읽기 불편하죠. 그래서 100만분의 1을 뜻하는 <b>ppm</b>을 써요. 10000ppm이 1%이니, 0.04%는 400ppm이랍니다.",
      },
    }),
    concept({
      kicker: "실험 설계",
      kickerTone: "plant",
      title: "잎 속 양분을 확인하는 방법",
      lead: "눈에 보이지 않는 양분을 색으로 드러내요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l3", "잎에 액체 한 방울을 떨어뜨리자 얼룩이 진하게 번져 놀라는 스틱맨"), cap: "보이지 않던 것이 색으로 나타나요." },
        { k: "term", name: "아이오딘-아이오딘화 칼륨 용액", def: "녹말과 반응하면 청람색으로 변하는 용액이에요. 녹말이 있는지 확인할 때 써요.", icon: "flask" },
        { k: "p", html: "광합성으로 만들어진 포도당은 곧 <b>녹말</b>이 되니, 잎에 <b>녹말이 있는지</b>를 확인하면 광합성이 일어났는지 알 수 있어요." },
        { k: "list", ordered: true, items: [
          "<b>암처리</b>: 하루 동안 어둠상자를 씌워 원래 잎에 있던 녹말을 다 쓰게 해요.",
          "<b>탈색</b>: 잎을 에탄올에 넣고 <b>뜨거운 물에 담가</b> 데워요. 초록색 엽록소가 빠져나와야 색깔 변화가 잘 보여요.",
          "<b>검정</b>: 증류수로 헹군 뒤 아이오딘 용액을 떨어뜨려 색깔 변화를 봐요.",
        ] },
        { k: "figure", svg: pfig("ethanol-bath", "뜨거운 물이 든 비커 안에 잎 조각과 에탄올이 든 시험관을 담근 모습"), cap: "시험관을 뜨거운 물에 담가 데워요. 에탄올이 초록으로 물들어요." },
        { k: "callout", icon: "flame", tone: "amber", title: "안전이 먼저예요", html: "에탄올은 불이 잘 붙어요. 알코올램프로 <b>직접 가열하지 말고</b> 반드시 <b>뜨거운 물에 담가</b> 데워요." },
      ],
      cta: "실험 시작하기",
    }),
    iodineTestLab({
      title: "잎에서 녹말을 찾아요",
      lead: "다섯 단계를 순서대로 해 볼까요",
      cta: "정리하기",
      curio: {
        q: "암처리를 건너뛰면 어떻게 될까요?",
        a: "잎에는 어제 만들어 둔 녹말이 이미 들어 있어요. 암처리를 하지 않으면 <b>빛을 받지 못한 잎에서도 청람색이 나타나</b> 두 잎을 비교할 수 없어요. 하루 동안 어둠에 두면 그 녹말을 호흡과 이동으로 다 써 버려서, 실험 중에 새로 만들어진 녹말만 남게 된답니다.",
      },
    }),
    recap({
      title: "오늘의 정리",
      narrator: "두 실험이 각각 무엇을 증명했는지 정확히 말할 수 있어야 해요.",
      cards: [
        {
          name: "기체 변화",
          text: "빛을 비추면 <b>이산화 탄소는 줄고 산소는 늘어요</b>.",
          color: "#0E8F8A",
          art: A("sensor"),
          examples: ["이산화 탄소 감소", "산소 증가"],
          more: "<b class='rm-h'>왜 그럴까요?</b>광합성이 이산화 탄소를 재료로 쓰고 산소를 만들어 내기 때문이에요. 밀폐된 용기라 드나드는 공기가 없으니, 농도 변화가 곧 식물이 한 일이 됩니다.<b class='rm-h'>구체적으로 보면</b>곡선은 처음에 가파르다가 점점 완만해져요. 재료인 이산화 탄소가 줄어들수록 광합성 속도도 느려지기 때문이에요.<b class='rm-h'>시험에서는</b>전등 개수를 늘리면 어떻게 되냐는 물음이 자주 나와요. 빛이 세지면 광합성이 더 활발해지니 <b>이산화 탄소는 더 빠르게 감소하고 산소는 더 빠르게 증가</b>한다고 답하면 돼요.",
        },
        {
          name: "아이오딘 검정",
          text: "빛을 받은 잎만 <b>청람색</b>으로 변해요. 확인한 것은 <b>녹말</b>이에요.",
          color: "#2B3A8F",
          art: A("iodine"),
          examples: ["녹말 + 아이오딘", "청람색"],
          more: "<b class='rm-h'>왜 그럴까요?</b>아이오딘-아이오딘화 칼륨 용액은 녹말과 만나면 청람색으로 변해요. 빛을 받은 잎에서만 색이 변했다는 것은 그 잎에서만 <b>새로 녹말이 만들어졌다</b>는 뜻이에요.<b class='rm-h'>구체적으로 보면</b>탈색을 먼저 하는 까닭은 잎의 초록색이 색 변화를 가려서예요. 잎을 에탄올에 담가 물중탕하면 엽록소가 에탄올로 빠져나와 잎은 하얘지고 에탄올은 초록색이 됩니다.<b class='rm-h'>시험에서는</b>\"아이오딘 용액으로 포도당을 확인했다\"는 문장이 대표적 오답이에요. 이 용액이 확인하는 것은 <b>녹말</b>이랍니다. <span class='fun'>에탄올을 직접 불에 올리면 인화 위험이 커요. 뜨거운 물에 담가 데우는 물중탕이 정답입니다.</span>",
        },
        {
          name: "비교의 조건",
          text: "하루 <b>암처리</b>를 해야 두 잎을 견줄 수 있어요.",
          color: "#495057",
          art: A("darkbox"),
          examples: ["원래 녹말 소모", "새로 만든 녹말만 남김"],
          more: "<b class='rm-h'>왜 그럴까요?</b>실험은 언제나 <b>비교</b>로 말해요. 빛을 받은 잎과 받지 못한 잎이 처음부터 같은 상태여야, 결과의 차이를 빛 때문이라고 말할 수 있어요.<b class='rm-h'>구체적으로 보면</b>암처리를 건너뛰면 어제 만든 녹말이 남아 있어 두 잎 모두 청람색이 됩니다. 하루 어둠에 두면 그 녹말이 소모되어 출발선이 같아져요.<b class='rm-h'>시험에서는</b>\"어둠상자를 씌우는 까닭\"을 서술형으로 자주 물어요. <b>잎에 원래 있던 녹말을 없애 실험 조건을 같게 만들기 위해서</b>라고 쓰면 됩니다.",
        },
      ],
      note: {
        tone: "bio",
        title: "한 줄 요약",
        html: "기체 변화는 <b>이산화 탄소가 쓰이고 산소가 생김</b>을, 아이오딘 검정은 <b>녹말이 만들어짐</b>을 보여 줘요.",
      },
      outro: "이제 여러분이 직접 실험을 설계할 차례예요.",
      cta: "문제 풀기",
    }),
    order({
      title: "실험 순서를 맞춰 보세요",
      lead: "잎에서 녹말을 확인하는 다섯 단계예요.",
      items: [
        "한쪽 화분에만 어둠상자를 씌워 하루 둔다",
        "두 화분에서 잎을 하나씩 딴다",
        "에탄올이 든 시험관에 잎을 넣고 뜨거운 물에 담가 탈색한다",
        "잎을 꺼내 증류수로 헹군다",
        "아이오딘 용액을 떨어뜨려 색깔 변화를 관찰한다",
      ],
      explainGood: "맞아요! <b>암처리 → 잎 따기 → 탈색 → 헹굼 → 검정</b> 순서예요.",
      explainBad: "탈색을 먼저 해야 색깔 변화가 보이고, 그 전에 하루 암처리로 출발선을 맞춰야 해요.",
    }),
    mcq({
      prompt: "잎 조각을 에탄올에 넣고 뜨거운 물에 담가 데우는 까닭으로 가장 알맞은 것은 무엇인가요?",
      options: [
        "초록색 엽록소를 빼내 색깔 변화를 잘 보려고",
        "잎 속 녹말을 모두 없애려고",
        "잎을 부드럽게 만들어 잘 찢어지게 하려고",
        "에탄올이 녹말과 반응해 색이 변하게 하려고",
        "잎에 산소를 더 많이 공급하려고",
      ],
      answer: 0,
      explainGood: "맞아요! 초록색이 남아 있으면 청람색 변화가 가려져요. <b>탈색</b>이 목적이에요.",
      explainBad: "색을 내는 것은 아이오딘 용액이고, 에탄올은 <b>엽록소를 빼내는</b> 역할이에요. 녹말을 없애는 것은 암처리랍니다.",
    }),
    mcq({
      prompt: "상추가 든 투명 용기에 빛을 비추며 10분 동안 측정한 결과예요. 두 그래프에 대한 설명으로 옳은 것은 무엇인가요?",
      figure: sensorGraphFig(),
      options: [
        "광합성에 이산화 탄소가 쓰이고 산소가 만들어졌다",
        "광합성에 산소가 쓰이고 이산화 탄소가 만들어졌다",
        "빛이 없어도 같은 결과가 나타난다",
        "용기 안 공기가 밖으로 빠져나가 농도가 변했다",
        "상추가 이산화 탄소를 물로 바꾸었다",
      ],
      answer: 0,
      explainGood: "맞아요! <b>줄어든 기체가 재료</b>, <b>늘어난 기체가 산물</b>이에요.",
      explainBad: "이산화 탄소 곡선은 내려가고 산소 곡선은 올라갔어요. 줄어든 이산화 탄소가 <b>쓰인 재료</b>, 늘어난 산소가 <b>만들어진 물질</b>이랍니다.",
    }),
    ox({
      prompt: "아이오딘-아이오딘화 칼륨 용액은 포도당과 반응해 청람색으로 변해요.",
      figure: iodineResultFig(),
      answer: false,
      explainGood: "맞아요! 이 용액이 반응하는 물질은 <b>녹말</b>이에요.",
      explainBad: "청람색은 <b>녹말</b>과 반응했을 때 나타나요. 광합성으로 만들어진 포도당이 <b>녹말로 바뀐 뒤</b> 검출되는 것이랍니다.",
    }),
  ],
});

// ── L4. 실험을 설계해요 ─────────────────────────────────────
const L4 = lesson({
  id: "g2u5l4",
  unitId: "g2u5",
  title: "실험을 설계해요",
  subtitle: "조건 하나만 다르게",
  label: "실험 설계",
  icon: "ruler",
  minutes: 10,
  standard: "책 176~177쪽",
  doneNote: "변인 통제로 실험을 설계할 수 있게 됐어요",
  premium: true,
  steps: [
    hook({
      title: "이 실험, 믿어도 될까요",
      lead: "한꺼번에 두 가지를 바꿨어요",
      narrator: "빛의 세기가 광합성에 미치는 영향을 알아보려는 실험이에요. 결과를 보고 결론을 내려 볼까요?",
      done: "원인을 하나로 짚을 수 없다면 실험을 다시 설계해야 해요.",
      scene: "mixedtest",
      cta: "설계 규칙 배우기",
    }),
    concept({
      kicker: "설계의 규칙",
      kickerTone: "plant",
      title: "다르게 할 조건은 하나만",
      lead: "결과의 원인을 말하려면 조건을 맞춰야 해요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l4", "저울 양쪽에 똑같은 상자를 여럿 올리고 한쪽에만 상자 하나를 더 얹는 스틱맨"), cap: "딱 하나만 다르게, 그래야 원인이 보여요." },
        { k: "p", html: "알아보려는 조건을 <b>다르게 해야 할 조건</b>, 결과에 영향을 줄 수 있는 나머지를 <b>같게 해야 할 조건</b>이라고 해요." },
        { k: "term", name: "다르게 해야 할 조건", def: "알아보려는 그 조건 하나예요. 빛의 세기를 알아본다면 전등과의 거리가 여기에 들어가요.", icon: "target" },
        { k: "term", name: "같게 해야 할 조건", def: "결과에 영향을 줄 수 있는 나머지 전부예요. 상추의 크기, 용기, 온도, 시간처럼요.", icon: "check" },
        { k: "p", html: "두 가지를 함께 바꾸면 결과가 달라져도 <b>어느 것 때문인지 가릴 수 없어요</b>. 그래서 하나만 바꾸는 거예요." },
        { k: "figure", svg: pfig("lamp-distance", "같은 용기 세 개 앞에 전등을 서로 다른 거리에 둔 실험 장치"), cap: "전등과의 거리만 다르게, 나머지는 똑같이 맞춰요." },
        { k: "note", tone: "bio", html: "측정할 것도 미리 정해요. 눈대중이 아니라 <b>숫자로 잴 수 있는 값</b>이어야 견줄 수 있어요." },
      ],
      cta: "계획서 만들기",
    }),
    photoDesignLab({
      title: "계획서를 완성해요",
      lead: "빛의 세기와 광합성량의 관계를 알아볼까요",
      cta: "정리하기",
      curio: {
        q: "전등을 두 배 멀리 두면 빛도 절반이 될까요?",
        a: "아니에요. 빛은 사방으로 퍼져 나가기 때문에 거리가 <b>2배</b>가 되면 같은 넓이에 닿는 빛의 양은 <b>4분의 1</b>로 줄어요. 그래서 전등을 조금만 더 멀리 놓아도 광합성량이 꽤 많이 줄어든답니다. 실험에서는 자로 거리를 정확히 재는 게 중요해요.",
      },
    }),
    recap({
      title: "오늘의 정리",
      narrator: "설계만 잘해도 실험의 절반은 끝난 거예요.",
      cards: [
        {
          name: "변인 통제",
          text: "알아보려는 조건 <b>하나만</b> 다르게, 나머지는 <b>모두 같게</b> 해요.",
          color: "#27864B",
          art: A("control"),
          examples: ["다르게: 전등과의 거리", "같게: 크기·용기·온도·시간"],
          more: "<b class='rm-h'>왜 그럴까요?</b>결과가 달라진 원인을 한 가지로 지목하려면, 달라진 조건도 한 가지여야 해요. 둘 이상을 바꾸면 어느 쪽이 원인인지 영영 알 수 없어요.<b class='rm-h'>구체적으로 보면</b>훅에서 본 실험은 전등 거리와 물의 양을 함께 바꿨어요. 왼쪽이 잘 자랐지만 그것이 빛 때문인지 물 때문인지 말할 수 없었죠.<b class='rm-h'>시험에서는</b>\"이 실험에서 다르게 해야 할 조건과 같게 해야 할 조건을 쓰시오\"가 단골이에요. 온도를 알아보는 실험이라면 <b>다르게: 온도</b>, <b>같게: 빛의 세기·이산화 탄소 농도·식물의 크기·시간</b>처럼 답하면 됩니다.",
        },
        {
          name: "측정할 것",
          text: "<b>숫자로 잴 수 있는 값</b>을 미리 정해요.",
          color: "#1E6FBF",
          art: A("graph"),
          examples: ["산소 농도 증가량", "10분 동안"],
          more: "<b class='rm-h'>왜 그럴까요?</b>\"더 잘 자란 것 같다\"는 사람마다 다르게 볼 수 있어요. 같은 방법으로 잰 숫자여야 서로 견줄 수 있고, 다른 사람이 다시 해 봐도 같은 결론에 이를 수 있어요.<b class='rm-h'>구체적으로 보면</b>광합성량은 직접 재기 어려우니, 같은 시간 동안 늘어난 <b>산소 농도</b>나 줄어든 <b>이산화 탄소 농도</b>로 대신 재요.<b class='rm-h'>시험에서는</b>측정 항목으로 \"잎의 색깔\"이나 \"화분의 무게\" 같은 선택지가 함정으로 나와요. <b>같은 시간 동안의 기체 농도 변화</b>가 정답 쪽이랍니다.",
        },
        {
          name: "가설과 결론",
          text: "예상을 먼저 세우고, 결과로 <b>확인</b>해요.",
          color: "#9A5B00",
          art: A("scale"),
          examples: ["빛이 셀수록 증가할 것이다", "결과로 판단"],
          more: "<b class='rm-h'>왜 그럴까요?</b>가설은 탐구 문제에 대한 잠정적인 답이에요. 실험으로 확인할 수 있게 구체적으로 세워야 해요.<b class='rm-h'>구체적으로 보면</b>\"빛의 세기가 셀수록 광합성량이 증가할 것이다\"는 좋은 가설이에요. 전등 거리를 세 단계로 바꿔 산소 증가량을 재면 맞는지 틀리는지 판단할 수 있으니까요.<b class='rm-h'>시험에서는</b>결과가 가설과 다르게 나와도 실패가 아니에요. <b>가설이 맞지 않았다는 사실을 알아낸 것</b> 역시 탐구의 결과랍니다.",
        },
      ],
      note: {
        tone: "amber",
        title: "한 줄 요약",
        html: "<b>하나만 다르게, 나머지는 같게</b>, 그래야 결과의 원인을 말할 수 있어요.",
      },
      outro: "다음 시간엔 빛 말고 어떤 조건이 광합성에 영향을 주는지 알아볼게요.",
      cta: "문제 풀기",
    }),
    mcq({
      prompt: "빛의 세기가 광합성량에 미치는 영향을 알아보는 실험에서, <b>다르게 해야 할 조건</b>은 무엇인가요?",
      options: ["전등과 상추 사이의 거리", "상추 모종의 크기", "투명 용기의 크기", "실험한 시간", "실험실의 온도"],
      answer: 0,
      explainGood: "맞아요! 빛의 세기를 바꾸려면 <b>전등과의 거리</b>(또는 전등의 개수)를 조절해요.",
      explainBad: "나머지는 모두 <b>같게 해야 할 조건</b>이에요. 빛의 세기를 조절하는 방법은 전등과의 거리나 개수를 바꾸는 것이랍니다.",
    }),
    multi({
      prompt: "위 실험에서 <b>같게 해야 할 조건</b>을 모두 고르세요.",
      options: ["상추 모종의 크기", "투명 용기의 크기", "실험실의 온도", "측정한 시간", "전등과 상추 사이의 거리"],
      answer: [0, 1, 2, 3],
      explainGood: "맞아요! 알아보려는 <b>빛의 세기</b>만 빼고 나머지는 전부 같게 맞춰야 해요.",
      explainBad: "전등과의 거리는 이 실험에서 <b>일부러 다르게</b> 하는 조건이에요. 나머지 넷은 모두 같게 맞춰야 결과를 빛 때문이라고 말할 수 있어요.",
    }),
    mcq({
      prompt: "그림은 전등과의 거리를 다르게 하며 10분 동안 산소 농도 증가량을 잰 결과예요. 이 결과에서 내릴 수 있는 결론으로 가장 알맞은 것은 무엇인가요?",
      figure: distanceBarFig(),
      options: [
        "전등이 가까울수록, 즉 빛이 셀수록 광합성량이 많아진다",
        "전등이 멀수록 광합성량이 많아진다",
        "빛의 세기는 광합성량과 관계가 없다",
        "산소 농도는 시간이 지나면 늘 줄어든다",
        "전등과의 거리를 두 배로 하면 광합성량도 두 배가 된다",
      ],
      answer: 0,
      explainGood: "맞아요! 거리가 가까울수록 빛이 세지고, 산소 증가량도 커졌어요.",
      explainBad: "막대가 가장 긴 쪽은 10 cm예요. <b>전등이 가까울수록(빛이 셀수록) 광합성량이 많다</b>는 결론이 맞아요. 다만 정확히 몇 배가 된다고까지는 말할 수 없어요.",
    }),
    mcq({
      prompt: "실험에서 두 가지 조건을 한꺼번에 다르게 하면 안 되는 까닭으로 가장 알맞은 것은 무엇인가요?",
      options: [
        "결과가 달라져도 어느 조건 때문인지 알 수 없기 때문에",
        "실험 시간이 두 배로 길어지기 때문에",
        "측정 장치가 두 개 필요하기 때문에",
        "식물이 두 조건을 동시에 견디지 못하기 때문에",
        "가설을 두 개 세워야 하기 때문에",
      ],
      answer: 0,
      explainGood: "맞아요! 원인을 하나로 지목할 수 없게 되니 <b>결론을 내릴 수 없어요</b>.",
      explainBad: "장치나 시간의 문제가 아니에요. 조건이 둘 다 달라지면 <b>결과의 원인을 가릴 수 없다</b>는 것이 핵심이랍니다.",
    }),
  ],
});

// ── L5. 광합성에 영향을 주는 것들 ───────────────────────────
const L5 = lesson({
  id: "g2u5l5",
  unitId: "g2u5",
  title: "광합성에 영향을 주는 것들",
  subtitle: "빛의 세기 · 이산화 탄소 농도 · 온도",
  label: "환경요인",
  icon: "thermo",
  minutes: 10,
  standard: "책 178~179쪽",
  doneNote: "세 환경요인과 광합성량의 관계를 그래프로 읽을 수 있어요",
  premium: true,
  steps: [
    hook({
      title: "온실인데 왜 안 자랄까",
      lead: "빛도 이산화 탄소도 넉넉한데",
      narrator: "겨울 온실이에요. 빛도 충분하고 이산화 탄소도 넣어 주는데 식물이 잘 자라지 않아요.",
      done: "남은 조건 하나가 발목을 잡고 있었어요.",
      scene: "greenhouse",
      cta: "직접 조절해 보기",
    }),
    photoFactorLab({
      title: "스마트 온실<br>조건 하나씩 실험해요",
      lead: "다른 조건은 고정하고 슬라이더로 빛·이산화 탄소·온도를 하나씩 비교하세요.",
      cta: "그래프 정리하기",
      curio: {
        q: "온실의 조명을 무조건 가장 밝게 켜면 수확량이 가장 클까요?",
        a: "빛이 부족할 때는 밝게 할수록 광합성량이 늘지만, 일정 수준 뒤에는 다른 조건이 제한해 증가가 작아져요. 조명을 더 켜면 전기만 많이 쓸 수 있어요. 그래서 실제 스마트 온실은 <b>광합성 증가와 에너지 비용</b>을 함께 따져 조절해요.",
      },
    }),
    concept({
      kicker: "까닭 정리",
      kickerTone: "plant",
      title: "왜 끝없이 늘지는 않을까",
      lead: "세 그래프의 모양에는 이유가 있어요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l5", "다이얼 세 개를 돌리는데 하나를 너무 올리자 화분이 축 처지는 것을 보고 놀라는 스틱맨"), cap: "많이 준다고 늘 좋은 건 아니에요." },
        { k: "p", html: "빛의 세기와 이산화 탄소 농도는 커질수록 광합성량이 늘다가, 어느 지점부터는 <b>더 늘지 않고 일정</b>해져요." },
        { k: "note", tone: "bio", html: "식물세포에 들어 있는 <b>엽록체의 수는 한정</b>되어 있어요. 공장의 기계 수가 정해져 있으니 재료를 아무리 더 넣어도 생산량이 무한히 늘지는 않는 거예요." },
        { k: "p", html: "온도는 달라요. 높아질수록 늘다가 <b>일정 온도 이상이 되면 빠르게 감소</b>해요." },
        { k: "figure", svg: factorGraphFig(), cap: "(가)·(나)는 일정해지고, (다)는 어느 지점부터 급하게 떨어져요." },
        { k: "figure", svg: pfig("greenhouse-in", "유리 온실 안에 줄지어 자라는 식물들"), cap: "온실은 세 요인을 한꺼번에 관리하는 장치예요." },
        { k: "p", html: "그래서 농작물을 기르는 곳에서는 <b>빛·이산화 탄소·온도</b>가 모두 알맞게 유지되도록 환경을 세심하게 관리해요." },
      ],
      cta: "정리하기",
    }),
    recap({
      title: "오늘의 정리",
      narrator: "그래프 모양만 봐도 어떤 요인인지 알 수 있어요.",
      cards: [
        {
          name: "빛의 세기",
          text: "셀수록 늘다가 일정 세기 이상에서는 <b>일정</b>해져요.",
          color: "#FFC44F",
          art: A("light"),
          examples: ["증가 후 일정", "엽록체 수 한정"],
          more: "<b class='rm-h'>왜 그럴까요?</b>빛이 셀수록 엽록소가 흡수하는 에너지가 많아져 광합성이 활발해져요. 하지만 세포 속 엽록체 수가 정해져 있어서, 어느 지점부터는 빛을 더 줘도 처리할 수 있는 양이 늘지 않아요.<b class='rm-h'>구체적으로 보면</b>랩에서 슬라이더를 끝까지 밀어도 기포가 더 빨라지지 않던 구간이 바로 그 지점이에요. 그래프가 수평이 되는 부분이죠.<b class='rm-h'>시험에서는</b>그래프에서 수평 구간을 가리키며 \"이 구간에서 광합성량을 늘리려면?\"이라고 물어요. 빛을 더 세게 하는 것으로는 안 되고, <b>이산화 탄소 농도나 온도 같은 다른 조건</b>을 알맞게 바꿔야 한다고 답하면 됩니다.",
        },
        {
          name: "이산화 탄소 농도",
          text: "높을수록 늘다가 일정 농도 이상에서는 <b>일정</b>해져요.",
          color: "#5A6472",
          art: A("carbon"),
          examples: ["증가 후 일정", "재료의 양"],
          more: "<b class='rm-h'>왜 그럴까요?</b>이산화 탄소는 광합성의 재료예요. 재료가 많을수록 만들 수 있는 양분이 늘지만, 이 역시 엽록체 수의 한계에 부딪혀 어느 지점부터는 일정해져요.<b class='rm-h'>구체적으로 보면</b>공기 중 이산화 탄소는 0.04% 정도로 아주 적어요. 그래서 온실에서는 이산화 탄소를 일부러 공급해 광합성을 돕기도 해요.<b class='rm-h'>시험에서는</b>\"이산화 탄소 농도가 높을수록 광합성량이 계속 증가한다\"는 문장은 <b>틀린</b> 문장이에요. \"계속\"이라는 말이 들어가면 대부분 오답이라는 점을 기억해요.",
        },
        {
          name: "온도",
          text: "높을수록 늘다가 일정 온도 이상에서는 <b>빠르게 감소</b>해요.",
          color: "#E74C3C",
          art: A("temp"),
          examples: ["증가 후 급감", "알맞은 온도가 있음"],
          more: "<b class='rm-h'>왜 그럴까요?</b>광합성은 세포 속 물질들이 제 모양을 지켜야 일어나요. 온도가 너무 높으면 그 물질들이 변형되어 제 역할을 못 하게 되고, 광합성량이 급하게 떨어져요.<b class='rm-h'>구체적으로 보면</b>세 그래프 중 <b>내려가는 구간이 있는 것은 온도뿐</b>이에요. 그래서 그래프 모양만 보고도 어떤 요인인지 구별할 수 있어요.<b class='rm-h'>시험에서는</b>\"빛과 이산화 탄소가 충분한데 식물이 잘 자라지 않는 온실\" 문제의 답은 <b>온도가 알맞지 않기 때문</b>이에요. 세 요인이 모두 알맞아야 광합성이 활발해진다는 것으로 마무리하면 완벽해요.",
        },
      ],
      note: {
        tone: "bio",
        title: "한 줄 요약",
        html: "빛·이산화 탄소는 <b>증가 후 일정</b>, 온도는 <b>증가 후 급감</b>. 세 가지가 모두 알맞을 때 가장 활발해요.",
      },
      outro: "다음 시간엔 식물의 또 다른 얼굴, 호흡을 만나요.",
      cta: "문제 풀기",
    }),
    mcq({
      prompt: "그림은 환경요인에 따른 광합성량을 나타낸 그래프예요. <b>온도</b>와 광합성량의 관계를 나타낸 것은 무엇인가요?",
      figure: factorGraphFig(),
      shuffle: false,
      options: ["(가)", "(나)", "(다)", "(가)와 (나)", "셋 다 같다"],
      answer: 2,
      explainGood: "맞아요! 온도는 알맞은 값을 넘으면 <b>빠르게 감소</b>해요. 내려가는 구간이 있는 (다)가 온도예요.",
      explainBad: "(가)와 (나)는 늘어나다가 <b>일정</b>해지는 모양이라 빛의 세기·이산화 탄소 농도예요. 온도는 어느 지점부터 <b>급하게 떨어지는</b> (다)랍니다.",
    }),
    ox({
      prompt: "이산화 탄소의 농도가 높을수록 광합성량은 끝없이 계속 증가해요.",
      answer: false,
      explainGood: "맞아요! 어느 농도부터는 더 늘지 않고 <b>일정</b>해져요.",
      explainBad: "재료를 더 넣어도 <b>엽록체의 수가 한정</b>되어 있어서, 일정 농도 이상에서는 광합성량이 더 증가하지 않고 일정해져요.",
    }),
    mcq({
      prompt: "빛을 아주 세게 비추고 이산화 탄소도 충분히 넣어 주었는데도 온실의 식물이 잘 자라지 않아요. 가장 먼저 확인해야 할 것은 무엇인가요?",
      options: ["온실 안의 온도", "전등의 색깔", "화분의 개수", "잎의 개수", "용기의 재질"],
      answer: 0,
      explainGood: "맞아요! 광합성에 영향을 주는 세 요인 중 남은 것은 <b>온도</b>예요.",
      explainBad: "빛과 이산화 탄소는 이미 충분했어요. 남은 환경요인인 <b>온도</b>가 알맞지 않은지 확인해야 해요.",
    }),
    mcq({
      prompt: "빛의 세기를 계속 세게 해도 어느 지점부터 광합성량이 더 늘지 않는 까닭으로 가장 알맞은 것은 무엇인가요?",
      options: [
        "식물세포에 들어 있는 엽록체의 수가 한정되어 있어서",
        "빛이 세지면 엽록소가 빛을 흡수하지 않아서",
        "빛이 셀수록 이산화 탄소가 저절로 줄어들어서",
        "광합성이 밤에만 일어나기 때문에",
        "기공이 완전히 닫혀 버리기 때문에",
      ],
      answer: 0,
      explainGood: "맞아요! 공장의 기계 수가 정해져 있는 것과 같아요. <b>엽록체 수가 한정</b>되어 있어 처리량에 한계가 있어요.",
      explainBad: "엽록소는 빛이 세져도 계속 빛을 흡수해요. 광합성량이 더 늘지 않는 까닭은 <b>엽록체의 수가 한정</b>되어 있기 때문이랍니다.",
    }),
    multi({
      prompt: "광합성에 영향을 미치는 환경요인에 대한 설명으로 옳은 것을 모두 고르세요.",
      options: [
        "빛의 세기가 셀수록 광합성량이 증가하다가 일정해진다",
        "온도는 일정 온도 이상이 되면 광합성량이 빠르게 감소한다",
        "세 요인이 모두 알맞을 때 광합성이 가장 활발하다",
        "온도가 높을수록 광합성량은 언제나 증가한다",
        "이산화 탄소 농도는 광합성량과 관계가 없다",
      ],
      answer: [0, 1, 2],
      explainGood: "맞아요! 빛·이산화 탄소는 <b>증가 후 일정</b>, 온도는 <b>증가 후 급감</b>이에요.",
      explainBad: "온도는 알맞은 값을 넘으면 오히려 <b>빠르게 감소</b>하고, 이산화 탄소는 광합성의 <b>재료</b>라 관계가 깊어요.",
    }),
  ],
});

// ── L6. 식물도 숨을 쉬어요(구판 이식 — 사용자 확정) ─────────
const L6 = lesson({
  id: "g2u5l6",
  unitId: "g2u5",
  title: "식물도 숨을 쉬어요",
  subtitle: "양분에서 생명활동 에너지를 꺼내는 법",
  label: "식물의 호흡",
  icon: "bolt",
  minutes: 11,
  standard: "책 182~185쪽",
  doneNote: "식물 호흡의 재료와 생성물, 에너지의 쓰임을 연결했어요",
  premium: true,
  steps: [
    hook({
      title: "불을 끈 침실에서도<br><em>화분은 살아 있어요</em>",
      lead: "빛이 없는 밤에도 식물 세포는 양분에서 에너지를 계속 얻을까요?",
      narrator: "방의 불을 끄고 식물 세포가 밤에도 활동하는지 살펴보세요.",
      scene: "bedroomplant",
      choices: ["빛을 쓰는 양분 만들기는 멈추지만 산소를 써 에너지를 얻는 일은 계속돼요", "양분 만들기와 에너지 얻기가 모두 완전히 멈춰요", "식물이 산소를 모두 없애 침실을 위험하게 만들어요"],
      done: "식물이 산소를 써 양분에서 에너지를 얻는 이 과정이 <b>호흡</b>이에요. 세포 안에서 어떻게 일어나는지 만나 봐요.",
      cta: "세포 안으로 들어가기",
    }),
    concept({
      kicker: "과학 용어 정복하기",
      kickerTone: "plant",
      title: "호흡은 양분에 저장된<br>에너지를 꺼내는 과정이에요",
      lead: "사람만 숨 쉬는 것이 아니에요. 식물의 살아 있는 세포도 계속 호흡해요.",
      blocks: [
        { k: "figure", svg: cut("plant", "g2u5l4", "밤의 화분을 확대경으로 들여다보는 스틱맨과 잎 세포 안에서 빛나는 마이토콘드리아", [{ text: "밤에도 일하고 있어!", x: 25, y: 16 }]), cap: "빛이 없어 광합성이 멈춘 밤에도 마이토콘드리아의 호흡은 계속돼요." },
        { k: "term", name: "호흡", def: "세포가 <b>포도당과 산소</b>를 이용해 <b>이산화 탄소와 물</b>을 만들며, 포도당에 저장된 에너지를 생명활동에 쓸 수 있게 꺼내는 과정이에요.", icon: "bolt" },
        { k: "p", html: "식물 세포의 호흡은 주로 <b>마이토콘드리아</b>에서 일어나요. 잎뿐 아니라 줄기, 뿌리, 꽃, 열매, 싹처럼 살아 있는 모든 기관의 세포가 호흡해요." },
        { k: "figure", svg: respirationCycleFig(), cap: "광합성에서 생긴 포도당과 산소는 호흡에 쓰일 수 있고, 호흡에서 생긴 이산화 탄소와 물은 다시 광합성 재료가 될 수 있어요." },
        { k: "callout", tone: "amber", title: "호흡과 숨쉬기", html: "기체가 드나드는 것만이 호흡의 전부는 아니에요. 핵심은 세포가 양분에서 <b>생명활동 에너지</b>를 얻는 과정이에요." },
      ],
      cta: "호흡 공방 가동하기",
    }),
    plantRespireLab({
      title: "마이토콘드리아 공방<br>에너지를 꺼내요",
      lead: "포도당과 산소를 넣고, 생기는 물질과 에너지의 쓰임을 확인하세요.",
      cta: "호흡 정리하기",
      curio: {
        q: "뿌리는 땅속에 있는데 산소를 어디에서 얻을까요?",
        a: "흙 알갱이 사이에는 공기가 들어 있어요. 산소가 뿌리 표면으로 확산되어 세포 호흡에 쓰여요. 화분에 물이 늘 가득 차 있으면 공기 틈이 줄어 뿌리가 산소를 얻기 어려워질 수 있어요. 그래서 많은 식물은 <b>배수가 잘되는 흙</b>에서 건강하게 자라요.",
      },
    }),
    recap({
      title: "식물의 호흡,<br>재료와 목적",
      narrator: "무엇이 들어가고, 무엇이 생기며, 왜 필요한지 정리해요.",
      cards: [
        {
          name: "호흡의 물질 변화",
          color: "var(--plant-phloem)",
          art: oldMiniArt("respire"),
          text: "<b>포도당 + 산소</b>를 이용해 <b>이산화 탄소 + 물</b>이 생겨요.",
          examples: ["재료: 포도당·산소", "생성: 이산화 탄소·물", "장소: 마이토콘드리아"],
          more: `<b class='rm-h'>세포 안에서 일어나는 변화</b>식물 세포는 포도당과 산소를 이용해 이산화 탄소와 물을 만들어요. 이 과정은 살아 있는 세포의 마이토콘드리아에서 주로 일어나요. 잎의 세포만이 아니라 빛을 받지 못하는 뿌리와 열매의 세포도 호흡해요.<b class='rm-h'>광합성과 연결하기</b>광합성에서 생긴 포도당과 산소가 호흡의 재료가 될 수 있어요. 호흡에서 생긴 이산화 탄소와 물은 다시 광합성 재료가 될 수 있어요. 물질 이름은 반대 방향처럼 보이지만 장소와 에너지 변화는 서로 달라요.<b class='rm-h'>기체만 보지 않기</b>산소가 들어오고 이산화 탄소가 나가는 현상은 호흡의 결과를 보여 주는 단서예요. 핵심은 세포 안에서 양분이 분해되며 에너지가 사용 가능한 형태로 전달되는 과정이에요.<span class='fun'><b>알고 있나요?</b> 싹이 트는 씨앗은 호흡이 활발해 주변 온도가 조금 오를 수 있어요. 저장 양분의 에너지를 빠르게 꺼내 성장에 쓰기 때문이에요.</span>`,
        },
        {
          name: "호흡의 목적과 시간",
          color: "var(--plant-sun)",
          art: oldMiniArt("cycle"),
          text: "호흡은 <b>낮과 밤 모두</b> 일어나며, 꺼낸 에너지는 생장과 물질 운반 등에 쓰여요.",
          examples: ["낮: 호흡함", "밤: 호흡함", "에너지: 생명활동에 사용"],
          more: `<b class='rm-h'>왜 양분만으로 충분하지 않을까요?</b>포도당에는 에너지가 저장되어 있지만, 식물 세포가 모든 생명활동에 그 에너지를 곧바로 꺼내 쓰는 것은 아니에요. 호흡을 통해 에너지가 사용 가능한 형태로 전달되어야 세포가 물질을 만들고 운반하며 자랄 수 있어요.<b class='rm-h'>언제 일어날까요?</b>호흡은 빛이 필요한 과정이 아니므로 낮과 밤 모두 계속돼요. 낮에는 광합성도 함께 일어날 수 있고, 밤에는 빛이 없어 광합성이 멈춰도 호흡은 이어져요. 살아 있는 기관이라면 잎이 아니어도 호흡해요.<b class='rm-h'>침실 화분 오해</b>밤의 화분도 산소를 조금 사용하지만 화분 한두 개가 방의 산소를 모두 없애지는 않아요. 환기는 사람의 호흡과 실내 공기 질을 위해 중요하지만, 식물 한 포기를 위험한 산소 도둑처럼 보는 것은 과장이에요.<span class='fun'><b>알고 있나요?</b> 수확한 과일도 살아 있는 세포로 이루어져 한동안 호흡해요. 차갑게 보관하면 호흡 속도가 느려져 신선함을 더 오래 유지할 수 있어요.</span>`,
        },
      ],
      cta: "문제 풀기",
    }),
    binSort({
      title: "호흡 공방의<br>입구와 결과를 나눠요",
      lead: "물질과 에너지의 역할을 알맞은 칸에 넣어 보세요.",
      bins: [
        { id: "in", label: "호흡에 필요한 것", color: "var(--plant-oxygen)", hint: "공방으로 들어가요" },
        { id: "out", label: "호흡으로 생기는 것", color: "var(--plant-carbon)", hint: "공방에서 나와요" },
        { id: "use", label: "꺼낸 에너지의 쓰임", color: "var(--plant-sun)", hint: "생명활동을 움직여요" },
      ],
      items: [
        { label: "포도당", bin: "in" }, { label: "산소", bin: "in" },
        { label: "이산화 탄소", bin: "out" }, { label: "물", bin: "out" },
        { label: "새 세포 만들기", bin: "use" }, { label: "물질 운반하기", bin: "use" },
      ],
      explainGood: "정확해요. 포도당과 산소를 이용해 이산화 탄소와 물이 생기며, 꺼낸 에너지는 생장과 운반에 쓰여요.",
      explainBad: "에너지는 호흡의 물질 생성물과 같은 칸이 아니에요. 호흡으로 포도당의 에너지를 꺼내 생명활동에 사용해요.",
    }),
    mcq({
      prompt: "그림의 오른쪽 세포 소기관에서 일어나는 과정에 대한 설명으로 옳은 것은 무엇일까요?",
      figure: respirationCycleFig(),
      options: ["포도당과 산소를 이용해 생명활동에 쓸 에너지를 얻어요", "빛을 받아 이산화 탄소와 물로 포도당을 만들어요", "아이오딘 용액으로 녹말을 만들어요", "밤에는 완전히 멈추고 낮에만 일어나요", "잎의 기공에서만 일어나요"],
      answer: 0,
      explainGood: "맞아요. 오른쪽은 마이토콘드리아의 호흡을 나타내며, 포도당과 산소에서 생명활동에 쓸 에너지를 얻어요.",
      explainBad: "오른쪽은 광합성이 아니라 <b>호흡</b>이에요. 살아 있는 여러 기관의 세포에서 낮과 밤 모두 일어나요.",
    }),
    ox({
      prompt: "빛이 없는 밤에는 식물 세포의 호흡도 멈춰요.",
      answer: false,
      explainGood: "맞아요. 호흡에는 빛이 직접 필요하지 않아 <b>낮과 밤 모두</b> 계속돼요.",
      explainBad: "밤에는 광합성이 멈추지만 호흡은 계속돼요. 세포는 저장 양분에서 에너지를 얻어야 살아갈 수 있어요.",
    }),
    multi({
      prompt: "식물이 호흡으로 얻은 에너지를 사용하는 생명활동을 모두 골라 보세요.",
      options: ["새로운 세포를 만들며 자라기", "필요한 물질을 세포 안팎으로 운반하기", "꽃과 열매를 만들기", "빛을 이산화 탄소로 바꾸기", "아이오딘 용액을 녹말로 바꾸기"],
      answer: [0, 1, 2],
      explainGood: "맞아요. 생장, 물질 운반, 꽃과 열매 형성 같은 활동에는 호흡으로 얻은 에너지가 필요해요.",
      explainBad: "호흡 에너지는 세포의 생명활동에 쓰여요. 빛이나 아이오딘 용액을 다른 물질로 바꾸는 과정이 아니에요.",
    }),
    mcq({
      prompt: "뿌리 세포의 호흡에 대한 설명으로 가장 알맞은 것은 무엇일까요?",
      options: ["흙 알갱이 사이의 산소를 이용해 호흡해요", "빛이 닿지 않으므로 호흡하지 않아요", "흙 자체를 포도당으로 바꾸어 호흡해요", "산소 없이 광합성만으로 에너지를 얻어요", "아이오딘 용액이 있어야 호흡해요"],
      answer: 0,
      explainGood: "맞아요. 뿌리도 살아 있는 세포로 이루어져 흙 틈의 산소를 이용해 호흡해요.",
      explainBad: "호흡에는 빛이 필요하지 않아요. 뿌리 세포도 산소와 포도당을 이용해 에너지를 얻어요.",
    }),
  ],
});

// ── L7. 광합성과 호흡의 맞물림(구판 이식 — 사용자 확정) ─────
const L7 = lesson({
  id: "g2u5l7",
  unitId: "g2u5",
  title: "광합성과 호흡의 맞물림",
  subtitle: "낮과 밤, 기체 흐름이 달라지는 까닭",
  label: "낮과 밤의 식물",
  icon: "swap",
  minutes: 11,
  standard: "책 184~185쪽",
  doneNote: "낮과 밤의 광합성·호흡량을 비교해 순 기체 흐름을 읽었어요",
  premium: true,
  steps: [
    hook({
      title: "잎도 없던 씨앗이<br><em>먼저 싹을 틔웠어요</em>",
      lead: "아직 충분히 광합성할 잎이 없는데 처음 자랄 에너지는 어디에서 왔을까요?",
      narrator: "젖은 솜 위의 씨앗을 며칠 자라게 하고, 싹의 첫 에너지원을 골라 보세요.",
      scene: "germinating",
      choices: ["씨앗에 저장된 양분을 호흡에 사용했어요", "잎이 없어도 광합성만으로 양분을 만들었어요", "솜과 물을 그대로 에너지로 바꾸었어요"],
      done: "광합성은 에너지를 양분에 저장하고, 호흡은 그 에너지를 꺼내요. 두 과정이 하루 동안 어떻게 겹치는지 살펴봐요.",
      cta: "낮과 밤 비교하기",
    }),
    concept({
      kicker: "관계 이해하기",
      kickerTone: "plant",
      title: "광합성은 저장하고<br>호흡은 꺼내 써요",
      lead: "물질 이름만 반대로 외우기보다 에너지가 어디로 가는지 보세요.",
      blocks: [
        { k: "figure", svg: cut("plant", "g2u5l5", "스틱맨이 태양 전지판에서 충전한 배터리로 전등을 켜는 장면", [{ text: "저장했다가 꺼내 쓰는구나", x: 55, y: 14 }]), cap: "광합성은 빛에너지를 양분에 저장하고, 호흡은 양분에 저장된 에너지를 생명활동에 쓸 수 있게 전달해요." },
        { k: "figure", svg: dayNightToggleFig(), cap: "낮과 밤을 눌러 같은 식물에서 달라지는 과정과 기체의 순이동을 비교해요." },
        { k: "list", items: ["<b>낮:</b> 광합성과 호흡이 함께 일어나지만, 강한 빛에서는 광합성량이 더 커요.", "<b>밤:</b> 빛이 없어 광합성은 멈추고 호흡만 계속돼요.", "<b>중요:</b> 낮에 산소가 나온다고 호흡이 멈춘 것은 아니에요. 두 과정을 합친 결과를 보는 거예요."] },
        { k: "callout", tone: "amber", title: "굵은 화살표는 순변화예요", html: "낮에 산소가 밖으로 나온다고 호흡이 멈춘 것은 아니에요. 광합성이 쓰고 만드는 양이 호흡보다 커서, 두 과정을 합친 <b>결과</b>가 그렇게 보이는 거예요." },
      ],
      cta: "하루 다이얼 돌리기",
    }),
    dayNightLab({
      title: "24시간 식물 관측소<br>순 기체 흐름을 찾아요",
      lead: "강한 낮과 빛 없는 밤을 바꾸며 광합성과 호흡의 세기를 비교하세요.",
      cta: "관계 정리하기",
      curio: {
        q: "아주 흐린 낮에는 산소가 꼭 밖으로 나갈까요?",
        a: "빛이 약해 광합성량이 호흡량보다 작으면 낮이어도 순변화는 밤과 비슷할 수 있어요. 광합성량과 호흡량이 같아 순 기체 교환이 거의 없는 빛의 세기도 있어요. 따라서 낮인지 밤인지뿐 아니라 <b>빛의 세기와 두 과정의 크기</b>를 함께 봐야 해요.",
      },
    }),
    recap({
      title: "광합성과 호흡,<br>에너지와 순변화",
      narrator: "각 과정과 두 과정을 합친 결과를 구분해요.",
      cards: [
        {
          name: "서로 다른 에너지 방향",
          color: "var(--plant-sun)",
          art: oldMiniArt("cycle"),
          text: "광합성은 빛에너지를 <b>양분에 저장</b>하고, 호흡은 양분의 에너지를 <b>꺼내 써요.</b>",
          examples: ["광합성: 저장", "호흡: 사용 가능하게 전달", "씨앗: 저장 양분으로 호흡"],
          more: `<b class='rm-h'>광합성의 에너지 길</b>빛에너지는 광합성을 통해 포도당에 화학 에너지로 저장돼요. 그래서 광합성은 식물이 나중에 쓸 에너지 자원을 만드는 과정이라고 볼 수 있어요. 이 과정은 엽록체에서 빛이 있을 때 주로 일어나요.<b class='rm-h'>호흡의 에너지 길</b>호흡은 포도당에 저장된 에너지를 세포가 생명활동에 쓸 수 있는 형태로 전달해요. 마이토콘드리아에서 낮과 밤 모두 일어나며, 잎이 없는 뿌리와 씨앗도 호흡할 수 있어요.<b class='rm-h'>완전한 역과정은 아니에요</b>두 과정의 물질 이름은 서로 이어지지만 장소, 일어나는 조건, 에너지의 방향이 달라요. 단순히 화살표를 뒤집은 같은 과정으로 보면 이 차이를 놓쳐요. 두 과정은 서로 물질을 공급하며 한 식물의 하루 안에서 함께 이어져요.<span class='fun'><b>알고 있나요?</b> 발아하는 씨앗은 잎이 펼쳐지기 전까지 씨앗 속 저장 양분에 의존해요. 잎이 자라 광합성이 활발해지면 스스로 새 양분을 공급하기 시작해요.</span>`,
        },
        {
          name: "낮과 밤의 순 기체 흐름",
          color: "var(--plant-oxygen)",
          art: oldMiniArt("factory"),
          text: "강한 낮에는 보통 <b>광합성량이 호흡량보다 커서</b> 이산화 탄소가 순흡수되고 산소가 순방출돼요.",
          examples: ["강한 낮: 광합성 > 호흡", "밤: 호흡만 계속", "흐린 낮: 크기 비교 필요"],
          more: `<b class='rm-h'>강한 낮의 모습</b>빛이 충분하면 광합성과 호흡이 동시에 일어나요. 보통 광합성이 이산화 탄소를 쓰고 산소를 만드는 양이, 호흡이 산소를 쓰고 이산화 탄소를 만드는 양보다 커요. 그래서 전체 결과로 이산화 탄소가 들어가고 산소가 나와요.<b class='rm-h'>밤의 모습</b>빛이 없으면 광합성은 멈추지만 호흡은 계속돼요. 따라서 전체 결과로 산소가 들어가고 이산화 탄소가 나와요. 이때도 식물이 실내 산소를 순식간에 없애는 것은 아니에요.<b class='rm-h'>순변화라는 말</b>화살표는 각 과정 하나만이 아니라 두 과정을 더하고 뺀 결과일 수 있어요. 흐린 낮처럼 광합성량이 작으면 낮에도 순 기체 흐름이 밤과 비슷해질 수 있어요.<span class='fun'><b>알고 있나요?</b> 광합성량과 호흡량이 같아 순 기체 교환이 거의 없는 순간을 보상 상태라고 생각할 수 있어요. 이때도 두 과정 자체가 멈춘 것은 아니에요.</span>`,
        },
      ],
      cta: "문제 풀기",
    }),
    order({
      title: "에너지의 여행을<br>순서대로 이어요",
      lead: "햇빛에서 어린 싹의 성장까지 이어지는 길이에요.",
      items: ["잎이 빛에너지를 받아요", "광합성으로 포도당에 에너지를 저장해요", "광합성산물이 양분을 필요로 하는 기관으로 이동해요", "호흡으로 양분의 에너지를 꺼내요", "꺼낸 에너지로 새 세포를 만들고 자라요"],
      explainGood: "맞아요. <b>빛 → 광합성 → 양분 이동 → 호흡 → 생명활동</b>으로 에너지가 이어져요.",
      explainBad: "호흡이 먼저 양분을 만드는 것은 아니에요. 광합성이 에너지를 포도당에 저장하고, 호흡이 그 에너지를 꺼내 써요.",
    }),
    mcq({
      prompt: "그림의 강한 낮에 산소가 밖으로 나오는 까닭은 무엇일까요?",
      figure: strongDayFig(),
      options: ["광합성량이 호흡량보다 커 두 과정을 합친 결과로 산소가 남기 때문이에요", "낮에는 식물의 호흡이 완전히 멈추기 때문이에요", "산소가 빛으로 바뀌어 잎 밖으로 밀려나기 때문이에요", "마이토콘드리아가 낮에 사라지기 때문이에요", "기공이 이산화 탄소만 내보내기 때문이에요"],
      answer: 0,
      explainGood: "맞아요. 낮에도 호흡은 하지만, 강한 빛에서는 광합성량이 더 커 산소가 순방출돼요.",
      explainBad: "낮에도 호흡은 계속돼요. 굵은 화살표는 광합성과 호흡을 함께 계산한 <b>순변화</b>예요.",
    }),
    multi({
      prompt: "광합성과 호흡을 비교한 설명 중 옳은 것을 모두 골라 보세요.",
      options: ["광합성은 엽록체에서 주로 일어나요", "호흡은 마이토콘드리아에서 주로 일어나요", "호흡은 낮과 밤 모두 일어나요", "광합성과 호흡은 장소와 에너지 방향까지 완전히 같아요", "밤에는 두 과정이 모두 멈춰요"],
      answer: [0, 1, 2],
      explainGood: "정확해요. 장소와 에너지 방향이 다르고, 호흡은 밤에도 계속돼요.",
      explainBad: "두 과정은 물질로 이어지지만 장소와 에너지 방향이 달라요. 밤에는 광합성만 멈추고 호흡은 이어져요.",
    }),
    ox({
      prompt: "강한 낮에 식물이 이산화 탄소를 순흡수하면, 그 시간에는 호흡을 전혀 하지 않는다는 뜻이에요.",
      figure: oldImg("figs/day-night.webp", "같은 화분을 강한 낮과 빛 없는 밤에 비교한 장면"),
      answer: false,
      explainGood: "맞아요. 낮에도 호흡해요. 광합성량이 더 커서 전체 결과가 이산화 탄소 순흡수로 보일 뿐이에요.",
      explainBad: "순흡수는 두 과정을 합친 결과예요. 호흡이 멈춘 것이 아니라 광합성이 더 활발한 상태예요.",
    }),
    mcq({
      prompt: "잎이 아직 펴지지 않은 씨앗이 싹을 틔울 때 가장 직접적으로 사용하는 것은 무엇일까요?",
      options: ["씨앗에 저장된 양분을 호흡해 얻은 에너지", "솜이 빛을 흡수해 만든 포도당", "흙 전체가 식물 몸으로 바뀐 물질", "밤에만 일어나는 광합성으로 만든 녹말", "아이오딘 용액에서 얻은 산소"],
      answer: 0,
      explainGood: "맞아요. 어린 싹은 씨앗에 저장된 양분을 호흡해 처음 자랄 에너지를 얻어요.",
      explainBad: "잎이 충분히 펴지기 전에는 씨앗 속 저장 양분이 중요한 에너지원이에요. 그 양분을 호흡에 사용해요.",
    }),
  ],
});

// ── L8. 양분의 여행 ─────────────────────────────────────────
const L8 = lesson({
  id: "g2u5l8",
  unitId: "g2u5",
  title: "양분의 여행",
  subtitle: "광합성산물의 저장과 이용",
  label: "양분의 여행",
  icon: "route",
  minutes: 11,
  standard: "책 186~187쪽",
  doneNote: "양분이 만들어져 쓰이고 저장되는 길을 모두 익혔어요",
  premium: true,
  steps: [
    hook({
      title: "꽃꿀의 단맛은 어디서 왔을까",
      lead: "초록색도 아닌 꽃이 만든 달콤함",
      narrator: "벌이 꽃을 찾는 까닭은 달콤한 꽃꿀 때문이죠. 그런데 꽃에는 초록색이 거의 없어요.",
      done: "잎에서 만든 양분이 먼 길을 여행해 온 거예요.",
      scene: "honeyflower",
      cta: "여행 경로 배우기",
    }),
    concept({
      kicker: "이동의 형태",
      kickerTone: "plant",
      title: "녹말에서 설탕으로, 그리고 체관으로",
      lead: "저장할 때와 이동할 때의 모습이 달라요.",
      blocks: [
        { k: "figure", svg: cut("plant2", "g2u5l7", "잎에서 만든 상자를 줄기 미끄럼틀로 내려보내는 스틱맨"), cap: "만든 곳과 쓰는 곳이 달라요." },
        { k: "p", html: "잎의 엽록체에서 만들어진 <b>포도당</b>은 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 저장돼요." },
        { k: "p", html: "엽록체에 저장된 녹말은 주로 <b>밤</b>에 <b>설탕</b>으로 바뀌어 <b>체관</b>을 따라 꽃·열매·뿌리·줄기 등으로 이동해요." },
        { k: "term", name: "체관", def: "잎에서 만든 양분이 이동하는 통로예요. 필요한 기관을 향해 위로도 아래로도 이동해요.", icon: "route" },
        { k: "note", tone: "blue", html: "<b>물관</b>은 뿌리에서 잎으로 <b>물</b>을 올리는 길, <b>체관</b>은 잎에서 각 기관으로 <b>양분</b>을 보내는 길이에요. 둘은 서로 다른 통로예요." },
      ],
      cta: "직접 보내 보기",
    }),
    sugarFlowLab({
      title: "양분을 필요한 곳으로",
      lead: "만들고, 바꾸고, 보내 볼까요",
      cta: "정리하기",
      curio: {
        q: "왜 하필 밤에 설탕으로 바꿔서 보낼까요?",
        a: "낮에는 잎이 광합성으로 바쁘고, 만들어진 포도당을 바로 녹말로 바꿔 <b>쌓아 두는 데</b> 집중해요. 해가 지면 더 만들 수 없으니, 그동안 모아 둔 녹말을 <b>설탕으로 바꿔 밤새 부지런히 실어 나르는</b> 거예요. 덕분에 다음 날 아침이면 뿌리와 열매에도 양분이 도착해 있답니다.",
      },
    }),
    recap({
      title: "오늘의 정리",
      narrator: "만들어진 양분이 어디로 가는지, 이제 지도를 그릴 수 있어요.",
      cards: [
        {
          name: "생성과 저장",
          text: "잎에서 만든 <b>포도당</b>은 <b>녹말</b>로 바뀌어 엽록체에 저장돼요.",
          color: "#8D72D9",
          art: A("starch"),
          examples: ["포도당 → 녹말", "물에 잘 안 녹음"],
          more: "<b class='rm-h'>왜 그럴까요?</b>포도당은 물에 잘 녹아 세포 안을 돌아다녀요. 그대로 두면 농도가 높아져 세포에 부담이 되죠. 그래서 물에 잘 녹지 않는 녹말로 바꿔 잠시 보관해요.<b class='rm-h'>구체적으로 보면</b>낮 동안 잎에 녹말이 쌓이기 때문에, 낮에 딴 잎으로 아이오딘 검정을 하면 청람색이 진하게 나타나요. L3 실험이 바로 이 녹말을 확인한 거예요.<b class='rm-h'>시험에서는</b>\"광합성으로 처음 만들어지는 양분\"은 포도당, \"잎에 저장되는 형태\"는 녹말, \"이동하는 형태\"는 설탕. 이 세 가지를 구분하는 문제가 가장 많이 나와요.",
        },
        {
          name: "이동",
          text: "주로 <b>밤</b>에 <b>설탕</b>으로 바뀌어 <b>체관</b>으로 이동해요.",
          color: "#FF922B",
          art: A("sugar"),
          examples: ["설탕 형태", "체관 · 위아래로"],
          more: "<b class='rm-h'>왜 그럴까요?</b>양분을 옮기려면 물에 녹아야 흐를 수 있어요. 그래서 저장용인 녹말을 다시 물에 잘 녹는 설탕으로 바꿔 체관에 실어 보내요.<b class='rm-h'>구체적으로 보면</b>체관은 잎보다 위에 있는 꽃으로도, 아래에 있는 뿌리로도 양분을 보내요. 물관이 뿌리에서 잎으로 <b>한 방향</b>으로 물을 올리는 것과 다른 점이에요.<b class='rm-h'>시험에서는</b>\"물관과 체관\"을 바꿔 쓴 선택지가 단골이에요. <b>물관 = 물(위로) · 체관 = 양분(양방향)</b>으로 짝지어 외워요.",
        },
        {
          name: "이용과 저장",
          text: "호흡·성장에 <b>이용</b>되고, 나머지는 여러 형태로 <b>저장</b>돼요.",
          color: "#C97B3E",
          art: A("storage"),
          examples: ["뿌리·줄기·열매·씨", "녹말·설탕·단백질·지방"],
          more: "<b class='rm-h'>왜 그럴까요?</b>각 기관에 도착한 양분은 호흡의 재료가 되어 에너지를 내고, 몸을 구성하는 성분이 되어 식물을 자라게 해요. 쓰고 남은 양분은 저장돼 씨가 싹틀 때나 다음 계절에 쓰이지요.<b class='rm-h'>구체적으로 보면</b>고구마는 뿌리에 녹말, 사탕수수는 줄기에 설탕, 포도는 열매에 포도당, 콩은 씨에 단백질, 깨는 씨에 지방으로 저장해요. 종류와 부위에 따라 형태가 달라요.<b class='rm-h'>시험에서는</b>\"광합성산물은 뿌리에만 저장된다\"거나 \"모든 식물이 녹말로만 저장한다\"는 문장은 틀려요. 또 식물에 저장된 양분은 <b>동물의 먹이가 되어</b> 다른 생물에게 에너지를 제공한다는 점도 자주 물어요.",
        },
      ],
      note: {
        tone: "bio",
        title: "한 줄 요약",
        html: "포도당 → <b>녹말</b>(저장) → 밤에 <b>설탕</b>(이동) → 각 기관에서 <b>이용·저장</b>.",
      },
      outro: "이 양분이 결국 우리 밥상까지 온다는 것, 잊지 마세요.",
      cta: "문제 풀기",
    }),
    order({
      title: "양분의 여행 순서",
      lead: "잎에서 만들어진 양분이 뿌리에 저장되기까지예요.",
      items: [
        "잎의 엽록체에서 광합성으로 포도당이 만들어진다",
        "포도당이 녹말로 바뀌어 엽록체에 저장된다",
        "주로 밤에 녹말이 설탕으로 바뀐다",
        "설탕이 체관을 따라 이동한다",
        "도착한 기관에서 이용되거나 저장된다",
      ],
      explainGood: "맞아요! <b>포도당 → 녹말 → 설탕 → 체관 이동 → 이용·저장</b> 순서예요.",
      explainBad: "저장할 때는 녹말, 이동할 때는 설탕이에요. 만들어진 순서대로 <b>포도당 → 녹말 → 설탕</b>을 기억해요.",
    }),
    binSort({
      title: "어떤 형태로 저장할까",
      lead: "저장 형태에 따라 알맞은 통에 넣어 보세요.",
      bins: [
        { id: "starch", label: "녹말", color: "#8D72D9", hint: "감자·고구마" },
        { id: "protein", label: "단백질", color: "#E8A33D", hint: "콩" },
        { id: "fat", label: "지방", color: "#B9A46A", hint: "깨·땅콩" },
      ],
      items: [
        { label: "고구마", bin: "starch", svg: pitem("sweetpotato", "고구마") },
        { label: "감자", bin: "starch", svg: pitem("potato", "감자") },
        { label: "콩", bin: "protein", svg: pitem("soybean", "콩") },
        { label: "깨", bin: "fat", svg: pitem("sesame", "깨") },
        { label: "땅콩", bin: "fat", svg: pitem("peanut", "땅콩") },
      ],
      explainGood: "맞아요! 같은 광합성산물이라도 식물마다 <b>저장 형태가 달라요</b>.",
      explainBad: "고구마와 감자는 녹말, 콩은 단백질, 깨와 땅콩은 지방으로 저장해요. 씨에 저장하는 콩·깨·땅콩도 형태는 서로 다르답니다.",
    }),
    mcq({
      prompt: "잎에서 만들어진 양분이 다른 기관으로 이동할 때의 <b>형태</b>와 <b>통로</b>를 바르게 짝지은 것은 무엇인가요?",
      figure: sugarRouteFig(),
      options: [
        "설탕-체관",
        "녹말-체관",
        "포도당-물관",
        "설탕-물관",
        "녹말-물관",
      ],
      answer: 0,
      explainGood: "맞아요! 이동 형태는 <b>설탕</b>, 통로는 <b>체관</b>이에요.",
      explainBad: "저장 형태가 녹말, 이동 형태가 설탕이에요. 물관은 <b>물</b>이 지나는 길이니 양분의 통로는 <b>체관</b>이랍니다.",
    }),
    mcq({
      prompt: "사과 과수원에서는 열매가 다 자라기 전에 일부를 떼어 내는 솎아주기를 해요. 그 까닭으로 가장 알맞은 것은 무엇인가요?",
      figure: storageFormFig(),
      options: [
        "남은 열매로 양분이 더 많이 가서 크고 달게 자라기 때문에",
        "열매가 많으면 광합성이 아예 멈추기 때문에",
        "떼어 낸 열매에서 새 잎이 자라기 때문에",
        "열매가 많으면 뿌리가 물을 흡수하지 못하기 때문에",
        "열매를 떼어 내면 잎의 호흡이 멈추기 때문에",
      ],
      answer: 0,
      explainGood: "맞아요! 잎이 만든 양분의 양은 정해져 있으니, 열매 수를 줄이면 <b>한 열매가 받는 양분이 늘어나요</b>.",
      explainBad: "광합성이나 호흡이 멈추는 것이 아니에요. 나누어 가질 <b>양분의 총량이 정해져 있기</b> 때문에, 열매 수를 줄이면 남은 열매가 더 크고 달아진답니다.",
    }),
    ox({
      prompt: "광합성으로 만들어진 양분은 뿌리에만 녹말 형태로 저장돼요.",
      answer: false,
      explainGood: "맞아요! 저장 부위도 형태도 식물마다 달라요.",
      explainBad: "사탕수수는 줄기에 설탕, 포도는 열매에 포도당, 콩은 씨에 단백질로 저장해요. <b>부위도 형태도 여러 가지</b>랍니다.",
    }),
  ],
});

export const G2_UNIT5_V2: Unit = {
  id: "g2u5",
  roman: "Ⅴ",
  title: "식물과 에너지",
  subtitle: "광합성부터 양분의 여행까지",
  color: "#27864B",
  icon: "leaf",
  standard: "책 168~197쪽",
  lessons: [L1, L2, L3, L4, L5, L6, L7, L8],
};
