// hookHis4 — 역사① Ⅳ 단원(지역 세계의 교류와 변화) 훅 장면 9종.
// hook.ts의 디스패처가 renderHis4 하나만 불러 쓴다(hookHis2·hookHis3의 서브 디스패처 문법 계승).
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hh4-(styles/his.css).
//   penmotto    L1 — 급훈 액자 "펜은 칼보다 강하다": 붓을 우대한 나라의 결과(송 문치주의)
//   banknote    L2 — 지갑 속 지폐: 세계 최초의 지폐는 어디서(송 교자)
//   gercamp     L3 — 캠핑장의 게르: 이동식 집의 주인들이 세운 대제국(몽골)
//   chilikimchi L5 — 고춧가루 김치: 고추의 고향(아메리카 → 명·청 유입, 세계 교역망)
//   shogungame  L6 — 게임 속 쇼군: 천황 대신 실권을 쥔 무사 정권(막부)
//   tajphoto    L7 — 여행 사진 타지마할: 왕비를 추모한 묘당(무굴 인도·이슬람 문화)
//   coffeesign  L8 — 카페 골목 간판: 커피 파는 가게의 원조(오스만 커피 하우스)
//   frychoco    L9 — 감자튀김과 초콜릿: 감자·카카오의 고향(신항로 개척)
//   assembly    L10 — 뉴스 속 의회: 법과 세금을 의회가 정하는 원칙의 뿌리(명예혁명)
// 훅 문법: 조작 먼저 → 예측은 공용 ask()(choices[0]=정답, good≠bad — 오답은 오개념 교정).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpts = { choices?: string[] };

/* ── L1: 급훈 액자(penmotto) ───────────────────────────────── */
function renderPenmotto(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-motto" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-mt-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F1E4"/><stop offset="1" stop-color="#E6DCC4"/></linearGradient>
        <linearGradient id="hh4-mt-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8E5E"/><stop offset="1" stop-color="#2A6844"/></linearGradient>
        <linearGradient id="hh4-mt-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8C48A"/><stop offset=".55" stop-color="#C89A5E"/><stop offset="1" stop-color="#9A6E32"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-mt-wall)"/>
      <rect x="30" y="76" width="240" height="104" rx="10" fill="url(#hh4-mt-board)" stroke="#1E4A30" stroke-width="2.4"/>
      <ellipse cx="150" cy="196" rx="120" ry="7" fill="#4A2A08" opacity=".10"/>
      <g class="hh4-mt-frame" role="button" tabindex="0" aria-label="교실 급훈 액자 — 탭해서 크게 보기">
        <rect x="86" y="20" width="128" height="44" rx="6" fill="url(#hh4-mt-frame)" stroke="#6E4A1E" stroke-width="2"/>
        <rect x="93" y="26" width="114" height="32" rx="4" fill="#FFFDF6" stroke="#D8C8A4" stroke-width="1.4"/>
        <text x="150" y="46" text-anchor="middle" font-size="11.5" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">펜은 칼보다 강하다</text>
        <ellipse cx="102" cy="26" rx="7" ry="2.2" fill="#fff" opacity=".55"/>
      </g>
      <g class="hh4-mt-duo" opacity="0">
        <g transform="rotate(-24 118 128)">
          <path d="M104 146 l22 -34" stroke="#33405A" stroke-width="3" stroke-linecap="round"/>
          <path d="M126 112 l6 -9 2 11 z" fill="#33405A"/>
        </g>
        <g transform="rotate(18 182 128)">
          <rect x="178" y="104" width="8" height="34" rx="3" fill="#B9C4D4" stroke="#5E6A7A" stroke-width="1.6"/>
          <rect x="174" y="136" width="16" height="7" rx="3" fill="#8A6534" stroke="#5E4626" stroke-width="1.4"/>
          <path d="M182 143 v10" stroke="#5E4626" stroke-width="3" stroke-linecap="round"/>
        </g>
        <text x="150" y="168" text-anchor="middle" font-size="12" font-weight="900" fill="#FFE8B0" font-family="Pretendard, sans-serif">붓 &gt; 칼 ?</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="48" cy="128" r="9" fill="#FFE8CE"/>
        <path d="M48 137 v24 M48 144 l12 6 M48 144 l-12 4 M48 161 l-8 15 M48 161 l8 15"/>
        <path d="M43 126 q2 -3 5 -1" stroke-width="1.8"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "교실 벽에 걸린 급훈 액자 — <b>「펜은 칼보다 강하다」</b>. 흔한 말이죠? <b>액자를 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const frame = fig.querySelector(".hh4-mt-frame") as SVGGElement;
  const zoom = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "그런데 이 말을 <b>진짜 나라의 설계도</b>로 삼은 왕조가 있었어요 — 약 천 년 전 중국의 <b>송</b>! 칼 대신 붓, 무관 대신 <b>문관</b>을 우대했죠. 그 결과는 어땠을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "군사력이 약해져서, 이웃 나라에 물자를 주며 평화를 지켰다",
          "전쟁마다 이기는 최강의 군대를 갖게 되었다",
          "화가 난 무관들이 반란을 일으켜 금방 망했다",
        ],
        good: "정확한 예측! 문치주의로 나라는 안정됐지만 <b>군사력이 약해졌고</b>, 송은 북방 민족의 나라들에 <b>비단과 은 같은 물자를 주는 조건으로 평화</b>를 샀어요. 붓의 나라의 빛과 그림자 — 지금 만나러 가요!",
        bad: "반대예요 — 붓을 앞세운 대가로 <b>군사력이 약해졌</b>거든요. 그렇다고 금방 망하지도 않았어요. 송은 요·서하 같은 북방 민족의 나라에 <b>물자를 주며 평화를 유지</b>하는 길을 택했답니다. 그 빛과 그림자를 만나러 가요!",
        onDone: finish,
      });
    }, 950);
  };
  frame.addEventListener("click", zoom);
  frame.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L2: 지갑 속 지폐(banknote) ────────────────────────────── */
function renderBanknote(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-note" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-bn-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A76C"/><stop offset="1" stop-color="#A87A42"/></linearGradient>
        <linearGradient id="hh4-bn-wallet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7E5A3A"/><stop offset=".55" stop-color="#5E3E22"/><stop offset="1" stop-color="#42280F"/></linearGradient>
        <linearGradient id="hh4-bn-bill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DCE8D4"/><stop offset=".5" stop-color="#C2D8B4"/><stop offset="1" stop-color="#A8C49A"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-bn-desk)"/>
      <ellipse cx="150" cy="168" rx="110" ry="10" fill="#4A2A08" opacity=".16"/>
      <g class="hh4-bn-wallet" role="button" tabindex="0" aria-label="지갑 — 탭해서 열기">
        <rect x="86" y="92" width="128" height="72" rx="12" fill="url(#hh4-bn-wallet)" stroke="#2E1A06" stroke-width="2.2"/>
        <path d="M86 116 h128" stroke="#2E1A06" stroke-width="2"/>
        <circle cx="196" cy="128" r="6" fill="#C89A5E" stroke="#6E4A1E" stroke-width="1.6"/>
        <ellipse cx="104" cy="100" rx="12" ry="3" fill="#fff" opacity=".18"/>
      </g>
      <g class="hh4-bn-bill">
        <rect x="94" y="52" width="112" height="52" rx="6" fill="url(#hh4-bn-bill)" stroke="#5E7A4E" stroke-width="2"/>
        <circle cx="150" cy="78" r="16" fill="none" stroke="#5E7A4E" stroke-width="1.8"/>
        <path d="M104 62 h20 M176 92 h20" stroke="#5E7A4E" stroke-width="2" stroke-linecap="round"/>
        <circle cx="150" cy="78" r="8" fill="#8FAE7E" opacity=".5"/>
        <ellipse cx="112" cy="58" rx="10" ry="2.4" fill="#fff" opacity=".5"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="46" cy="120" r="9" fill="#FFE8CE"/>
        <path d="M46 129 v24 M46 136 l13 8 M46 136 l-12 3 M46 153 l-8 16 M46 153 l8 16"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "용돈 받는 날! 지갑 속 <b>지폐</b> — 이 얇은 종이 한 장이 동전 수백 개의 값을 하죠. <b>지갑을 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const wallet = fig.querySelector(".hh4-bn-wallet") as SVGGElement;
  const open = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.tap);
    fig.classList.add("open");
    face("curious");
    helper.innerHTML = "종이가 돈이 되는 마법 — 그럼 <b>세계 최초의 지폐</b>는 언제, 어디서 태어났을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "약 천 년 전 중국의 송 — 교자라는 종이돈",
          "몇백 년 전 유럽의 은행이 최초",
          "고대 이집트의 파피루스 돈이 최초",
        ],
        good: "맞아요! 세계 최초의 지폐는 송의 <b>교자</b>예요. 장사가 어찌나 활발했는지 무거운 동전으론 감당이 안 돼서 종이돈이 태어났죠 — 상업과 발명의 나라 송의 경제 속으로 들어가요!",
        bad: "유럽도 이집트도 아니에요 — 정답은 <b>약 천 년 전 중국의 송</b>! 상업이 크게 발달해 무거운 동전 대신 <b>교자</b>라는 종이돈이 태어났죠. 지폐를 만들 만큼 흥성였던 송의 경제 속으로 들어가요!",
        onDone: finish,
      });
    }, 950);
  };
  wallet.addEventListener("click", open);
  wallet.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); open(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L3: 캠핑장의 게르(gercamp) ────────────────────────────── */
function renderGercamp(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-ger" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-gr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3D66"/><stop offset="1" stop-color="#5E6A9E"/></linearGradient>
        <linearGradient id="hh4-gr-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E8E5E"/><stop offset="1" stop-color="#3E6844"/></linearGradient>
        <linearGradient id="hh4-gr-tent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".6" stop-color="#E8E0CC"/><stop offset="1" stop-color="#C4B89C"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="128" rx="12" fill="url(#hh4-gr-sky)"/>
      <rect x="6" y="126" width="288" height="78" rx="10" fill="url(#hh4-gr-grass)"/>
      <circle cx="252" cy="34" r="10" fill="#FFE8B0" opacity=".9"/>
      <circle cx="60" cy="28" r="1.6" fill="#fff" opacity=".8"/><circle cx="96" cy="44" r="1.3" fill="#fff" opacity=".7"/><circle cx="200" cy="24" r="1.5" fill="#fff" opacity=".8"/>
      <ellipse cx="150" cy="164" rx="86" ry="9" fill="#1E2E1E" opacity=".28"/>
      <g class="hh4-gr-tent" role="button" tabindex="0" aria-label="둥근 텐트 게르 — 탭해서 들여다보기">
        <path d="M84 118 q66 -44 132 0 l0 10 h-132 z" fill="url(#hh4-gr-tent)" stroke="#8A7A56" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="82" y="126" width="136" height="38" rx="6" fill="url(#hh4-gr-tent)" stroke="#8A7A56" stroke-width="2.2"/>
        <path d="M96 126 v38 M124 126 v38 M178 126 v38 M206 126 v38 M92 144 h116" stroke="#B0A480" stroke-width="1.4" opacity=".7"/>
        <rect x="140" y="132" width="22" height="32" rx="4" fill="#6E4A26" stroke="#42280F" stroke-width="1.8"/>
        <circle cx="150" cy="104" r="7" fill="#C4B89C" stroke="#8A7A56" stroke-width="1.8"/>
        <g class="hh4-gr-glow" opacity="0"><rect x="142" y="134" width="18" height="28" rx="3" fill="#FFD98A"/></g>
        <g class="hh4-gr-smoke" stroke="#D8D2C0" stroke-width="2.2" stroke-linecap="round" opacity="0">
          <path d="M150 96 q4 -8 0 -15 q-4 -7 1 -13"/>
        </g>
        <ellipse cx="112" cy="112" rx="12" ry="3" fill="#fff" opacity=".5"/>
      </g>
      <path d="M52 176 q6 -8 12 0 M236 180 q6 -8 12 0" stroke="#2E4E2E" stroke-width="1.8" fill="none" opacity=".7"/>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="48" cy="140" r="9" fill="#FFE8CE"/>
        <path d="M48 149 v22 M48 155 l12 7 M48 155 l-12 5 M48 171 l-8 15 M48 171 l8 15"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "가족 캠핑장에서 발견한 <b>둥근 텐트</b> — 초원 유목민의 이동식 집 <b>게르</b>를 본뜬 숙소래요. <b>텐트를 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const tent = fig.querySelector(".hh4-gr-tent") as SVGGElement;
  const peek = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.tap);
    fig.classList.add("lit");
    face("curious");
    helper.innerHTML = "아늑하다! 그런데 놀라운 사실 — 이런 <b>이동식 집에 살던 초원의 유목민</b>이 역사상 가장 넓은 육지 제국을 만들었대요. 대체 어떻게요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "말의 기동력에 천 명 단위의 조직력을 더해서",
          "높은 성벽을 쌓고 지키기만 해서",
          "농사를 잘 지어 인구가 훨씬 많아서",
        ],
        good: "정확해요! 말 위에서 먹고 자는 <b>기마 군단의 기동력</b>, 그리고 유목민을 천 명 단위로 묶은 <b>천호제의 조직력</b> — 칭기즈 칸의 몽골은 이 두 바퀴로 유라시아를 내달렸어요. 초원의 제국으로!",
        bad: "성을 쌓거나 농사를 짓는 건 유목민의 방식이 아니에요 — 비밀은 <b>말의 기동력</b>과 유목민을 천 명 단위로 묶은 <b>천호제의 조직력</b>이었죠. 칭기즈 칸의 몽골이 유라시아를 내달린 이야기, 지금 시작해요!",
        onDone: finish,
      });
    }, 950);
  };
  tent.addEventListener("click", peek);
  tent.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); peek(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L5: 고춧가루 김치(chilikimchi) ────────────────────────── */
function renderChilikimchi(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-kimchi" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-km-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0E6D2"/><stop offset="1" stop-color="#D8C8A8"/></linearGradient>
        <linearGradient id="hh4-km-bowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D4DAE4"/></linearGradient>
        <linearGradient id="hh4-km-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E86A50"/><stop offset=".5" stop-color="#D04A34"/><stop offset="1" stop-color="#A83220"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-km-table)"/>
      <ellipse cx="132" cy="152" rx="92" ry="10" fill="#4A2A08" opacity=".12"/>
      <g class="hh4-km-bowl" role="button" tabindex="0" aria-label="김치 그릇 — 탭해서 살펴보기">
        <path d="M62 108 h140 l-12 44 q-2 8 -12 8 h-92 q-10 0 -12 -8 z" fill="url(#hh4-km-bowl)" stroke="#8A96A6" stroke-width="2.2" stroke-linejoin="round"/>
        <g>
          <path d="M76 108 q8 -18 24 -12 q4 -10 18 -8 q14 -2 18 8 q16 -6 24 12 z" fill="url(#hh4-km-red)" stroke="#7E2214" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M92 100 q6 -3 10 0 M126 94 q6 -3 10 0 M156 102 q6 -3 10 0" stroke="#F6C8A0" stroke-width="2" stroke-linecap="round"/>
        </g>
        <ellipse cx="84" cy="116" rx="10" ry="3" fill="#fff" opacity=".55"/>
      </g>
      <g class="hh4-km-zoom" opacity="0">
        <circle cx="232" cy="76" r="38" fill="#FFF8EC" stroke="#C2843A" stroke-width="2.4"/>
        <path d="M222 60 q10 -8 18 2 q8 10 -2 24 q-8 10 -16 2 q-8 -8 0 -28 z" fill="url(#hh4-km-red)" stroke="#7E2214" stroke-width="1.8"/>
        <path d="M226 58 q4 -6 10 -4" stroke="#3E6844" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="212" cy="92" r="2.2" fill="#D04A34"/><circle cx="222" cy="98" r="1.8" fill="#D04A34"/><circle cx="246" cy="94" r="2" fill="#D04A34"/>
        <path d="M232 114 v10 M206 102 l-8 6" stroke="#C2843A" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="46" cy="76" r="9" fill="#FFE8CE"/>
        <path d="M46 85 v24 M46 92 l12 8 M46 92 l-12 4 M46 109 l-8 16 M46 109 l8 16"/>
        <path d="M41 74 q2 -3 5 -1" stroke-width="1.8"/>
      </g>
      <rect x="56" y="168" width="46" height="10" rx="5" fill="#C4B89C" stroke="#8A7A56" stroke-width="1.4"/>
      <rect x="108" y="168" width="46" height="10" rx="5" fill="#C4B89C" stroke="#8A7A56" stroke-width="1.4"/>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "저녁 밥상의 주인공, 새빨간 <b>김치</b>! 그런데 아주 옛날 김치는 <b>빨갛지 않았대요</b>. <b>그릇을 탭</b>해 비밀을 봐요!";

  let done = false;
  let timer = 0;
  const bowl = fig.querySelector(".hh4-km-bowl") as SVGGElement;
  const zoom = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("surprised");
    helper.innerHTML = "김치를 빨갛게 만든 건 <b>고추</b> — 그런데 고추는 원래 한반도는 물론 아시아 어디에도 없던 작물이에요! 고추의 고향은 어디일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "바다 건너 아메리카 대륙",
          "한반도의 토종 작물",
          "인도의 향신료 밭",
        ],
        good: "맞아요! 고추의 고향은 <b>아메리카</b> — 새로 열린 뱃길을 타고 세계로 퍼졌고, 명·청의 중국에도 담배·옥수수와 함께 들어왔어요. 은과 상품이 지구를 도는 시대, 그 교역망 속으로 들어가요!",
        bad: "토종도, 인도도 아니에요 — 고추의 고향은 <b>바다 건너 아메리카</b>랍니다! 새로 열린 뱃길을 타고 세계로 퍼져 명·청의 중국에도, 우리 밥상에도 도착했죠. 은과 상품이 지구를 도는 교역망 이야기로 들어가요!",
        onDone: finish,
      });
    }, 950);
  };
  bowl.addEventListener("click", zoom);
  bowl.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L6: 게임 속 쇼군(shogungame) ──────────────────────────── */
function renderShogungame(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-shogun" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-sg-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33405A"/><stop offset="1" stop-color="#1E2838"/></linearGradient>
        <linearGradient id="hh4-sg-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2E7CE"/><stop offset="1" stop-color="#D8C8A4"/></linearGradient>
        <linearGradient id="hh4-sg-armor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A96B4"/><stop offset=".55" stop-color="#5E6A8C"/><stop offset="1" stop-color="#3E4864"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-sg-room)"/>
      <g class="hh4-sg-tv" role="button" tabindex="0" aria-label="게임 화면 — 탭해서 크게 보기">
        <rect x="44" y="24" width="212" height="128" rx="10" fill="#12161E" stroke="#0A0E14" stroke-width="3"/>
        <rect x="52" y="32" width="196" height="112" rx="6" fill="url(#hh4-sg-scr)"/>
        <path d="M52 118 q40 -14 98 -8 q58 6 98 -4 l0 38 h-196 z" fill="#B4A47C" opacity=".6"/>
        <circle cx="216" cy="56" r="12" fill="#E05A48" opacity=".85"/>
        <g class="hh4-sg-man">
          <path d="M138 74 l12 -12 h14 l12 12 l-6 8 h-26 z" fill="url(#hh4-sg-armor)" stroke="#242C42" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M132 60 q18 -12 50 0 l-7 8 q-18 -8 -36 0 z" fill="#3E4864" stroke="#242C42" stroke-width="1.6"/>
          <circle cx="157" cy="76" r="8" fill="#FFE8CE" stroke="#242C42" stroke-width="1.6"/>
          <path d="M143 84 h28 l6 34 h-40 z" fill="url(#hh4-sg-armor)" stroke="#242C42" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M146 92 h22 M145 100 h24 M144 108 h26" stroke="#242C42" stroke-width="1.2" opacity=".7"/>
          <path d="M176 86 l16 22" stroke="#242C42" stroke-width="2.6" stroke-linecap="round"/>
          <ellipse cx="150" cy="64" rx="8" ry="2.4" fill="#fff" opacity=".35"/>
        </g>
        <rect x="60" y="126" width="70" height="12" rx="6" fill="#33405A" opacity=".85"/>
        <rect x="64" y="129" width="42" height="6" rx="3" fill="#E0B45E"/>
      </g>
      <ellipse cx="150" cy="188" rx="110" ry="7" fill="#000" opacity=".3"/>
      <g stroke="#B9C4D4" stroke-width="2.4" fill="none">
        <circle cx="150" cy="170" r="8" fill="#2A3448"/>
        <path d="M150 178 v14 M150 182 l-14 -4 M150 182 l14 -4" />
      </g>
      <rect x="128" y="192" width="44" height="10" rx="5" fill="#3E4864" stroke="#242C42" stroke-width="1.4"/>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  fig.append();
  scene.append(fig, choicesBox);
  helper.innerHTML = "주말 게임 시간! 일본 전국 시대 게임의 최종 목표가 <b>「쇼군」</b>이 되는 거래요. 게임에도 애니에도 나오는 그 말 — <b>화면을 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const tv = fig.querySelector(".hh4-sg-tv") as SVGGElement;
  const zoom = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "갑옷 무사가 최고 자리에?! 그런데 일본엔 이미 <b>천황</b>이 있잖아요. 그럼 <b>쇼군</b>은 대체 어떤 존재였을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "천황 대신 실제 권력을 쥔 무사 정권의 우두머리",
          "천황의 곁에서 기도를 맡은 종교 지도자",
          "바다 무역을 독점한 최고 부자 상인",
        ],
        good: "정확해요! 쇼군은 <b>무사 정권 「막부」의 우두머리</b> — 천황은 상징으로 남고, 실제 통치는 쇼군이 했어요. 칼을 찬 정권이 700년 가까이 이어진 나라, 일본의 막부 시대로 들어가요!",
        bad: "종교 지도자도 상인도 아니에요 — 쇼군은 <b>천황 대신 실제 권력을 쥔 무사 정권(막부)의 우두머리</b>였어요. 칼을 찬 정권이 700년 가까이 이어진 나라, 일본의 막부 시대로 들어가요!",
        onDone: finish,
      });
    }, 950);
  };
  tv.addEventListener("click", zoom);
  tv.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L7: 여행 사진 타지마할(tajphoto) ──────────────────────── */
function renderTajphoto(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-taj" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-tj-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F1E4"/><stop offset="1" stop-color="#E2D6BC"/></linearGradient>
        <linearGradient id="hh4-tj-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C89A"/><stop offset="1" stop-color="#E88A6A"/></linearGradient>
        <linearGradient id="hh4-tj-dome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".6" stop-color="#EDE4D4"/><stop offset="1" stop-color="#CCC0A8"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-tj-room)"/>
      <ellipse cx="150" cy="192" rx="120" ry="7" fill="#4A2A08" opacity=".10"/>
      <g class="hh4-tj-photo" role="button" tabindex="0" aria-label="여행 사진 — 탭해서 크게 보기">
        <rect x="62" y="30" width="176" height="128" rx="6" fill="#FFFFFF" stroke="#C4B49A" stroke-width="2.2" transform="rotate(-2 150 94)"/>
        <g transform="rotate(-2 150 94)">
          <rect x="70" y="38" width="160" height="98" rx="3" fill="url(#hh4-tj-sky)"/>
          <path d="M150 58 q18 0 18 20 l0 8 h-36 l0 -8 q0 -20 18 -20 z" fill="url(#hh4-tj-dome)" stroke="#A89878" stroke-width="1.6"/>
          <path d="M148 52 q2 -6 2 -8 q0 2 2 8 q3 2 -2 6 q-5 -4 -2 -6 z" fill="#CCC0A8"/>
          <rect x="118" y="84" width="64" height="26" rx="2" fill="url(#hh4-tj-dome)" stroke="#A89878" stroke-width="1.6"/>
          <path d="M143 110 v-16 q7 -8 14 0 v16 z" fill="#8A7A5E"/>
          <path d="M126 92 v-6 q4 -5 8 0 v6 z M166 92 v-6 q4 -5 8 0 v6 z" fill="#B4A488"/>
          <rect x="94" y="66" width="7" height="44" rx="3" fill="url(#hh4-tj-dome)" stroke="#A89878" stroke-width="1.4"/>
          <rect x="199" y="66" width="7" height="44" rx="3" fill="url(#hh4-tj-dome)" stroke="#A89878" stroke-width="1.4"/>
          <circle cx="97.5" cy="62" r="3" fill="#CCC0A8"/><circle cx="202.5" cy="62" r="3" fill="#CCC0A8"/>
          <rect x="70" y="112" width="160" height="24" fill="#7EA6C4" opacity=".7"/>
          <path d="M150 112 q0 12 0 22" stroke="#FFFDF6" stroke-width="10" opacity=".5"/>
          <ellipse cx="86" cy="46" rx="12" ry="3" fill="#fff" opacity=".6"/>
        </g>
        <path d="M142 24 h16 v10 h-16 z" fill="#E0B45E" opacity=".85" transform="rotate(-2 150 29)"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="150" r="9" fill="#FFE8CE"/>
        <path d="M44 159 v22 M44 165 l13 6 M44 165 l-12 5 M44 181 l-8 15 M44 181 l8 15"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "가족 여행 앨범에서 발견한 사진 한 장 — 새하얀 돔의 <b>타지마할</b>이에요. 인도 여행의 필수 코스라는데, <b>사진을 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const photo = fig.querySelector(".hh4-tj-photo") as SVGGElement;
  const zoom = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "가까이 보니 궁전처럼 웅장한데… 사실 이 건물, 사람이 사는 곳이 아니래요. 그럼 <b>타지마할의 정체</b>는 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "황제가 세상을 떠난 왕비를 그리며 지은 묘당",
          "황제가 살던 여름 궁전",
          "곡식을 보관하던 거대한 창고",
        ],
        good: "맞아요! 무굴 제국의 황제 샤자한이 <b>세상을 떠난 왕비 뭄타즈 마할을 추모하며 지은 묘당</b>이에요. 게다가 이 건물엔 두 문화의 손길이 함께 담겨 있죠 — 두 믿음이 만난 나라, 무굴 제국으로!",
        bad: "궁전도 창고도 아니에요 — 타지마할은 무굴 제국의 황제 샤자한이 <b>세상을 떠난 왕비를 추모하며 지은 묘당</b>이랍니다. 이슬람의 돔과 인도의 연꽃무늬가 한 건물에! 두 믿음이 만난 나라, 무굴 제국으로 가요!",
        onDone: finish,
      });
    }, 950);
  };
  photo.addEventListener("click", zoom);
  photo.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L8: 카페 골목 간판(coffeesign) ────────────────────────── */
function renderCoffeesign(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-coffee" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-cf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4D8E8"/><stop offset="1" stop-color="#E8E0CC"/></linearGradient>
        <linearGradient id="hh4-cf-shop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A6534"/><stop offset="1" stop-color="#5E4626"/></linearGradient>
        <linearGradient id="hh4-cf-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#D8CCB4"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-cf-sky)"/>
      <rect x="6" y="150" width="288" height="54" rx="10" fill="#B4A88C"/>
      <rect x="22" y="52" width="120" height="100" rx="6" fill="url(#hh4-cf-shop)" stroke="#42280F" stroke-width="2.2"/>
      <rect x="34" y="96" width="42" height="56" rx="4" fill="#3E2C14"/>
      <rect x="86" y="96" width="44" height="40" rx="4" fill="#F6E8C8" opacity=".85"/>
      <rect x="158" y="66" width="120" height="86" rx="6" fill="#7E8EA6" stroke="#4A5668" stroke-width="2.2"/>
      <rect x="172" y="100" width="40" height="52" rx="4" fill="#33405A"/>
      <rect x="222" y="100" width="42" height="36" rx="4" fill="#E8F0F6" opacity=".85"/>
      <g class="hh4-cf-sign" role="button" tabindex="0" aria-label="카페 간판 — 탭해서 크게 보기">
        <rect x="30" y="62" width="104" height="26" rx="7" fill="#F2D9A4" stroke="#8A6534" stroke-width="2"/>
        <g class="hh4-cf-cupg">
          <path d="M46 82 h14 q0 -12 -7 -12 q-7 0 -7 12 z" fill="url(#hh4-cf-cup)" stroke="#6E4A1E" stroke-width="1.6" transform="rotate(180 53 76)"/>
          <path d="M60 72 q5 1 4 5 q-1 4 -5 3" stroke="#6E4A1E" stroke-width="1.6" fill="none"/>
        </g>
        <text x="94" y="80" text-anchor="middle" font-size="12" font-weight="900" fill="#5E4626" font-family="Pretendard, sans-serif">카페 골목</text>
        <g class="hh4-cf-steam" stroke="#B9905E" stroke-width="2" stroke-linecap="round" opacity="0" fill="none">
          <path d="M50 64 q3 -6 0 -11 M57 64 q3 -6 0 -11"/>
        </g>
        <ellipse cx="42" cy="66" rx="8" ry="2" fill="#fff" opacity=".5"/>
      </g>
      <rect x="176" y="76" width="86" height="18" rx="6" fill="#E2F1F3" stroke="#4A5668" stroke-width="1.6"/>
      <text x="219" y="89" text-anchor="middle" font-size="10" font-weight="800" fill="#33405A" font-family="Pretendard, sans-serif">카페 2호점</text>
      <ellipse cx="150" cy="184" rx="110" ry="7" fill="#4A2A08" opacity=".14"/>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="150" cy="140" r="9" fill="#FFE8CE"/>
        <path d="M150 149 v24 M150 156 l12 7 M150 156 l-12 6 M150 173 l-8 16 M150 173 l8 16"/>
        <path d="M145 138 q2 -3 5 -1" stroke-width="1.8"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "학원 가는 길, 한 골목에 카페가 이렇게 많다니! 어른들은 어디서나 커피를 마시죠. <b>간판을 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const sign = fig.querySelector(".hh4-cf-sign") as SVGGElement;
  const zoom = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.tap);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "김이 모락모락 — 그런데 이렇게 <b>「커피를 파는 가게」</b>가 처음으로 거리에 늘어선 곳은 어디였을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "오스만 제국의 이스탄불",
          "이탈리아의 로마",
          "미국의 뉴욕",
        ],
        good: "맞아요! 16세기 <b>오스만 제국의 이스탄불</b>에 커피 하우스가 처음 늘어섰고, 17세기에 유럽으로 퍼졌어요. 유럽 사람들이 이스탄불에 왔다가 커피에 반해 돌아갔다죠 — 세 대륙의 제국, 오스만으로!",
        bad: "로마도 뉴욕도 원조가 아니에요 — 커피 하우스는 16세기 <b>오스만 제국의 이스탄불</b>에서 처음 늘어섰고, 17세기에야 유럽으로 퍼졌답니다. 커피 한 잔에 담긴 세 대륙의 제국, 오스만을 만나러 가요!",
        onDone: finish,
      });
    }, 950);
  };
  sign.addEventListener("click", zoom);
  sign.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L9: 감자튀김과 초콜릿(frychoco) ───────────────────────── */
function renderFrychoco(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-fry" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-fr-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0E6D2"/><stop offset="1" stop-color="#D4C4A0"/></linearGradient>
        <linearGradient id="hh4-fr-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E05A48"/><stop offset="1" stop-color="#B43A2A"/></linearGradient>
        <linearGradient id="hh4-fr-fry" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D98A"/><stop offset="1" stop-color="#E0B45E"/></linearGradient>
        <linearGradient id="hh4-fr-choco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7E5A3A"/><stop offset=".55" stop-color="#5E3E22"/><stop offset="1" stop-color="#3E2810"/></linearGradient>
        <linearGradient id="hh4-fr-potato" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D8B88A"/><stop offset="1" stop-color="#A8845A"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-fr-table)"/>
      <ellipse cx="150" cy="164" rx="116" ry="10" fill="#4A2A08" opacity=".13"/>
      <g class="hh4-fr-tray" role="button" tabindex="0" aria-label="간식 트레이 — 탭해서 고향 알아보기">
        <g class="hh4-fr-snack">
          <path d="M84 100 h44 l8 56 h-60 z" fill="url(#hh4-fr-cup)" stroke="#7E2214" stroke-width="2.2" stroke-linejoin="round"/>
          <g stroke="#B4863A" stroke-width="1.6">
            <rect x="90" y="72" width="7" height="34" rx="3 " fill="url(#hh4-fr-fry)" transform="rotate(-8 93 89)"/>
            <rect x="100" y="66" width="7" height="40" rx="3" fill="url(#hh4-fr-fry)"/>
            <rect x="110" y="70" width="7" height="36" rx="3" fill="url(#hh4-fr-fry)" transform="rotate(7 113 88)"/>
            <rect x="119" y="74" width="7" height="32" rx="3" fill="url(#hh4-fr-fry)" transform="rotate(14 122 90)"/>
          </g>
          <ellipse cx="94" cy="108" rx="9" ry="2.6" fill="#fff" opacity=".35"/>
          <rect x="170" y="106" width="64" height="44" rx="6" fill="url(#hh4-fr-choco)" stroke="#2E1A06" stroke-width="2.2"/>
          <path d="M191 106 v44 M213 106 v44 M170 128 h64" stroke="#2E1A06" stroke-width="1.8" opacity=".8"/>
          <path d="M170 106 l14 -12 h64 l-14 12 z" fill="#8A6034" stroke="#2E1A06" stroke-width="1.8" stroke-linejoin="round"/>
          <ellipse cx="180" cy="112" rx="8" ry="2.4" fill="#fff" opacity=".25"/>
        </g>
        <g class="hh4-fr-origin" opacity="0">
          <path d="M86 96 q14 -18 34 -8 q14 8 6 26 q-8 16 -24 10 q-18 -7 -16 -28 z" fill="url(#hh4-fr-potato)" stroke="#6E4A26" stroke-width="2"/>
          <circle cx="102" cy="104" r="1.8" fill="#6E4A26"/><circle cx="114" cy="98" r="1.6" fill="#6E4A26"/><circle cx="108" cy="114" r="1.7" fill="#6E4A26"/>
          <path d="M176 110 q10 -22 26 -14 q14 8 8 30 q-6 20 -20 14 q-16 -8 -14 -30 z" fill="#C2843A" stroke="#6E3F16" stroke-width="2"/>
          <path d="M186 104 q6 8 4 30 M196 102 q6 10 4 32" stroke="#6E3F16" stroke-width="1.4" fill="none" opacity=".7"/>
          <path d="M198 96 q2 -8 8 -8" stroke="#3E6844" stroke-width="3" stroke-linecap="round" fill="none"/>
          <text x="150" y="52" text-anchor="middle" font-size="12" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">고향은 어디?</text>
        </g>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="46" cy="56" r="9" fill="#FFE8CE"/>
        <path d="M46 65 v24 M46 72 l12 8 M46 72 l-12 4 M46 89 l-8 16 M46 89 l8 16"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "최애 간식 콤보 — <b>감자튀김에 초콜릿</b>! 그런데 이 둘, 500년 전 유럽과 아시아엔 <b>존재하지도 않던 음식</b>이래요. <b>트레이를 탭</b>!";

  let done = false;
  let timer = 0;
  const tray = fig.querySelector(".hh4-fr-tray") as SVGGElement;
  const reveal = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.classList.add("origin");
    face("surprised");
    helper.innerHTML = "짠 — 감자튀김의 <b>감자</b>, 초콜릿의 원료 <b>카카오</b>! 그럼 이 두 작물의 고향은 어디일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "바다 건너 아메리카 대륙",
          "유럽의 알프스 산기슭",
          "아프리카의 초원",
        ],
        good: "맞아요! 감자도 카카오도 고향은 <b>아메리카</b> — 유럽인이 새 뱃길을 열면서 온 세계의 식탁이 바뀌었죠. 하지만 그 뱃길엔 빛만 있던 게 아니에요. 바다가 이어 준 세계, 그 양면을 함께 봐요.",
        bad: "유럽도 아프리카도 아니에요 — 감자와 카카오의 고향은 <b>아메리카 대륙</b>이랍니다. 유럽인이 새 뱃길을 열면서 온 세계의 식탁이 바뀌었죠. 하지만 그 뱃길엔 빛만 있던 게 아니에요 — 양면을 함께 봐요.",
        onDone: finish,
      });
    }, 950);
  };
  tray.addEventListener("click", reveal);
  tray.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); reveal(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L10: 뉴스 속 의회(assembly) ───────────────────────────── */
function renderAssembly(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh4-assembly" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh4-as-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33405A"/><stop offset="1" stop-color="#1E2838"/></linearGradient>
        <linearGradient id="hh4-as-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDF3F8"/><stop offset="1" stop-color="#CBD9E4"/></linearGradient>
        <linearGradient id="hh4-as-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EA6C4"/><stop offset="1" stop-color="#4E7694"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh4-as-room)"/>
      <g class="hh4-as-tv" role="button" tabindex="0" aria-label="뉴스 화면 — 탭해서 크게 보기">
        <rect x="40" y="22" width="220" height="132" rx="10" fill="#12161E" stroke="#0A0E14" stroke-width="3"/>
        <rect x="48" y="30" width="204" height="116" rx="6" fill="url(#hh4-as-scr)"/>
        <path d="M150 44 a26 14 0 0 1 26 14 h-52 a26 14 0 0 1 26 -14 z" fill="#B9C4D4" stroke="#5E6A7A" stroke-width="1.6"/>
        <path d="M148 36 v8 M148 38 h7" stroke="#5E6A7A" stroke-width="1.8"/>
        <g class="hh4-as-hall">
          <path d="M78 118 q24 -26 72 -26 q48 0 72 26 z" fill="url(#hh4-as-seat)" stroke="#33526A" stroke-width="1.6"/>
          <path d="M92 112 q20 -18 58 -18 q38 0 58 18" stroke="#E8F0F6" stroke-width="2" fill="none" opacity=".7"/>
          <path d="M106 106 q14 -10 44 -10 q30 0 44 10" stroke="#E8F0F6" stroke-width="2" fill="none" opacity=".7"/>
          <rect x="140" y="112" width="20" height="12" rx="3" fill="#8A6534" stroke="#5E4626" stroke-width="1.4"/>
          <circle cx="122" cy="100" r="2.6" fill="#33405A"/><circle cx="138" cy="96" r="2.6" fill="#33405A"/><circle cx="162" cy="96" r="2.6" fill="#33405A"/><circle cx="178" cy="100" r="2.6" fill="#33405A"/>
        </g>
        <rect x="56" y="128" width="98" height="13" rx="6" fill="#B4453A"/>
        <text x="105" y="138" text-anchor="middle" font-size="9" font-weight="900" fill="#FFE8CE" font-family="Pretendard, sans-serif">뉴스 · 오늘의 의회</text>
        <ellipse cx="70" cy="36" rx="12" ry="3" fill="#fff" opacity=".5"/>
      </g>
      <ellipse cx="150" cy="190" rx="110" ry="7" fill="#000" opacity=".3"/>
      <g stroke="#B9C4D4" stroke-width="2.4" fill="none">
        <circle cx="150" cy="172" r="8" fill="#2A3448"/>
        <path d="M150 180 v12 M150 184 l-14 -5 M150 184 l14 -5"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "저녁 뉴스에 또 나온 <b>의회</b> — 나라의 법과 세금은 늘 저 회의장에서 정해지죠. <b>화면을 탭</b>해 봐요!";

  let done = false;
  let timer = 0;
  const tv = fig.querySelector(".hh4-as-tv") as SVGGElement;
  const zoom = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "왕이나 대통령 혼자가 아니라 <b>의회가 법과 세금을 정한다</b> — 이 당연해 보이는 원칙, 언제 뿌리내렸을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "영국의 명예혁명 — 의회가 새 왕을 세우고 「권리 장전」을 승인받으면서",
          "프랑스의 루이 14세가 베르사유 궁전에서 선포하면서",
          "고대 로마의 원로원이 처음 만들면서",
        ],
        good: "정확해요! 1688년 영국 의회는 왕을 갈아 세우고 이듬해 <b>「권리 장전」</b>을 승인받았어요 — 왕도 법 아래, 세금은 의회 동의로! 종교 개혁부터 왕과 의회의 시대까지, 단원의 마지막 여정을 시작해요.",
        bad: "루이 14세는 오히려 의회 없이 왕이 모든 걸 정한 쪽이고, 로마 원로원은 이 원칙의 직접 뿌리가 아니에요 — 정답은 영국의 <b>명예혁명(1688)</b>! 의회가 왕을 세우고 「권리 장전」을 승인받으며 원칙이 뿌리내렸죠. 단원의 마지막 여정으로!",
        onDone: finish,
      });
    }, 950);
  };
  tv.addEventListener("click", zoom);
  tv.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/** Ⅳ 단원 훅 서브 디스패처 — hook.ts는 이 함수 하나만 부른다. 모르는 장면이면 null. */
export function renderHis4(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpts,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "penmotto") return renderPenmotto(scene, helper, s, finish, face);
  if (name === "banknote") return renderBanknote(scene, helper, s, finish, face);
  if (name === "gercamp") return renderGercamp(scene, helper, s, finish, face);
  if (name === "chilikimchi") return renderChilikimchi(scene, helper, s, finish, face);
  if (name === "shogungame") return renderShogungame(scene, helper, s, finish, face);
  if (name === "tajphoto") return renderTajphoto(scene, helper, s, finish, face);
  if (name === "coffeesign") return renderCoffeesign(scene, helper, s, finish, face);
  if (name === "frychoco") return renderFrychoco(scene, helper, s, finish, face);
  if (name === "assembly") return renderAssembly(scene, helper, s, finish, face);
  return null;
}
