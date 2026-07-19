// judgeKit — 일반사회 문법(사회 Ⅶ에서 확립)의 **단일 진실 공급원**.
// continentMap ContinentDef 계보의 일반사회판: 새 단원(Ⅷ~Ⅻ)은 여기에 def를 추가하는 것이
// 콘텐츠 작업의 전부다(렌더러 judgeLab·dilemmaLab은 파라미터형 — 본체 수정 금지).
//   · JudgeDef  = 사례 판단 랩(judgeLab) — 생활 사례 카드를 한 장씩 개념 판정.
//     교육의 심장은 **오답별 맞춤 교정(traps)** — "왜 그 개념으로 보였을까"를 짚는다.
//     설계 불변식: 한 카드는 정확히 한 개념의 사례(두 개념에 걸치면 설계 결함 — audit이 검사),
//     traps의 키는 answer가 아닌 다른 개념 id, 개념마다 사례 1장 이상.
//   · DilemmaDef = 시나리오 갈림길 랩(dilemmaLab) — "정답 없는 선택"(모든 선택에 gain과 loss가
//     함께 있다 — audit 불변식)과 "정답 있는 판정"(naming — choices[0]=정답, hookAsk 규약)을
//     국면으로 분리한 것이 문법의 핵심. 역할 갈등(Ⅶ L5)이 파일럿.
//   · LifePathDef = 생애 트랙 배치 랩(lifePathLab, Ⅶ 전용) — 사회화 기관을 시기에 배치.
// 민감 가드: 사례 인물은 전부 익명 스틱맨("한 학생이…"), 고정 관념 문장을 카드로 그대로 노출하지
// 않는다(판별·교정 구조 안에서만), 차별 사례는 교과서(미래엔·비상)가 드는 범주·서술 범위만.

export interface JudgeConcept {
  id: string;
  name: string; // 판정 버튼·선반 라벨
  color: string;
  hint: string; // 선반 힌트 한 줄
}

export interface JudgeCase {
  text: string; // 상황 카드(익명 스틱맨 시점)
  answer: string; // 정답 개념 id
  why: string; // 정답 시 helper 한 줄(판별 근거를 굳힌다)
  traps?: Record<string, string>; // 오답 개념 id → 그 오개념을 짚는 교정 문구
  trap?: boolean; // 이 덱의 대표 함정 카드(목표 칩 '함정 통과' 담당 — 덱당 1장)
}

export interface JudgeFinal {
  q: string; // 전 카드 판정 후 한 줄 정리 판정(정답 있는 국면)
  options: string[]; // [0] = 정답(표시 셔플은 렌더러 몫)
  good: string;
  wrong: string; // 오답 교정 후 재시도
}

export interface JudgeDef {
  id: string;
  deck: string; // 카드 뭉치 이름(무대 위 문구)
  concepts: JudgeConcept[];
  cases: JudgeCase[];
  final: JudgeFinal;
  finale: string; // 완주 결론(helper)
  chips: { all: string; trap: string; final: string }; // 목표 칩 라벨 3종
}

export const JUDGES: Record<string, JudgeDef> = {
  // ── Ⅶ L1: 타고난 것 vs 배운 것(사회화) — 비상 도입 활동(본능/배움 구분) 계승 ──
  instinct: {
    id: "instinct",
    deck: "내 하루 관찰 카드",
    concepts: [
      { id: "innate", name: "타고난 것", color: "#C0871C", hint: "세계 어디서 자라도 똑같이" },
      { id: "social", name: "배운 것", color: "#862E9C", hint: "자란 사회마다 다르게" },
    ],
    cases: [
      {
        text: "배가 고프면 배에서 꼬르륵 소리가 난다",
        answer: "innate",
        why: "꼬르륵은 연습한 적이 없죠 — 몸이 스스로 내는 신호예요.",
        traps: { social: "배운 걸까요? 갓난아기도, 세계 어느 나라 사람도 배가 고프면 꼬르륵 — 가르쳐 준 사람이 없는데도요. 몸이 타고난 신호랍니다." },
      },
      {
        text: "밥을 먹을 때 수저를 사용한다",
        answer: "social",
        why: "타고났다면 세계 어디서나 같아야 해요 — 포크를 쓰는 곳, 손으로 먹는 곳이 있죠. 자란 사회에서 배운 거예요.",
        traps: { innate: "타고났다면 지구 어디서나 수저를 써야 해요. 그런데 포크의 나라, 맨손의 나라가 있죠 — 도구 쓰는 법은 자란 사회에서 '배운' 거랍니다." },
      },
      {
        text: "졸리면 저절로 하품이 나온다",
        answer: "innate",
        why: "하품은 배우지 않아도 나와요 — 갓난아기도 하품을 하죠.",
        traps: { social: "하품 학원은 없어요! 갓난아기도, 어느 나라 사람도 졸리면 하품 — 몸이 타고난 반응이에요." },
      },
      {
        text: "웃어른께 존댓말로 인사한다",
        answer: "social",
        why: "말과 예절은 자란 사회에서 배워요 — 쌍둥이 자매의 인사법이 달라진 것도 이 때문이었죠.",
        traps: { innate: "태어날 때부터 존댓말을 안다면, 미국으로 입양된 쌍둥이도 존댓말을 써야 했겠죠? 언어와 예절은 자란 사회에서 배우는 거예요." },
      },
      {
        text: "매운 것을 먹으면 눈물이 난다",
        answer: "innate",
        why: "함정 통과! 몸의 반응이에요 — 참는 법은 배워도, 눈물 자체는 저절로 나죠.",
        traps: { social: "매움 참기 수업을 들은 적 있나요? 눈물이 나는 건 몸이 타고난 반응 — 다만 '꾹 참는 법'은 배울 수 있죠." },
        trap: true,
      },
      {
        text: "초록불이 켜지면 횡단보도를 건넌다",
        answer: "social",
        why: "신호의 약속은 사회가 정한 규칙 — 배우지 않으면 알 수 없어요.",
        traps: { innate: "아기가 태어나자마자 신호등을 알까요? 초록불의 약속은 우리 사회가 정한 규칙이라, 배워야만 알 수 있어요." },
      },
    ],
    final: {
      q: "'배운 것' 카드들의 공통점은 무엇일까요?",
      options: [
        "내가 속한 사회에서 다른 사람들과 지내며 익혔다",
        "태어날 때부터 몸에 새겨져 있었다",
      ],
      good: "바로 그거예요! 이렇게 사회 속에서 살아가는 데 필요한 것들을 배워 나가는 과정 — 그 이름이 <b>사회화</b>랍니다.",
      wrong: "방금 나눈 카드들을 봐요 — 수저질도 존댓말도 신호등도, 태어난 뒤 누군가와 지내며 익힌 것들이었죠. 다시 골라 봐요!",
    },
    finale: "타고난 몸의 신호 위에, 사회에서 배운 것들이 쌓여 지금의 내가 됐어요 — 이 배움의 과정이 <b>사회화</b>예요!",
    chips: { all: "카드 판정", trap: "함정 통과", final: "한 줄 정리" },
  },

  // ── Ⅶ L6: 차이 vs 차별 판별(기함) — 미래엔 141쪽·비상 138쪽 + 비상 마무리 5번 함정 계승 ──
  diffdisc: {
    id: "diffdisc",
    deck: "우리 주변 상황 카드",
    concepts: [
      { id: "diff", name: "차이", color: "#2E8AC0", hint: "다를 뿐 — 존중해요" },
      { id: "disc", name: "차별", color: "#C0392E", hint: "부당한 대우 — 바로잡아요" },
    ],
    cases: [
      {
        text: "왼손으로 글씨를 쓰는 친구가 있다",
        answer: "diff",
        why: "쓰는 손이 다를 뿐이에요 — 서로 같지 않고 다른 것, 그게 차이예요.",
        traps: { disc: "이 카드엔 아직 아무도 부당한 대우를 받지 않았어요 — 왼손으로 쓴다는 건 그저 '다름(차이)'이죠. 차별은 그 다름을 '이유로 부당하게 대우'할 때 생겨요." },
      },
      {
        text: "왼손잡이라는 이유로 모둠 활동에서 빼 버렸다",
        answer: "disc",
        why: "쓰는 손은 모둠 활동과 상관없죠 — 차이를 이유로 부당하게 대우했으니 차별이에요.",
        traps: { diff: "앞 카드와 비교해 봐요 — 이번엔 '다름'에서 멈추지 않고, 그걸 이유로 모둠에서 뺐어요(부당한 대우). 선을 넘는 순간 차이는 차별이 된답니다." },
      },
      {
        text: "나라마다 인사하는 방법이 서로 다르다",
        answer: "diff",
        why: "고개 숙이기, 악수, 포옹 — 문화가 다른 것도 자연스러운 차이예요.",
        traps: { disc: "인사법이 다르다는 사실만으로는 아무도 부당한 대우를 받지 않았어요 — 문화의 다름은 차이랍니다. 그 다름을 이유로 누군가를 얕본다면 그때가 차별이죠." },
      },
      {
        text: "시험 점수가 기준에 못 미쳐 자격증을 받지 못했다",
        answer: "diff",
        why: "함정 통과! 실력이라는 '정당한 기준'에 따른 결과예요 — 부당한 대우가 아니랍니다.",
        traps: { disc: "속상하긴 해도 차별은 아니에요 — 자격증은 '실력'을 확인하는 정당한 기준이니까요. 차별은 일과 상관없는 이유(출신·성별·장애 등)로 부당하게 대우하는 것! 기준에 따른 결과와 구분해요." },
        trap: true,
      },
      {
        text: "같은 일을 했는데 외국인이라는 이유로 임금을 적게 주었다",
        answer: "disc",
        why: "일한 만큼 받는 게 정당한 기준 — 국적은 임금과 상관없는 차이죠. 명백한 차별이에요.",
        traps: { diff: "같은 일에는 같은 임금이 정당한 기준이에요. 국적이라는 '일과 상관없는 차이'를 이유로 적게 주었으니, 이건 다름이 아니라 부당한 대우 — 차별이랍니다." },
      },
      {
        text: "휠체어를 이용한다는 이유로 가게 입장을 거절당했다",
        answer: "disc",
        why: "이동 방법의 차이는 거절의 이유가 될 수 없어요 — 바로잡아야 할 차별이에요.",
        traps: { diff: "휠체어를 이용하는 건 차이가 맞아요. 그런데 이 카드에선 그 차이를 '이유로 입장을 거절'했죠 — 부당한 대우가 더해지는 순간, 차이는 차별이 됩니다." },
      },
      {
        text: "달리기가 빠른 친구도 있고 느린 친구도 있다",
        answer: "diff",
        why: "사람마다 잘하는 게 다른 것 — 수많은 사람이 모이면 차이는 자연스러운 현상이에요.",
        traps: { disc: "빠르고 느린 것 자체는 그저 다름이에요 — 아무도 부당하게 대우받지 않았죠. '느리다는 이유로 아예 못 뛰게 막는다'면 그때가 차별이랍니다." },
      },
    ],
    final: {
      q: "차이와 차별을 가르는 기준은 무엇이었나요?",
      options: [
        "다름을 '이유로 부당하게 대우'했는가",
        "서로 다른 점이 있는가 없는가",
      ],
      good: "정확해요! 다름 자체는 자연스러운 <b>차이</b> — 그 다름을 이유로 부당하게 대우하는 순간 <b>차별</b>이 돼요. 그래서 차별은 적극적으로 바로잡아야 할 문제랍니다.",
      wrong: "다른 점은 언제나, 누구에게나 있어요 — 그것만으로는 차별이 아니었죠. 카드들을 가른 기준은 '부당한 대우'가 있었는가였어요. 다시 골라 봐요!",
    },
    finale: "차이는 존중, 차별은 시정 — 판별하는 눈이 생겼다면, 바로잡는 방법은 다음 시간에!",
    chips: { all: "카드 판정", trap: "함정 통과", final: "기준 세우기" },
  },
};

// ── 시나리오 갈림길(dilemmaLab) ──────────────────────────────
export interface DilemmaChoice {
  id: string;
  label: string; // 선택 버튼
  scene: string; // 선택 직후 장면 한 줄
  gain: string[]; // 얻는 것(전부 채워져 있어야 함)
  loss: string[]; // 잃는 것(전부 채워져 있어야 함 — "정답 없는 선택"의 불변식)
}

export interface DilemmaDef {
  id: string;
  when: string; // 겹친 시각
  intro: string; // 상황 helper
  stakes: { id: string; badge: string; role: string }[]; // 나를 부르는 지위들
  choices: DilemmaChoice[];
  reprompt: string; // 한쪽을 겪은 뒤 다른 갈래 유도
  naming: {
    q: string;
    options: string[]; // [0]=정답
    good: string;
    wrong: string;
    term: string;
    def: string;
  };
  finale: string; // 대응의 지혜(타협점 — 정답 강요 없이)
  chips: { a: string; b: string; name: string };
}

export const DILEMMAS: Record<string, DilemmaDef> = {
  // ── Ⅶ L5: 토요일 오후 2시 — 역할 갈등(미래엔 수아·비상 도윤 사례의 앱판) ──
  doubleday: {
    id: "doubleday",
    when: "토요일 오후 2시",
    intro:
      "나는 우리 반 <b>합창 대회 반주 담당</b>이자, 할머니의 <b>손주</b>예요. 그런데 대회 전 마지막 연습과 할머니 칠순 잔치가 <b>같은 시각</b>에 잡혔어요… 먼저 한쪽을 골라 그 하루를 살아 봐요.",
    stakes: [
      { id: "class", badge: "반주 담당", role: "마지막 연습을 이끌어야 해요" },
      { id: "family", badge: "손주", role: "칠순 잔치에서 축하드려야 해요" },
    ],
    choices: [
      {
        id: "practice",
        label: "연습실로 간다",
        scene: "반주에 맞춰 노랫소리가 착착 맞아 가요. 그런데 연습 내내 잔칫상의 빈 의자가 자꾸 떠올라요…",
        gain: ["반 친구들과의 약속을 지켰어요", "대회 준비를 완성했어요"],
        loss: ["할머니 잔치의 내 자리가 비었어요", "가족들의 서운한 마음"],
      },
      {
        id: "party",
        label: "잔치에 간다",
        scene: "할머니가 내 손을 꼭 잡고 환하게 웃으세요. 그런데 지금쯤 반주 없이 연습하고 있을 친구들 생각에 마음 한쪽이 무거워요…",
        gain: ["할머니의 환한 웃음", "가족과의 소중한 시간"],
        loss: ["반주 없이 진행된 마지막 연습", "친구들에게 미안한 마음"],
      },
    ],
    reprompt: "이번엔 시간을 되감아 <b>다른 갈림길</b>도 걸어 봐요 — 그쪽은 마음이 가벼울까요?",
    naming: {
      q: "두 갈래 모두 걸어 봤어요. 어느 쪽을 골라도 잃는 것이 남았죠 — 왜 이런 곤란이 생겼을까요?",
      options: [
        "내가 가진 두 지위의 역할이 같은 순간에 충돌해서",
        "내가 계획을 게을리 세워서",
      ],
      good: "정확해요! 반주 담당(학급)과 손주(가족) — <b>여러 지위에 따른 역할들이 충돌</b>한 거예요. 이 상황의 이름이 바로 <b>역할 갈등</b>이랍니다.",
      wrong: "달력을 다시 봐요 — 두 일정 모두 내가 미룬 게 아니라, 두 지위가 '같은 시각에' 나를 부른 거예요. 게으름이 아니라 역할들의 충돌이 원인이랍니다.",
      term: "역할 갈등",
      def: "한 사람이 가진 여러 지위에 따른 역할들이 서로 충돌하여 갈등을 일으키는 것",
    },
    finale:
      "역할 갈등엔 '완벽한 답'은 없지만 '지혜로운 길'은 있어요 — ① 어떤 역할들이 부딪히는지 <b>원인을 분석</b>하고 ② 더 중요한 것의 <b>우선순위</b>를 정한 뒤 ③ <b>타협점</b>을 찾는 거죠. 잔치에 가서 축하드리고, 연습 영상을 보며 따로 맞춰 본 뒤 아침 보충을 부탁하는 것처럼요!",
    chips: { a: "연습의 하루", b: "잔치의 하루", name: "이름 붙이기" },
  },
};

// ── 생애 트랙 배치(lifePathLab — Ⅶ 전용) ─────────────────────
export interface LifeStation {
  id: string;
  name: string; // 정거장 이름
  sub: string; // 시기 서브
  learn: string; // 정답 배치 시 helper(무엇을 배우나)
}

export interface LifeAgency {
  id: string;
  name: string;
  station: string | null; // null = 전 구간 띠(대중 매체)
  wrong: Partial<Record<string, string>>; // 오배치 정거장 → 코미디 교정
}

export interface LifePathDef {
  id: string;
  stations: LifeStation[];
  agencies: LifeAgency[];
  mediaHint: string; // 매체 카드를 정거장에 놓았을 때(전 구간 유도)
  mediaDone: string; // 매체 띠 배치 성공
  resocial: {
    intro: string; // 어른 정거장의 새 기기 등장
    q: string;
    options: string[]; // [0]=정답
    good: string;
    wrong: string;
  };
  finale: string;
  chips: { place: string; media: string; reso: string };
}

export const LIFEPATH: LifePathDef = {
  id: "lifepath",
  stations: [
    { id: "baby", name: "아기", sub: "태어나서", learn: "가족의 품에서 <b>말·기본 생활 습관·예절</b>을 배워요 — 가장 기초적인 사회화 기관이에요." },
    { id: "child", name: "어린이", sub: "놀이터에서", learn: "또래 집단과 놀면서 <b>함께 지내는 규칙과 질서</b>를 몸으로 익혀요." },
    { id: "teen", name: "청소년", sub: "학교에서", learn: "학교에서 <b>지식과 규범을 체계적으로</b> 배워요 — 지금 여러분이 서 있는 정거장!" },
    { id: "adult", name: "어른", sub: "일터에서", learn: "직장에서 <b>일에 필요한 지식과 행동 양식</b>을 배워요 — 어른의 배움터죠." },
  ],
  agencies: [
    {
      id: "family", name: "가족", station: "baby",
      wrong: {
        teen: "학교 교실에 온 가족이 다 함께 등교?! 기초 습관은 그보다 훨씬 앞에서 배워요 — 더 어린 시기를 찾아봐요.",
        adult: "일터에 요람을 놓을 순 없죠! 가족의 품이 가장 필요한 시기는 따로 있어요.",
        child: "놀이터도 좋지만 — 말과 숟가락질부터 가르쳐 준 첫 선생님을 떠올려요. 더 어린 시기예요!",
      },
    },
    {
      id: "peer", name: "또래 집단", station: "child",
      wrong: {
        baby: "갓난아기의 친구 모임이라니 귀엽지만… 아직은 옹알이 중! 놀이 규칙을 배우는 건 조금 더 자란 뒤예요.",
        adult: "어른에게도 친구는 소중하지만, '놀이로 규칙을 처음 배우는' 시기는 따로 있죠 — 놀이터가 학교였던 때!",
        teen: "청소년에게도 또래는 중요해요 — 그런데 '놀이로 규칙과 질서를 처음 익히는' 대표 시기는 그보다 앞이에요.",
      },
    },
    {
      id: "school", name: "학교", station: "teen",
      wrong: {
        baby: "아기 입학식이요?! 책가방보다 젖병이 먼저예요 — 학교는 한참 뒤의 정거장이랍니다.",
        child: "예비 소집이 너무 빨라요! 지식과 규범을 '체계적으로' 배우는 정거장은 조금 더 뒤예요.",
        adult: "어른도 배움을 이어 가지만, 교복 입고 다니는 정거장은 지났죠 — 학교가 중심이 되는 시기는 따로 있어요.",
      },
    },
    {
      id: "work", name: "직장", station: "adult",
      wrong: {
        baby: "아기 사원 출근이요?! 기저귀 차고 회의라니… 일을 배우는 정거장은 한참 뒤예요.",
        child: "초등학생 출근은 안 돼요! 일에 필요한 지식을 배우는 건 어른의 정거장이랍니다.",
        teen: "학생의 본업은 아직 배움 — 업무를 배우는 정거장은 그다음이에요.",
      },
    },
  ],
  mediaHint: "여기서도 만나긴 하죠 — 그런데 <b>이 시기에만</b>일까요? 텔레비전과 스마트폰은 아기부터 어른까지… 트랙 <b>전체를 덮는 긴 띠 자리</b>를 찾아봐요!",
  mediaDone: "정답! <b>대중 매체</b>는 특정 시기가 아니라 <b>평생에 걸쳐</b> 우리의 사회화에 영향을 줘요 — 그래서 트랙 전체를 덮는 띠랍니다.",
  resocial: {
    intro: "그런데 어른 정거장에 <b>처음 보는 기계</b>가 나타났어요! 주문도 기계로, 은행도 손안에서… 어른 스틱맨이 당황하고 있어요.",
    q: "어른이 되면 배움은 끝난 걸까요?",
    options: [
      "아니요 — 사회가 변하면 새 지식과 기술을 다시 배워야 해요",
      "네 — 어른은 이미 다 배워서 더 배울 게 없어요",
    ],
    good: "맞아요! 빠르게 변하는 사회에 적응하려고 <b>새로운 지식·기술·가치를 다시 배우는 것</b> — 이걸 <b>재사회화</b>라고 해요. 사회화는 평생 계속된답니다.",
    wrong: "화면 속 어른을 봐요 — 새 기계 앞에서 다시 배우는 중이죠? 사회가 변하는 한 배움엔 졸업이 없어요. 다시 골라 봐요!",
  },
  finale: "가족 → 또래 집단 → 학교 → 직장, 그리고 평생을 함께하는 대중 매체까지 — 나를 키운 <b>사회화 기관</b>의 지도가 완성됐어요!",
  chips: { place: "네 정거장", media: "매체의 자리", reso: "다시 배우기" },
};
