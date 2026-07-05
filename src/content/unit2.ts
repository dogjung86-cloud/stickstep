// 대단원 II. 생물의 구성과 다양성 (중1 교과서, 책 38~75쪽)
// 상호작용을 본격 투입: 세포 라벨링, 현미경 관찰, 구성 단계, 자연선택, 검색표 분류.
import type { Unit } from "./curriculum";
import { concept, table, mcq, ox, multi, order, binSort, hotspot, orgLevels, finchSim, microscope, dichotomKey } from "./dsl";
import { animalCell, plantCell, organism } from "../ui/figures";

// ── 구성 단계용 미니 SVG ────────────────────────────────────
const G = (inner: string) => `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const cellMini = G(`<ellipse cx="80" cy="60" rx="34" ry="28" fill="#F58BA0" stroke="#D9607C" stroke-width="3"/><circle cx="80" cy="60" r="11" fill="#B04A66"/>`);
const tissueMini = G(`<g fill="#F58BA0" stroke="#D9607C" stroke-width="2.5">${[0, 1, 2, 3].map((i) => `<rect x="${34 + i * 24}" y="34" width="20" height="52" rx="9"/>`).join("")}</g><g fill="#B04A66">${[0, 1, 2, 3].map((i) => `<circle cx="${44 + i * 24}" cy="60" r="5"/>`).join("")}</g>`);
const heartMini = G(`<path d="M80 92C50 70 44 52 44 40a18 18 0 0 1 36-4 18 18 0 0 1 36 4c0 12-6 30-36 52z" fill="#E8556B" stroke="#C43A50" stroke-width="3"/>`);
const systemMini = G(`<path d="M80 20v80M80 40c-24 0-30 14-30 30M80 40c24 0 30 14 30 30M80 60c-18 0-22 10-22 26M80 60c18 0 22 10 22 26" fill="none" stroke="#E8556B" stroke-width="4" stroke-linecap="round"/><path d="M80 30a10 10 0 1 1 0 20 10 10 0 0 1 0-20z" fill="#E8556B"/>`);
const dogMini = G(`<g transform="translate(56 28) scale(1.0)"><path d="M6 22c0-9 8-14 18-14s18 5 18 14v18a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="#C98A3C" stroke="#9A6428" stroke-width="3"/><path d="M6 16l-5 12 8-3M42 16l5 12-8-3" fill="#C98A3C" stroke="#9A6428" stroke-width="3" stroke-linejoin="round"/><circle cx="17" cy="26" r="2.6" fill="#3A2410"/><circle cx="31" cy="26" r="2.6" fill="#3A2410"/><circle cx="24" cy="33" r="3" fill="#3A2410"/></g>`);

const leafCellMini = G(`<rect x="48" y="34" width="64" height="52" rx="8" fill="#DCF3DE" stroke="#79B285" stroke-width="4"/><g fill="#5FB878">${[0, 1, 2].map((i) => `<ellipse cx="${64 + i * 20}" cy="${52 + (i % 2) * 16}" rx="8" ry="5"/>`).join("")}</g><circle cx="70" cy="62" r="8" fill="#C39BEA"/>`);
const leafTissueMini = G(`<g fill="#DCF3DE" stroke="#79B285" stroke-width="2.5">${[0, 1, 2, 3].map((i) => `<rect x="${34 + i * 24}" y="36" width="20" height="48" rx="6"/>`).join("")}</g><g fill="#5FB878">${[0, 1, 2, 3].map((i) => `<circle cx="${44 + i * 24}" cy="60" r="5"/>`).join("")}</g>`);
const leafOrganMini = G(`<path d="M80 24c26 4 40 22 40 44-24 2-44-6-52-24M80 24c-26 4-40 22-40 44 24 2 44-6 52-24" fill="#5FB878" stroke="#3B8C3B" stroke-width="3"/><path d="M80 24v72" stroke="#3B8C3B" stroke-width="3"/>`);
const treeMini = G(`<circle cx="80" cy="46" r="30" fill="#4CB07A" stroke="#2C7C45" stroke-width="3"/><rect x="74" y="70" width="12" height="34" rx="3" fill="#8B5A2B"/>`);
const leafOrganWide = G(`<g stroke="#79B285" stroke-width="3"><rect x="30" y="30" width="100" height="20" rx="8" fill="#DCF3DE"/><rect x="30" y="54" width="100" height="20" rx="8" fill="#EAF7EC"/><rect x="30" y="78" width="100" height="16" rx="8" fill="#CDEBD0"/></g>`);

// ══════════════════════════════════════════════════════════
// 레슨 1. 세포
// ══════════════════════════════════════════════════════════
const L1 = {
  id: "u2l1",
  unitId: "u2",
  title: "세포",
  subtitle: "생명활동이 일어나는 기본 단위",
  label: "세포",
  icon: "cell",
  minutes: 7,
  standard: "책 38~41쪽",
  doneNote: "세포의 구조와 기능을 익혔어요",
  steps: [
    concept({
      kicker: "생명의 기본 단위",
      kickerTone: "bio",
      title: "모든 생물은<br><em>세포</em>로 이루어져요",
      lead: "영국의 과학자 훅이 코르크를 현미경으로 보다가 처음 발견했어요. 지구의 모든 생물은 세포로 되어 있고, 그 안에서 생명활동이 일어나요.",
      blocks: [
        { k: "term", name: "세포", def: "<b>생명활동이 일어나는 기본 단위</b>. 세포막·핵·마이토콘드리아 등 여러 구조로 이루어져요.", icon: "cell" },
        { k: "note", tone: "bio", html: "세포는 아주 작아요. 크기를 잴 땐 <b>μm(마이크로미터)</b>를 써요. 1 μm는 1 m의 100만분의 1이에요." },
      ],
    }),
    hotspot({
      title: "동물세포를<br>눌러 보세요",
      lead: "각 부분을 탭하면 이름과 기능이 나타나요. 세 곳을 모두 찾아봐요.",
      svg: animalCell.svg,
      spots: animalCell.spots,
      mode: "reveal",
    }),
    hotspot({
      title: "식물세포는<br>무엇이 <em>다를까?</em>",
      lead: "동물세포에 없던 <b>세포벽</b>과 <b>엽록체</b>가 보여요. 다섯 곳을 눌러 확인해요.",
      svg: plantCell.svg,
      spots: plantCell.spots,
      mode: "reveal",
    }),
    table({
      title: "동물세포 vs 식물세포",
      lead: "공통점도 많지만, 결정적 차이는 두 가지예요.",
      head: ["구조", "동물", "식물"],
      rows: [
        [{ v: "세포막" }, { v: "○", strong: true }, { v: "○", strong: true }],
        [{ v: "핵" }, { v: "○", strong: true }, { v: "○", strong: true }],
        [{ v: "마이토콘드리아" }, { v: "○", strong: true }, { v: "○", strong: true }],
        [{ v: "세포벽" }, { v: "✕" }, { v: "○", strong: true }],
        [{ v: "엽록체" }, { v: "✕" }, { v: "○", strong: true }],
      ],
      blocks: [
        { k: "note", tone: "bio", html: "<b>세포벽·엽록체는 식물세포에만</b> 있어요. 엽록체가 있어 식물은 스스로 양분을 만들 수 있죠." },
      ],
    }),
    mcq({
      n: 1, of: 3,
      prompt: "식물세포의 <b>엽록체</b>가 하는 일로 옳은 것은?",
      options: [
        "물질의 출입을 조절한다",
        "유전물질을 저장한다",
        "빛에너지를 흡수해 광합성으로 양분을 만든다",
        "세포를 단단하게 보호한다",
        "에너지를 만든다",
      ],
      answer: 2,
      explainGood: "맞아요! 엽록체는 초록색을 띠며 <b>광합성</b>으로 양분을 만들어요.",
      explainBad: "엽록체는 <b>광합성</b>을 해요. 물질 출입은 세포막, 유전물질은 핵, 보호는 세포벽, 에너지는 마이토콘드리아가 맡아요.",
    }),
    hotspot({
      title: "핵을 찾아보세요",
      lead: "질문에 맞는 부분을 그림에서 <b>탭</b>하세요.",
      svg: animalCell.svg,
      spots: [
        { x: animalCell.spots[1].x, y: animalCell.spots[1].y, label: "핵" },
        { x: animalCell.spots[2].x, y: animalCell.spots[2].y, label: "마이토콘드리아" },
        { x: animalCell.spots[0].x, y: animalCell.spots[0].y, label: "세포막" },
      ],
      mode: "find",
      explainGood: "완벽해요! 세 부분을 모두 정확히 찾았어요.",
      explainBad: "핵은 가운데 둥근 보라색, 세포막은 바깥 경계, 마이토콘드리아는 콩 모양이에요.",
    }),
    ox({
      n: 2, of: 3,
      prompt: "식물세포에는 있지만 <b>동물세포에는 없는</b> 구조는 세포벽과 엽록체이다.",
      answer: true,
      explainGood: "맞아요! 이 두 가지가 식물세포만의 특징이에요.",
      explainBad: "맞는 설명이에요. <b>세포벽</b>과 <b>엽록체</b>는 식물세포에만 있어요.",
    }),
    mcq({
      n: 3, of: 3,
      prompt: "‘유전물질이 들어 있어 세포의 생명활동을 조절하는’ 구조는?",
      options: ["세포막", "핵", "마이토콘드리아", "세포벽", "엽록체"],
      answer: 1,
      explainGood: "맞아요. <b>핵</b>은 세포의 사령탑이에요.",
      explainBad: "정답은 <b>핵</b>이에요. 유전물질이 들어 있어 생명활동을 조절하죠.",
    }),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 2. 세포 관찰 실험
// ══════════════════════════════════════════════════════════
const L2 = {
  id: "u2l2",
  unitId: "u2",
  title: "세포 관찰 실험",
  subtitle: "현미경으로 세포를 직접 보기",
  label: "세포 관찰 실험",
  icon: "microscope",
  minutes: 7,
  standard: "책 42~43쪽",
  doneNote: "현미경으로 세포를 관찰했어요",
  steps: [
    concept({
      kicker: "직접 해보기",
      kickerTone: "bio",
      title: "세포를<br><em>내 눈으로</em>",
      lead: "세포는 맨눈으로 볼 수 없어요. 현미경으로 관찰하려면 먼저 얇은 <b>표본</b>을 만들어요.",
      blocks: [
        { k: "list", ordered: true, items: [
          "관찰할 재료를 <b>얇게</b> 떼어 받침유리에 올려요",
          "<b>염색액</b>을 떨어뜨려 특정 부분을 물들여요",
          "덮개유리를 비스듬히 덮어 <b>공기 방울</b>이 없게 해요",
        ] },
        { k: "callout", tone: "bio", icon: "flask", title: "염색액", html: "양파 표피세포는 <b>아세트올세인(붉은색)</b>, 입안 상피세포는 <b>메틸렌 블루(푸른색)</b>로 물들여요. 그래야 핵이 잘 보여요." },
      ],
    }),
    microscope({
      title: "양파 표피세포<br>관찰하기",
      lead: "염색 → 대물렌즈 배율 올리기 → 초점 맞추기. 순서대로 조작해 핵을 또렷하게 만들어요.",
      specimen: "onion",
      explainGood: "관찰 성공! 벽돌처럼 규칙적인 세포와 붉게 물든 핵이 보이죠.",
    }),
    concept({
      title: "현미경의 규칙",
      blocks: [
        { k: "term", name: "총배율", def: "<b>접안렌즈 배율 × 대물렌즈 배율</b>. 접안렌즈가 10배, 대물렌즈가 40배면 총배율은 <b>400배</b>예요.", icon: "target" },
        { k: "list", ordered: false, items: [
          "관찰은 <b>저배율 → 고배율</b> 순으로 해요 (넓게 찾고, 자세히)",
          "현미경 속 상은 <b>상하좌우가 바뀌어</b> 보여요",
          "고배율일수록 보이는 세포는 <b>더 크지만 더 적어져요</b>",
        ] },
      ],
    }),
    mcq({
      n: 1, of: 2,
      prompt: "접안렌즈 10배, 대물렌즈 40배로 관찰할 때의 <b>총배율</b>은?",
      options: ["50배", "80배", "400배", "410배", "4배"],
      answer: 2,
      explainGood: "맞아요! 10 × 40 = <b>400배</b>. 총배율은 두 렌즈 배율의 곱이에요.",
      explainBad: "총배율은 <b>접안렌즈 × 대물렌즈</b> = 10 × 40 = <b>400배</b>예요.",
    }),
    ox({
      n: 2, of: 2,
      prompt: "현미경으로 관찰할 때는 <b>고배율에서 저배율</b> 순서로 관찰한다.",
      answer: false,
      explainGood: "맞아요, <b>아니에요</b>! 넓게 찾기 위해 <b>저배율 → 고배율</b> 순으로 관찰해요.",
      explainBad: "순서가 반대예요. 먼저 <b>저배율</b>로 넓게 찾고, 그다음 <b>고배율</b>로 자세히 봐요.",
    }),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 3. 생물의 구성 단계
// ══════════════════════════════════════════════════════════
const L3 = {
  id: "u2l3",
  unitId: "u2",
  title: "생물의 구성 단계",
  subtitle: "세포에서 개체까지",
  label: "생물의 구성 단계",
  icon: "layers",
  minutes: 7,
  standard: "책 44~45쪽",
  doneNote: "생물이 이루어지는 단계를 배웠어요",
  steps: [
    concept({
      kicker: "몸의 조립 순서",
      kickerTone: "bio",
      title: "세포가 모여<br><em>‘나’</em>가 돼요",
      lead: "세포 하나하나가 모여 조직을, 기관을, 마침내 한 생명체(개체)를 이뤄요. 동물의 몸을 아래에서 위로 확대하며 올라가 봐요.",
    }),
    orgLevels({
      title: "동물의 구성 단계",
      lead: "‘더 큰 단위로’ 버튼을 눌러 단계를 올라가요.",
      levels: [
        { name: "세포", example: "근육세포", svg: cellMini, desc: "생명활동이 일어나는 기본 단위예요." },
        { name: "조직", example: "근육조직", svg: tissueMini, desc: "모양과 기능이 <b>비슷한 세포</b>가 모인 단계예요." },
        { name: "기관", example: "심장", svg: heartMini, desc: "여러 조직이 모여 <b>일정한 기능</b>을 하는 단계예요." },
        { name: "기관계", example: "순환계", svg: systemMini, desc: "관련된 기관이 모여 <b>연결된 기능</b>을 해요. (동물에만 있어요)" },
        { name: "개체", example: "강아지", svg: dogMini, desc: "기관계가 모여 <b>독립된 하나의 생명체</b>가 돼요." },
      ],
    }),
    orgLevels({
      title: "식물의 구성 단계",
      lead: "식물은 조금 달라요. ‘기관계’ 대신 <b>조직계</b>가 있어요.",
      levels: [
        { name: "세포", example: "잎살세포", svg: leafCellMini, desc: "광합성이 일어나는 기본 단위예요." },
        { name: "조직", example: "울타리조직", svg: leafTissueMini, desc: "비슷한 세포가 모인 단계예요." },
        { name: "조직계", example: "기본조직계", svg: leafOrganWide, desc: "여러 조직이 모여 <b>조직계</b>를 이뤄요. (식물에만 있어요)" },
        { name: "기관", example: "잎", svg: leafOrganMini, desc: "조직계가 모여 잎·줄기·뿌리 같은 <b>기관</b>이 돼요." },
        { name: "개체", example: "나무", svg: treeMini, desc: "기관이 모여 한 그루의 <b>식물체(개체)</b>가 돼요." },
      ],
    }),
    table({
      title: "동물 vs 식물, 뭐가 달라?",
      lead: "가장 중요한 차이 한 가지!",
      head: ["단계", "동물", "식물"],
      rows: [
        [{ v: "세포·조직" }, { v: "있음", strong: true }, { v: "있음", strong: true }],
        [{ v: "조직계" }, { v: "없음" }, { v: "있음", strong: true }],
        [{ v: "기관계" }, { v: "있음", strong: true }, { v: "없음" }],
        [{ v: "개체" }, { v: "있음", strong: true }, { v: "있음", strong: true }],
      ],
      blocks: [
        { k: "note", tone: "bio", html: "동물엔 <b>기관계</b>, 식물엔 <b>조직계</b>. 이게 두 구성 단계의 핵심 차이예요." },
      ],
    }),
    order({
      title: "동물의 구성 단계<br>순서 맞추기",
      lead: "작은 단위 → 큰 단위 순으로 놓아 보세요.",
      items: ["세포", "조직", "기관", "기관계", "개체"],
      explainGood: "정확해요! <b>세포 → 조직 → 기관 → 기관계 → 개체</b>.",
      explainBad: "동물은 <b>세포 → 조직 → 기관 → 기관계 → 개체</b> 순이에요.",
    }),
    ox({
      prompt: "<b>식물</b>의 구성 단계에는 ‘기관계’가 있다.",
      answer: false,
      explainGood: "맞아요, <b>아니에요</b>! 식물엔 기관계가 없고 <b>조직계</b>가 있어요.",
      explainBad: "식물엔 기관계가 <b>없어요</b>. 대신 <b>조직계</b>가 있죠. 기관계는 동물에만 있어요.",
    }),
    mcq({
      prompt: "‘모양과 기능이 비슷한 세포가 모인’ 구성 단계는?",
      options: ["기관", "조직", "기관계", "개체", "세포"],
      answer: 1,
      explainGood: "맞아요. 비슷한 세포가 모이면 <b>조직</b>이에요.",
      explainBad: "정답은 <b>조직</b>이에요. 비슷한 세포가 모인 단계죠.",
    }),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 4. 생물다양성 (변이 · 자연선택)
// ══════════════════════════════════════════════════════════
const L4 = {
  id: "u2l4",
  unitId: "u2",
  title: "생물다양성",
  subtitle: "변이가 만드는 풍요로운 생명",
  label: "생물다양성",
  icon: "globe",
  minutes: 8,
  standard: "책 50~55쪽",
  doneNote: "변이와 생물다양성의 관계를 이해했어요",
  steps: [
    concept({
      kicker: "다양한 생명",
      kickerTone: "bio",
      title: "생물다양성이란<br><em>무엇</em>일까?",
      lead: "어떤 지역에 살고 있는 <b>생물의 다양한 정도</b>를 생물다양성이라고 해요. 세 가지 측면으로 볼 수 있어요.",
      blocks: [
        { k: "callout", tone: "bio", icon: "globe", title: "생태계의 다양함", html: "숲·바다·갯벌·사막처럼 <b>서식 환경</b>이 다양한 정도예요." },
        { k: "callout", tone: "blue", icon: "paw", title: "종의 다양함", html: "한 지역에 사는 <b>생물 종류</b>가 얼마나 많고 고른지예요." },
        { k: "callout", tone: "violet", icon: "dna", title: "같은 종 안의 다양함", html: "같은 종이라도 개체마다 <b>특징이 다른</b> 정도예요. (유전적 다양성)" },
      ],
    }),
    concept({
      title: "변이:<br>같은 종인데 <em>서로 달라요</em>",
      blocks: [
        { k: "term", name: "변이", def: "<b>같은 종류의 생물 사이</b>에서 나타나는 서로 다른 특징.", icon: "dna" },
        { k: "p", html: "무당벌레의 겉날개 무늬, 바지락 껍데기 색, 사람의 피부색과 지문… 모두 <b>변이</b>예요. 같은 종이라도 완전히 똑같은 개체는 없어요." },
        { k: "note", tone: "violet", html: "이런 변이가 <b>생물다양성의 바탕</b>이 돼요. 변이가 많을수록 환경 변화에 살아남을 개체도 많아지죠." },
      ],
    }),
    finchSim({
      title: "변이가 만드는<br>자연선택",
      lead: "섬을 골라 보세요. 세대를 진행하면 환경에 맞는 부리를 가진 새가 더 많이 살아남아요.",
      goalGen: 3,
    }),
    concept({
      title: "변이에서<br>다양성으로",
      blocks: [
        { k: "p", html: "환경에 <b>적합한 변이</b>를 가진 개체가 더 많이 살아남아 자손을 남겨요. 이 과정이 오래 반복되면 생물은 환경에 <b>적응</b>하고, 서로 다른 종류로 나뉘어요." },
        { k: "callout", tone: "bio", icon: "sparkle", title: "핵심 흐름", html: "<b>변이 → 자연선택 → 적응 → 종 다양성 증가.</b> 다양한 변이가 있어야 이 모든 게 가능해요." },
      ],
    }),
    mcq({
      n: 1, of: 3,
      prompt: "<b>변이</b>에 대한 설명으로 옳은 것은?",
      options: [
        "서로 다른 종 사이의 차이이다",
        "같은 종류의 생물 사이에서 나타나는 서로 다른 특징이다",
        "생물이 사는 환경의 종류이다",
        "생물이 완전히 똑같아지는 현상이다",
        "생물이 멸종하는 것이다",
      ],
      answer: 1,
      explainGood: "정확해요! 변이는 <b>같은 종 안에서</b> 개체마다 나타나는 특징 차이예요.",
      explainBad: "변이는 <b>같은 종류(종)</b> 안에서 개체 사이에 나타나는 특징 차이예요. 종과 종 사이가 아니에요.",
    }),
    multi({
      n: 2, of: 3,
      prompt: "<b>변이</b>의 예로 알맞은 것을 <b>모두</b> 고르세요.",
      options: [
        "무당벌레마다 겉날개 무늬가 다르다",
        "사람마다 지문이 다르다",
        "물이 100 ℃에서 끓는다",
        "같은 종 달팽이의 껍데기 무늬가 제각각이다",
      ],
      answer: [0, 1, 3],
      explainGood: "맞아요! 같은 종 안에서 개체마다 다른 특징이 모두 변이예요.",
      explainBad: "물이 끓는 온도는 변이가 아니에요. 나머지 셋은 <b>같은 종 안의 개체 차이</b>, 즉 변이예요.",
    }),
    ox({
      n: 3, of: 3,
      prompt: "변이가 <b>다양할수록</b> 환경이 변해도 살아남는 개체가 있을 가능성이 커진다.",
      answer: true,
      explainGood: "맞아요! 그래서 변이는 생물다양성과 생존에 아주 중요해요.",
      explainBad: "맞는 설명이에요. 변이가 다양해야 환경 변화에서 <b>살아남는 개체</b>가 있을 가능성이 커져요.",
    }),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 5. 생물의 분류
// ══════════════════════════════════════════════════════════
const kingdomColor = { 원핵생물계: "#8A6BFF", 원생생물계: "#12B886", 균계: "#F0913E", 식물계: "#2FA35F", 동물계: "#3182F6" };
const L5 = {
  id: "u2l5",
  unitId: "u2",
  title: "생물의 분류",
  subtitle: "5계로 나누는 생명의 지도",
  label: "생물의 분류",
  icon: "compass",
  minutes: 9,
  standard: "책 56~63쪽",
  doneNote: "생물을 5계로 분류하는 법을 익혔어요",
  steps: [
    concept({
      kicker: "생명의 정리법",
      kickerTone: "bio",
      title: "무엇을 기준으로<br><em>나눌까?</em>",
      lead: "생물을 고유한 특징으로 무리 지어 나누는 것을 <b>생물분류</b>라고 해요. 겉모습이 아니라 진짜 관계를 봐야 해요.",
      blocks: [
        { k: "p", html: "박쥐는 갈매기처럼 날개가 있지만, 온몸이 털로 덮이고 <b>새끼를 낳아 젖을 먹여</b> 키워요. 그래서 박쥐는 갈매기보다 <b>다람쥐와 더 가까운</b> 사이예요." },
        { k: "note", tone: "bio", html: "분류 기준: 몸의 생김새, 한살이, <b>번식 방법</b>, 광합성 여부 등 생물의 고유한 특징." },
      ],
    }),
    concept({
      title: "‘종’이란<br>무엇일까?",
      blocks: [
        { k: "term", name: "종(species)", def: "자연 상태에서 짝짓기하여 <b>번식 능력이 있는 자손</b>을 낳을 수 있는 생물 무리. 분류의 가장 기본 단위예요.", icon: "paw" },
        { k: "callout", tone: "amber", icon: "swap", title: "말 × 당나귀 = ?", html: "말과 당나귀 사이에서 <b>노새</b>가 태어나지만, 노새는 <b>번식 능력이 없어요.</b> 그래서 말과 당나귀는 <b>다른 종</b>이에요." },
      ],
    }),
    order({
      title: "분류 단계 쌓기",
      lead: "가장 작은 단위부터 큰 단위 순으로 놓아 보세요. (들고양이의 예)",
      items: ["종", "속", "과", "목", "강", "문", "계"],
      explainGood: "완벽해요! <b>종 → 속 → 과 → 목 → 강 → 문 → 계</b>. 위로 갈수록 더 많은 생물을 포함해요.",
      explainBad: "분류 단계는 <b>종 → 속 → 과 → 목 → 강 → 문 → 계</b> 순이에요. 종이 가장 작은 단위죠.",
    }),
    table({
      title: "생물 5계",
      lead: "핵막·세포벽·광합성 여부로 모든 생물을 다섯 무리로 나눠요.",
      head: ["계", "핵막", "특징"],
      rows: [
        [{ v: "원핵생물계", dot: kingdomColor.원핵생물계 }, { v: "없음" }, { v: "단세포, 세포벽 있음" }],
        [{ v: "원생생물계", dot: kingdomColor.원생생물계 }, { v: "있음", strong: true }, { v: "균·식·동이 아닌 무리" }],
        [{ v: "균계", dot: kingdomColor.균계 }, { v: "있음", strong: true }, { v: "세포벽 있음, 분해로 양분" }],
        [{ v: "식물계", dot: kingdomColor.식물계 }, { v: "있음", strong: true }, { v: "엽록체로 광합성" }],
        [{ v: "동물계", dot: kingdomColor.동물계 }, { v: "있음", strong: true }, { v: "세포벽 없음, 운동" }],
      ],
    }),
    dichotomKey({
      title: "검색표로<br>분류하기",
      lead: "예/아니요 질문을 따라가며 각 생물이 어느 계에 속하는지 분류해요.",
      organisms: [
        { name: "대장균", kingdom: "원핵생물계", svg: organism("대장균") },
        { name: "아메바", kingdom: "원생생물계", svg: organism("아메바") },
        { name: "송이버섯", kingdom: "균계", svg: organism("송이버섯") },
        { name: "소나무", kingdom: "식물계", svg: organism("소나무") },
        { name: "붕어", kingdom: "동물계", svg: organism("붕어") },
        { name: "짚신벌레", kingdom: "원생생물계", svg: organism("짚신벌레") },
      ],
      explainGood: "훌륭해요! 검색표는 예/아니요 질문만으로 어떤 생물이든 5계로 분류할 수 있어요.",
      explainBad: "특징을 다시 떠올려 봐요. 핵막·광합성·세포벽·운동성이 분류의 열쇠예요.",
    }),
    binSort({
      title: "생태계 생물<br>5계로 분류하기",
      lead: "우리 주변 생물들을 알맞은 계에 담아 보세요.",
      instruction: "생물 칩을 고른 뒤, 알맞은 계를 눌러요.",
      bins: [
        { id: "원핵생물계", label: "원핵생물계", color: kingdomColor.원핵생물계, hint: "핵막 없음" },
        { id: "원생생물계", label: "원생생물계", color: kingdomColor.원생생물계, hint: "단세포 대부분" },
        { id: "균계", label: "균계", color: kingdomColor.균계, hint: "분해자" },
        { id: "식물계", label: "식물계", color: kingdomColor.식물계, hint: "광합성" },
        { id: "동물계", label: "동물계", color: kingdomColor.동물계, hint: "운동" },
      ],
      items: [
        { label: "젖산균", bin: "원핵생물계", svg: organism("젖산균") },
        { label: "해캄", bin: "원생생물계", svg: organism("해캄") },
        { label: "푸른곰팡이", bin: "균계", svg: organism("푸른곰팡이") },
        { label: "진달래", bin: "식물계", svg: organism("진달래") },
        { label: "꿀벌", bin: "동물계", svg: organism("꿀벌") },
        { label: "박새", bin: "동물계", svg: organism("박새") },
        { label: "고사리", bin: "식물계", svg: organism("고사리") },
        { label: "효모", bin: "균계", svg: organism("효모") },
      ],
      explainGood: "완벽해요! 특징을 기준으로 생태계의 생물을 5계로 깔끔하게 나눴어요.",
      explainBad: "다시 볼까요? 곰팡이·효모는 균계, 광합성하는 진달래·고사리는 식물계, 움직이는 꿀벌·박새는 동물계예요.",
    }),
    mcq({
      n: 1, of: 2,
      prompt: "다음 중 <b>종</b>의 정의로 가장 알맞은 것은?",
      options: [
        "생김새가 비슷한 모든 생물",
        "같은 지역에 사는 생물",
        "짝짓기해 번식 능력이 있는 자손을 낳는 무리",
        "사람이 기르는 생물",
        "세포로 이루어진 모든 생물",
      ],
      answer: 2,
      explainGood: "맞아요! 핵심은 <b>번식 능력이 있는 자손</b>을 낳을 수 있는가예요.",
      explainBad: "종의 기준은 <b>번식 능력이 있는 자손</b>이에요. 그래서 노새를 낳는 말·당나귀는 다른 종이죠.",
    }),
    ox({
      n: 2, of: 2,
      prompt: "버섯과 곰팡이는 광합성을 하지 못하고 분해로 양분을 얻는 <b>균계</b>에 속한다.",
      answer: true,
      explainGood: "맞아요! 버섯·곰팡이·효모는 균계예요. 식물처럼 보여도 광합성을 못 해요.",
      explainBad: "맞는 설명이에요. 버섯·곰팡이는 광합성을 못 하고 분해로 양분을 얻는 <b>균계</b>예요.",
    }),
  ],
};

// ══════════════════════════════════════════════════════════
// 레슨 6. 생물다양성 보전
// ══════════════════════════════════════════════════════════
const L6 = {
  id: "u2l6",
  unitId: "u2",
  title: "생물다양성 보전",
  subtitle: "왜, 그리고 어떻게 지킬까",
  label: "생물다양성 보전",
  icon: "heart",
  minutes: 7,
  standard: "책 64~67쪽",
  doneNote: "생물다양성을 지키는 법을 배웠어요 · II단원 완성!",
  steps: [
    concept({
      kicker: "지켜야 할 이유",
      kickerTone: "bio",
      title: "다양성이<br>우리를 <em>살려요</em>",
      lead: "생물다양성은 인간에게도 아주 소중해요. 종이 다양할수록 생태계가 <b>안정</b>되고, 우리 삶도 풍요로워져요.",
      blocks: [
        { k: "callout", tone: "bio", icon: "layers", title: "생태계 안정", html: "먹이 관계가 <b>그물처럼 복잡</b>할수록, 한 종이 사라져도 생태계가 쉽게 무너지지 않아요." },
        { k: "callout", tone: "blue", icon: "heart", title: "삶의 바탕", html: "식량, <b>의약품</b>의 원료, 깨끗한 공기와 물… 모두 다양한 생물에서 얻어요." },
      ],
    }),
    concept({
      title: "무엇이 다양성을<br><em>위협</em>할까?",
      blocks: [
        { k: "list", ordered: false, items: [
          "<b>서식지 파괴</b> — 숲·습지가 사라지는 가장 큰 원인",
          "<b>남획</b> — 지나친 사냥·채집",
          "<b>외래 생물</b> — 큰입배스처럼 들어와 토종을 위협",
          "<b>환경 오염과 기후 변화</b>",
        ] },
        { k: "note", tone: "amber", html: "이 중 <b>서식지 파괴</b>가 생물다양성 감소의 가장 큰 원인이에요." },
      ],
    }),
    binSort({
      title: "보전 노력,<br>누구의 몫일까?",
      lead: "생물다양성을 지키는 노력은 여러 수준에서 이루어져요.",
      instruction: "각 활동을 알맞은 수준에 담아요.",
      bins: [
        { id: "personal", label: "개인적 노력", color: "#3182F6" },
        { id: "social", label: "사회·국가적 노력", color: "#12B886" },
        { id: "global", label: "국제적 노력", color: "#8A6BFF" },
      ],
      items: [
        { label: "장바구니 쓰기", bin: "personal" },
        { label: "멸종위기종 알리기", bin: "personal" },
        { label: "국립공원·보호구역 지정", bin: "social" },
        { label: "종자은행 운영", bin: "social" },
        { label: "생물다양성 협약 체결", bin: "global" },
        { label: "람사르 습지 보호", bin: "global" },
      ],
      explainGood: "좋아요! 개인의 작은 실천부터 국가·국제 협약까지, <b>모든 수준</b>의 노력이 필요해요.",
      explainBad: "다시 볼까요? 보호구역·종자은행은 사회·국가, 국제 협약(생물다양성 협약·람사르)은 국제 수준이에요.",
    }),
    mcq({
      n: 1, of: 3,
      prompt: "생물다양성 감소의 <b>가장 큰 원인</b>으로 꼽히는 것은?",
      options: ["햇빛의 세기 변화", "서식지 파괴", "달의 위상 변화", "화산 폭발", "지구 자전"],
      answer: 1,
      explainGood: "맞아요. 숲·습지 같은 <b>서식지 파괴</b>가 가장 큰 원인이에요.",
      explainBad: "가장 큰 원인은 <b>서식지 파괴</b>예요. 생물이 살 곳이 사라지는 것이죠.",
    }),
    multi({
      n: 2, of: 3,
      prompt: "생물다양성이 <b>인간에게 주는 가치</b>로 알맞은 것을 <b>모두</b> 고르세요.",
      options: [
        "다양한 식량 자원을 얻는다",
        "의약품의 원료를 얻는다",
        "생태계가 더 안정된다",
        "지하자원이 저절로 늘어난다",
      ],
      answer: [0, 1, 2],
      explainGood: "정확해요! 식량·의약품·생태계 안정 모두 생물다양성 덕분이에요.",
      explainBad: "지하자원은 생물다양성과 관계없어요. 나머지 셋은 모두 다양성이 주는 가치예요.",
    }),
    ox({
      n: 3, of: 3,
      prompt: "외래 생물은 언제나 생태계에 이로우므로 많이 들여올수록 좋다.",
      answer: false,
      explainGood: "맞아요, <b>아니에요</b>! 큰입배스처럼 외래 생물이 <b>토종을 위협</b>해 다양성을 해칠 수 있어요.",
      explainBad: "외래 생물은 토종 생물을 위협해 <b>생물다양성을 줄일</b> 수 있어요. 신중해야 해요.",
    }),
    concept({
      title: "II단원, 정복 완료!",
      lead: "세포에서 시작해 생명의 다양성과 그 보전까지 모두 배웠어요. 정말 멋진 여정이었어요.",
      blocks: [
        { k: "callout", tone: "bio", icon: "trophy", title: "다음 여정", html: "이제 여러분은 생명을 <b>구조·다양성·책임</b>의 눈으로 볼 수 있어요. 다음 단원에서 또 만나요!" },
      ],
    }),
  ],
};

export const UNIT2: Unit = {
  id: "u2",
  roman: "II",
  title: "생물의 구성과 다양성",
  subtitle: "세포에서 생태계까지, 생명의 짜임을 탐험해요",
  color: "#12B886",
  icon: "cell",
  standard: "2022 개정 교육과정",
  lessons: [L1, L2, L3, L4, L5, L6],
};
