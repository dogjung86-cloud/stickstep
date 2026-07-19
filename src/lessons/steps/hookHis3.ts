// hookHis3 — 역사① Ⅲ 단원(세계 종교의 확산과 지역 문화의 발전) 훅 장면 9종.
// hook.ts의 디스패처가 renderHis3 하나만 불러 쓴다(hookHis2의 서브 디스패처 문법 계승).
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hh3-(styles/his.css).
//   lambskewer   L1 — 양꼬치 가게: 한족이 양고기·의자를 즐기게 된 계기(호한 융합)
//   examnotice   L2 — 시험 안내문: 시험으로 관리를 뽑는 발명(과거제)
//   kanasign     L3 — 일본 간판의 가나: 한자를 변형해 만든 글자(국풍 문화)
//   hanjahw      L4 — 한자 숙제: 한·중·일에서 같은 글자가 통하는 까닭(동아시아 문화권)
//   zeroscore    L5 — 전광판 0:0: 0을 처음 숫자로 쓴 곳(인도·굽타)
//   chessmate    L6 — 체크메이트: 페르시아어 '샤 마트'가 유럽까지 간 길
//   arabnum      L7 — 아라비아 숫자: 이름은 아라비아, 고향은 인도(이슬람 상인의 릴레이)
//   francejersey L8 — 축구 유니폼 FRANCE: 프랑크 왕국에서 온 나라 이름
//   pepper       L10 — 식탁의 후추: 은값이던 향신료(동방 무역)
// 훅 문법: 조작 먼저 → 예측은 공용 ask()(choices[0]=정답, good≠bad — 오답은 오개념 교정).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpts = { choices?: string[] };

/* ── L1: 양꼬치 가게(lambskewer) ───────────────────────────── */
function renderLambskewer(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-skewer" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-sk-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4E2C8"/><stop offset="1" stop-color="#E2C89E"/></linearGradient>
        <linearGradient id="hh3-sk-grillb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7684"/><stop offset=".55" stop-color="#4A5260"/><stop offset="1" stop-color="#333B48"/></linearGradient>
        <linearGradient id="hh3-sk-meat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C97B4A"/><stop offset=".5" stop-color="#A85A2E"/><stop offset="1" stop-color="#8A4520"/></linearGradient>
        <linearGradient id="hh3-sk-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A76C"/><stop offset="1" stop-color="#A87A42"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="150" rx="12" fill="url(#hh3-sk-wall)"/>
      <rect x="24" y="18" width="106" height="34" rx="8" fill="#B4453A" stroke="#7E2C24" stroke-width="2"/>
      <text x="77" y="40" text-anchor="middle" font-size="15" font-weight="900" fill="#FFE8CE" font-family="Pretendard, sans-serif">양꼬치</text>
      <rect x="6" y="150" width="288" height="54" rx="10" fill="url(#hh3-sk-table)"/>
      <ellipse cx="120" cy="150" rx="86" ry="8" fill="#4A2A08" opacity=".18"/>
      <g class="hh3-sk-grill">
        <rect x="46" y="112" width="148" height="34" rx="9" fill="url(#hh3-sk-grillb)" stroke="#20262E" stroke-width="2"/>
        <path d="M56 120 h128 M56 128 h128 M56 136 h128" stroke="#20262E" stroke-width="1.6" opacity=".7"/>
        <ellipse cx="70" cy="117" rx="12" ry="2.2" fill="#fff" opacity=".2"/>
        <g class="hh3-sk-set">
          <g transform="rotate(-4 120 106)">
            <path d="M60 104 h120" stroke="#B9905E" stroke-width="2.6" stroke-linecap="round"/>
            <rect x="74" y="98" width="18" height="12" rx="5" fill="url(#hh3-sk-meat)" stroke="#5E2C12" stroke-width="1.6"/>
            <rect x="96" y="98" width="18" height="12" rx="5" fill="url(#hh3-sk-meat)" stroke="#5E2C12" stroke-width="1.6"/>
            <rect x="118" y="98" width="18" height="12" rx="5" fill="url(#hh3-sk-meat)" stroke="#5E2C12" stroke-width="1.6"/>
            <rect x="140" y="98" width="16" height="12" rx="5" fill="url(#hh3-sk-meat)" stroke="#5E2C12" stroke-width="1.6"/>
          </g>
          <g class="hh3-sk-steam" stroke="#B9C4D4" stroke-width="2.4" stroke-linecap="round" opacity="0">
            <path d="M92 88 q3 -7 0 -13 M116 86 q3 -7 0 -13 M140 88 q3 -7 0 -13"/>
          </g>
        </g>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="240" cy="92" r="9" fill="#FFE8CE"/>
        <path d="M240 101 v26 M240 108 l-13 6 M240 108 l13 2 M240 127 l-9 16 M240 127 l9 16"/>
      </g>
      <path d="M253 110 l14 -6" stroke="#B9905E" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="222" y="146" width="40" height="26" rx="5" fill="#C89A5E" stroke="#84582A" stroke-width="1.8"/>
      <path d="M226 172 v10 M258 172 v10" stroke="#84582A" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
    <button type="button" class="hh3-sk-btn" aria-label="양꼬치 굽기">꼬치 굽기</button>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "가족 외식으로 온 <b>양꼬치 가게</b> — 중국 음식점 단골 메뉴죠! 아래 버튼을 눌러 <b>꼬치를 구워</b> 볼까요?";

  let done = false;
  let timer = 0;
  const btn = fig.querySelector(".hh3-sk-btn") as HTMLButtonElement;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    haptic(HAPTIC.tap);
    fig.classList.add("grilled");
    face("curious");
    helper.innerHTML = "지글지글, 다 익었어요! 그런데 이상하죠 — <b>아주 옛날 중국의 한족은 양고기를 즐기지 않았고, 의자도 쓰지 않았대요</b>. 지금은 둘 다 중국 문화의 일부인데요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "북방 유목 민족과 어울려 살면서 문화가 서로 섞여서",
          "실크로드로 유럽의 요리가 들어와서",
          "황제가 양고기를 먹으라는 법을 만들어서",
        ],
        good: "맞아요! 중국이 여러 나라로 나뉘었던 시대, 북방 유목 민족이 화북에 나라를 세우고 한족과 어울려 살면서 <b>양고기·유제품·의자 문화가 한족에게 스며들었어요</b>. 거꾸로 유목 민족은 한족의 제도와 문화를 받아들였죠 — 분열의 시대가 곧 융합의 시대! 지금 만나러 가요.",
        bad: "유럽도 황제의 법도 아니에요 — 답은 <b>이웃</b>이었어요. 중국이 분열됐던 시대에 북방 유목 민족이 화북에 나라를 세우고 한족과 어울려 살면서, 양고기와 의자 같은 유목 문화가 한족의 일상이 된 거랍니다. 분열 속에서 문화가 섞인 그 시대로 가 봐요!",
        onDone: finish,
      });
    }, 950);
  });
  return () => window.clearTimeout(timer);
}

/* ── L2: 시험 안내문(examnotice) ───────────────────────────── */
function renderExamnotice(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-exam" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-ex-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8E5E"/><stop offset="1" stop-color="#2A6844"/></linearGradient>
        <linearGradient id="hh3-ex-pap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF0F4"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="#F2EDE2"/>
      <rect x="26" y="20" width="248" height="150" rx="10" fill="url(#hh3-ex-board)" stroke="#1E4A30" stroke-width="2.4"/>
      <ellipse cx="150" cy="188" rx="120" ry="8" fill="#4A2A08" opacity=".12"/>
      <g class="hh3-ex-note" role="button" tabindex="0" aria-label="시험 안내문 — 탭해서 크게 보기">
        <rect x="96" y="40" width="108" height="112" rx="4" fill="url(#hh3-ex-pap)" stroke="#B9C1CC" stroke-width="1.8" transform="rotate(-2 150 96)"/>
        <circle cx="150" cy="48" r="4" fill="#E0524A"/>
        <text x="150" y="70" text-anchor="middle" font-size="13" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">중간고사</text>
        <text x="150" y="86" text-anchor="middle" font-size="10" font-weight="800" fill="#4E5968" font-family="Pretendard, sans-serif">시험 안내</text>
        <path d="M112 98 h76 M112 110 h76 M112 122 h58 M112 134 h66" stroke="#C9D2DE" stroke-width="2.4" stroke-linecap="round"/>
      </g>
      <g class="hh3-ex-stick" stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="52" cy="120" r="9" fill="#FFE8CE"/>
        <path d="M52 129 v26 M52 136 l12 8 M52 136 l-12 4 M52 155 l-9 16 M52 155 l9 16"/>
        <path d="M46 118 q2 -3 5 -1" stroke-width="1.8"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "복도 게시판에 <b>시험 안내문</b>이 붙었어요. 후유, 시험은 누가 발명했을까요… <b>안내문을 탭</b>해 봐요!";

  let zoomed = false;
  let timer = 0;
  const note = fig.querySelector(".hh3-ex-note") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "그런데 진짜로 발명한 나라가 있어요 — <b>약 1400년 전 중국의 수</b>가 세계에서 처음으로 <b>국가 차원의 시험</b>을 치르기 시작했거든요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "나라 일을 맡을 관리",
          "황제의 요리를 맡을 요리사",
          "국경을 지킬 장군",
        ],
        good: "맞아요! 시험으로 <b>관리</b>를 뽑는 과거제 — 가문이 아니라 <b>능력</b>으로 인재를 고르겠다는 발명품이에요. 시험 한 번으로 인생이 바뀌는 시대가 열렸죠. 수와 당의 이야기, 지금 시작해요!",
        bad: "요리사도 장군도 아니라 <b>나라 일을 맡을 관리</b>였어요 — 수 문제가 시작한 과거제는 가문 대신 <b>시험 성적(능력)</b>으로 인재를 뽑는 발명품이었죠. 시험 한 번으로 인생이 바뀌는 시대! 수와 당의 이야기로 들어가요.",
        onDone: finish,
      });
    }, 950);
  };
  note.addEventListener("click", zoom);
  note.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L3: 일본 간판의 가나(kanasign) ────────────────────────── */
function renderKanasign(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-kana" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-kn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3C4"/><stop offset="1" stop-color="#F6EFDC"/></linearGradient>
        <linearGradient id="hh3-kn-noren" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D5BC0"/><stop offset="1" stop-color="#2A3E86"/></linearGradient>
        <linearGradient id="hh3-kn-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset="1" stop-color="#84582A"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh3-kn-sky)"/>
      <rect x="30" y="34" width="180" height="150" rx="8" fill="#F5EFE2" stroke="#B9A47E" stroke-width="2"/>
      <path d="M22 34 h196 l-10 -16 h-176 z" fill="url(#hh3-kn-wood)" stroke="#5E4626" stroke-width="2"/>
      <ellipse cx="120" cy="192" rx="100" ry="7" fill="#4A2A08" opacity=".14"/>
      <g class="hh3-kn-sign" role="button" tabindex="0" aria-label="가게 천막 간판 — 탭해서 자세히 보기">
        <path d="M44 44 h152 v64 q-38 8 -76 0 q-38 8 -76 0 z" fill="url(#hh3-kn-noren)" stroke="#1E2C64" stroke-width="2"/>
        <path d="M95 44 v62 M146 44 v62" stroke="#1E2C64" stroke-width="1.6" opacity=".7"/>
        <text x="69" y="84" text-anchor="middle" font-size="26" font-weight="900" fill="#FFFFFF" font-family="Pretendard, sans-serif">う</text>
        <text x="120" y="84" text-anchor="middle" font-size="26" font-weight="900" fill="#FFFFFF" font-family="Pretendard, sans-serif">ど</text>
        <text x="171" y="84" text-anchor="middle" font-size="26" font-weight="900" fill="#FFFFFF" font-family="Pretendard, sans-serif">ん</text>
        <ellipse cx="70" cy="50" rx="14" ry="2.4" fill="#fff" opacity=".22"/>
      </g>
      <g class="hh3-kn-zoom" aria-hidden="true">
        <rect x="52" y="118" width="196" height="62" rx="12" fill="#FFFFFF" stroke="#B9C1CC" stroke-width="2"/>
        <text x="92" y="160" text-anchor="middle" font-size="30" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">宇</text>
        <path d="M124 150 h30 m-8 -6 l8 6 -8 6" stroke="#0E7C8A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="182" y="160" text-anchor="middle" font-size="30" font-weight="900" fill="#0E7C8A" font-family="Pretendard, sans-serif">う</text>
        <text x="222" y="156" text-anchor="middle" font-size="10" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">?!</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="252" cy="96" r="9" fill="#FFE8CE"/>
        <path d="M252 105 v24 M252 112 l-12 6 M252 112 l12 4 M252 129 l-8 15 M252 129 l8 15"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "가족 일본 여행에서 만난 <b>우동 가게 간판</b> — 「うどん」. 동글동글한 이 글자, <b>간판을 탭</b>해서 자세히 봐요!";

  let zoomed = false;
  let timer = 0;
  const sign = fig.querySelector(".hh3-kn-sign") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "첫 글자 「う」를 확대하니 — 한자 <b>「宇」</b>와 나란히 놓이네요? 생김새가 어딘가 닮았어요. 일본의 가나 문자, 어떻게 만들어졌을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "한자의 모양을 따오거나 변형해서 만들었다",
          "알파벳을 본떠서 만들었다",
          "다른 문자와 상관없이 완전히 새로 발명했다",
        ],
        good: "맞아요! 가나는 <b>한자의 모양을 따오거나 흘려 써서</b> 만든 문자예요 — う는 宇에서 왔죠. 일본이 왜 한자를 알고 있었는지, 그 답은 바다를 건넌 교류의 역사에 있답니다. 지금 만나러 가요!",
        bad: "알파벳도, 무에서의 발명도 아니에요 — 가나는 <b>한자를 따오거나 흘려 써서</b> 만들었답니다(う ← 宇). 그럼 일본은 한자를 어떻게 알고 있었을까요? 바다를 건넌 교류의 역사가 그 답이에요!",
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

/* ── L4: 한자 숙제(hanjahw) ────────────────────────────────── */
function renderHanjahw(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-hanja" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-hj-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2C89E"/><stop offset="1" stop-color="#C4A26E"/></linearGradient>
        <linearGradient id="hh3-hj-note" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0F2F6"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh3-hj-desk)"/>
      <ellipse cx="150" cy="176" rx="118" ry="9" fill="#4A2A08" opacity=".14"/>
      <g class="hh3-hj-note" role="button" tabindex="0" aria-label="한자 숙제 공책 — 탭해서 넘겨 보기">
        <rect x="60" y="26" width="180" height="128" rx="6" fill="url(#hh3-hj-note)" stroke="#B9C1CC" stroke-width="2" transform="rotate(-2 150 90)"/>
        <path d="M150 30 v120" stroke="#D7DCE2" stroke-width="1.8" transform="rotate(-2 150 90)"/>
        <text x="98" y="70" text-anchor="middle" font-size="24" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">一</text>
        <text x="98" y="104" text-anchor="middle" font-size="24" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">二</text>
        <text x="98" y="138" text-anchor="middle" font-size="24" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">三</text>
        <text x="196" y="70" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">한 일</text>
        <text x="196" y="104" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">두 이</text>
        <text x="196" y="138" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">석 삼</text>
      </g>
      <g class="hh3-hj-books" aria-hidden="true">
        <g transform="rotate(4 226 160)">
          <rect x="192" y="140" width="68" height="46" rx="5" fill="#C0392B" stroke="#7E241A" stroke-width="1.8"/>
          <text x="226" y="170" text-anchor="middle" font-size="20" font-weight="900" fill="#FFE8CE" font-family="Pretendard, sans-serif">三</text>
        </g>
        <g transform="rotate(-5 74 162)">
          <rect x="40" y="140" width="68" height="46" rx="5" fill="#3D5BC0" stroke="#1E2C64" stroke-width="1.8"/>
          <text x="74" y="170" text-anchor="middle" font-size="20" font-weight="900" fill="#FFFFFF" font-family="Pretendard, sans-serif">三</text>
        </g>
      </g>
      <path d="M236 44 l16 -18 M244 46 l14 -8" stroke="#8A6534" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M232 48 l6 -6 4 4 -6 6 z" fill="#33405A"/>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "한문 숙제 시간 — <b>一, 二, 三</b>을 쓰고 있어요. 공책을 <b>탭</b>해 볼까요?";

  let zoomed = false;
  let timer = 0;
  const note = fig.querySelector(".hh3-hj-note") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "어라, 책상 위 <b>중국 요리책</b>과 <b>일본 만화책</b>에도 똑같은 <b>三</b>이 있어요! 세 나라에서 같은 글자가 통하는 이유가 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "옛날 동아시아 나라들이 한자를 함께 썼기 때문에",
          "세 나라가 최근에 글자를 통일하기로 약속해서",
          "발음이 똑같아서 자연스럽게 퍼져서",
        ],
        good: "맞아요! 천 년도 더 전에 <b>한자는 동아시아의 공용 문자</b>였어요 — 말이 달라도 글로 통했죠. 한자를 타고 유교와 불교, 율령까지 함께 퍼지며 <b>동아시아 문화권</b>이 만들어졌답니다. 그 이야기를 국제도시 장안에서 만나요!",
        bad: "최근의 약속도, 같은 발음도 아니에요(세 나라의 발음은 서로 달라요!) — 답은 역사에 있어요. 천 년도 더 전에 <b>한자는 동아시아의 공용 문자</b>였고, 한자를 타고 유교·불교·율령까지 퍼지며 <b>동아시아 문화권</b>이 만들어졌답니다. 장안에서 확인해요!",
        onDone: finish,
      });
    }, 950);
  };
  note.addEventListener("click", zoom);
  note.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L5: 전광판 0:0(zeroscore) ─────────────────────────────── */
function renderZeroscore(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-zero" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-zr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2C48"/><stop offset="1" stop-color="#33405A"/></linearGradient>
        <linearGradient id="hh3-zr-pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA36E"/><stop offset="1" stop-color="#2A7048"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="150" rx="12" fill="url(#hh3-zr-sky)"/>
      <rect x="6" y="132" width="288" height="72" rx="10" fill="url(#hh3-zr-pitch)"/>
      <path d="M20 168 h260 M150 140 v60 M150 176 m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0" stroke="#EAF4EE" stroke-width="2" opacity=".55" fill="none"/>
      <g class="hh3-zr-board" role="button" tabindex="0" aria-label="경기 전광판 — 탭해서 크게 보기">
        <rect x="58" y="22" width="184" height="86" rx="10" fill="#10161E" stroke="#39424E" stroke-width="2.4"/>
        <rect x="64" y="28" width="172" height="74" rx="7" fill="#0A0E14"/>
        <text x="106" y="58" text-anchor="middle" font-size="12" font-weight="900" fill="#7FD6E2" font-family="Pretendard, sans-serif">우리 팀</text>
        <text x="196" y="58" text-anchor="middle" font-size="12" font-weight="900" fill="#F2A0B6" font-family="Pretendard, sans-serif">상대 팀</text>
        <text class="hh3-zr-n1" x="106" y="94" text-anchor="middle" font-size="30" font-weight="900" fill="#FFD98A" font-family="Pretendard, sans-serif">0</text>
        <text x="150" y="92" text-anchor="middle" font-size="22" font-weight="900" fill="#5B6570" font-family="Pretendard, sans-serif">:</text>
        <text class="hh3-zr-n2" x="196" y="94" text-anchor="middle" font-size="30" font-weight="900" fill="#FFD98A" font-family="Pretendard, sans-serif">0</text>
        <ellipse cx="86" cy="30" rx="16" ry="2.6" fill="#fff" opacity=".14"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="164" r="8" fill="#FFE8CE"/>
        <path d="M44 172 v20 M44 178 l-10 5 M44 178 l10 5 M44 192 l-7 12 M44 192 l7 12"/>
      </g>
      <circle cx="66" cy="200" r="5" fill="#F7FAFC" stroke="#33405A" stroke-width="1.6"/>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "축구 경기 시작 직전! 전광판 점수는 <b>0 : 0</b>. 저 <b>전광판을 탭</b>해 봐요.";

  let zoomed = false;
  let timer = 0;
  const board = fig.querySelector(".hh3-zr-board") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "생각해 보면 신기해요 — <b>0은 「아무것도 없음」인데 왜 숫자로 적을까요?</b> 옛날 로마 숫자(Ⅰ·Ⅱ·Ⅲ…)에는 0이 아예 없었답니다!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "인도",
          "로마",
          "이집트",
        ],
        good: "맞아요! <b>「없음」을 숫자 0으로 처음 쓴 곳은 인도</b> — 굽타 왕조 시대에 꽃핀 수학이에요. 0과 10진법 덕분에 아무리 큰 수도 숫자 열 개로 쓸 수 있게 됐죠. 수학까지 빛났던 인도의 황금기로 떠나요!",
        bad: "로마 숫자에는 0이 없었고, 이집트도 아니에요 — 정답은 <b>인도</b>! 굽타 왕조 시대의 인도인이 「없음」을 숫자 0으로 만들었고, 0과 10진법은 오늘날 전 세계가 쓰죠. 수학까지 빛났던 인도의 황금기로 떠나 봐요!",
        onDone: finish,
      });
    }, 950);
  };
  board.addEventListener("click", zoom);
  board.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L6: 체크메이트(chessmate) ─────────────────────────────── */
function renderChessmate(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-chess" });
  const cells = Array.from({ length: 16 }, (_, i) => {
    const cx = 84 + (i % 4) * 34;
    const cy = 58 + Math.floor(i / 4) * 34;
    const dark = (i + Math.floor(i / 4)) % 2 === 1;
    return `<rect x="${cx}" y="${cy}" width="34" height="34" fill="${dark ? "#8A6534" : "#F2E7CE"}"/>`;
  }).join("");
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-ch-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A76C"/><stop offset="1" stop-color="#A87A42"/></linearGradient>
        <linearGradient id="hh3-ch-piece" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C4CCD8"/></linearGradient>
        <linearGradient id="hh3-ch-piece2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5C677D"/><stop offset="1" stop-color="#2E3644"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh3-ch-table)"/>
      <rect x="76" y="50" width="152" height="152" fill="#5E4626"/>
      <g>${cells}</g>
      <ellipse cx="152" cy="200" rx="96" ry="6" fill="#4A2A08" opacity=".2"/>
      <g class="hh3-ch-queen">
        <path d="M186 126 l6 -14 4 8 6 -10 6 10 4 -8 6 14 z" fill="url(#hh3-ch-piece2)" stroke="#141C26" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M188 126 h28 l-4 22 h-20 z" fill="url(#hh3-ch-piece2)" stroke="#141C26" stroke-width="1.8" stroke-linejoin="round"/>
      </g>
      <g class="hh3-ch-king" role="button" tabindex="0" aria-label="궁지에 몰린 킹 — 탭해서 승부 끝내기">
        <path d="M116 64 v-10 M111 59 h10" stroke="#141C26" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M104 96 q0 -18 12 -18 q12 0 12 18 l-3 16 h-18 z" fill="url(#hh3-ch-piece)" stroke="#5C677D" stroke-width="1.8" stroke-linejoin="round"/>
        <ellipse cx="110" cy="82" rx="3.4" ry="6" fill="#fff" opacity=".7"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="42" cy="96" r="9" fill="#FFE8CE"/>
        <path d="M42 105 v26 M42 112 l13 8 M42 112 l-12 6 M42 131 l-9 16 M42 131 l9 16"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="258" cy="96" r="9" fill="#FFE8CE"/>
        <path d="M258 105 v26 M258 112 l-13 8 M258 112 l12 6 M258 131 l-9 16 M258 131 l9 16"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "친구와 <b>체스</b> 한 판! 상대 킹이 궁지에 몰렸어요. <b>킹을 탭</b>해서 외쳐요 — 체크메이트!";

  let done = false;
  let timer = 0;
  const king = fig.querySelector(".hh3-ch-king") as SVGGElement;
  const tap = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.correct);
    fig.classList.add("mate");
    face("cheer");
    helper.innerHTML = "승리! 그런데 <b>「체크메이트」</b>라는 말, 어느 나라 말인지 아세요? 페르시아어 <b>「샤 마트(왕이 궁지에 몰렸다)」</b>에서 왔대요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "페르시아와 이슬람 세계를 거쳐 유럽으로 전해졌다",
          "고대 로마인이 만들어 유럽에 퍼뜨렸다",
          "바이킹이 항해 중에 발명했다",
        ],
        good: "맞아요! 체스의 조상은 인도에서 태어나 <b>페르시아를 거쳐 이슬람 세계로, 다시 유럽으로</b> 여행했어요 — 그래서 페르시아어가 유럽 게임 용어에 남았죠. 이 릴레이의 무대, 서아시아로 떠나요!",
        bad: "로마도 바이킹도 아니에요 — 체스는 인도에서 태어나 <b>페르시아 → 이슬람 세계 → 유럽</b> 순서로 전해졌어요. 그래서 페르시아어 「샤 마트」가 체크메이트로 남은 거죠. 문화를 실어 나른 서아시아의 이야기, 지금 시작해요!",
        onDone: finish,
      });
    }, 950);
  };
  king.addEventListener("click", tap);
  king.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); tap(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L7: 아라비아 숫자(arabnum) ────────────────────────────── */
function renderArabnum(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-num" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-nm-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EEF4"/><stop offset="1" stop-color="#CBD6E2"/></linearGradient>
        <linearGradient id="hh3-nm-book" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF1F5"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh3-nm-desk)"/>
      <ellipse cx="150" cy="180" rx="120" ry="9" fill="#2A3A5E" opacity=".1"/>
      <g class="hh3-nm-book" role="button" tabindex="0" aria-label="수학책 표지 — 탭해서 넘겨 보기">
        <rect x="64" y="30" width="172" height="130" rx="8" fill="url(#hh3-nm-book)" stroke="#B9C1CC" stroke-width="2" transform="rotate(-1.5 150 95)"/>
        <rect x="64" y="30" width="172" height="34" rx="8" fill="#3D5BC0" transform="rotate(-1.5 150 47)"/>
        <text x="150" y="54" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif" transform="rotate(-1.5 150 47)">수학 1</text>
        <text x="150" y="122" text-anchor="middle" font-size="34" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif" letter-spacing="6">1 2 3</text>
        <text x="150" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">아라비아 숫자</text>
      </g>
      <g class="hh3-nm-tag" aria-hidden="true">
        <rect x="88" y="158" width="124" height="30" rx="15" fill="#FBF0DA" stroke="#C2843A" stroke-width="2"/>
        <text x="150" y="178" text-anchor="middle" font-size="12" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">고향: 어디게요?</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="112" r="9" fill="#FFE8CE"/>
        <path d="M44 121 v24 M44 128 l12 7 M44 128 l-12 5 M44 145 l-8 15 M44 145 l8 15"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "수학책에 매일 쓰는 <b>1, 2, 3</b> — 이름은 <b>아라비아 숫자</b>래요. <b>책을 탭</b>해 볼까요?";

  let zoomed = false;
  let timer = 0;
  const book = fig.querySelector(".hh3-nm-book") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "그런데 반전 — 이 숫자를 <b>처음 만든 곳은 아라비아가 아니래요!</b> 그런데 왜 「아라비아 숫자」라고 부를까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "인도 숫자를 이슬람 상인이 유럽에 전해 줘서",
          "아라비아 사막에서 발견된 암호라서",
          "유럽 수학자가 아라비아를 여행하며 발명해서",
        ],
        good: "맞아요! 고향은 <b>인도</b> — 그 숫자를 <b>이슬람 상인과 학자들이 받아들여 유럽에 전했고</b>, 유럽인들은 「아라비아에서 온 숫자」라고 불렀죠. 지식을 실어 나른 상인의 배낭 속으로 들어가 봐요!",
        bad: "암호도, 유럽인의 발명도 아니에요 — 고향은 <b>인도</b>랍니다. 인도의 숫자를 <b>이슬람 세계가 받아들여 발전시키고 유럽에 전해 줘서</b>, 유럽인 눈엔 「아라비아에서 온 숫자」였던 거죠. 지식의 릴레이, 상인의 배낭에서 확인해요!",
        onDone: finish,
      });
    }, 950);
  };
  book.addEventListener("click", zoom);
  book.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L8: 축구 유니폼 FRANCE(francejersey) ──────────────────── */
function renderFrancejersey(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-jersey" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-js-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2C48"/><stop offset="1" stop-color="#33405A"/></linearGradient>
        <linearGradient id="hh3-js-shirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3D5BC0"/><stop offset=".6" stop-color="#2A3E9E"/><stop offset="1" stop-color="#1E2C74"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh3-js-bg)"/>
      <text x="150" y="34" text-anchor="middle" font-size="13" font-weight="900" fill="#7FD6E2" font-family="Pretendard, sans-serif">국가 대항전 생중계</text>
      <ellipse cx="150" cy="192" rx="110" ry="7" fill="#000" opacity=".25"/>
      <g class="hh3-js-shirt" role="button" tabindex="0" aria-label="파란 유니폼 — 탭해서 자세히 보기">
        <path d="M104 66 l24 -14 q22 8 44 0 l24 14 -12 26 -12 -6 v78 q-22 8 -44 0 v-78 l-12 6 z" fill="url(#hh3-js-shirt)" stroke="#141C4E" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M128 52 q22 10 44 0" stroke="#141C4E" stroke-width="2" fill="none"/>
        <text x="150" y="102" text-anchor="middle" font-size="17" font-weight="900" fill="#FFFFFF" font-family="Pretendard, sans-serif" letter-spacing="1.5">FRANCE</text>
        <circle cx="150" cy="128" r="14" fill="none" stroke="#FFD98A" stroke-width="2.2"/>
        <path d="M144 132 q6 -12 12 0 M150 120 v6" stroke="#FFD98A" stroke-width="1.8" fill="none"/>
        <ellipse cx="122" cy="66" rx="7" ry="2.4" fill="#fff" opacity=".28"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="52" cy="130" r="9" fill="#FFE8CE"/>
        <path d="M52 139 v24 M52 145 l13 7 M52 145 l-12 6 M52 163 l-9 15 M52 163 l9 15"/>
      </g>
      <path d="M236 150 a10 10 0 1 1 12 -12" stroke="#F7FAFC" stroke-width="2.4" fill="none"/>
      <circle cx="246" cy="152" r="7" fill="#F7FAFC" stroke="#33405A" stroke-width="1.8"/>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "국가 대항전 축구 중계 — 파란 유니폼에 <b>FRANCE</b>가 큼직해요. <b>유니폼을 탭</b>해 봐요!";

  let zoomed = false;
  let timer = 0;
  const shirt = fig.querySelector(".hh3-js-shirt") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "「프랑스」라는 나라 이름 — 사실 <b>천오백 년 전의 어떤 나라 이름</b>이 숨어 있대요. 어디서 왔을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "게르만족이 세운 프랑크 왕국에서",
          "수도 파리의 옛 이름에서",
          "'자유'를 뜻하는 라틴어 단어에서",
        ],
        good: "맞아요! 게르만족의 하나인 <b>프랑크족이 세운 프랑크 왕국</b> — 그 이름이 오늘날 프랑스가 됐어요. 서로마 제국이 무너진 자리에서 새 유럽이 태어나는 이야기, 지금 시작해요!",
        bad: "파리도 라틴어도 아니에요 — 정답은 <b>프랑크 왕국</b>! 게르만족의 하나인 프랑크족이 세운 나라 이름이 오늘날의 프랑스로 이어졌죠. 서로마 제국이 무너진 자리에서 새 유럽이 태어난 이야기로 들어가요!",
        onDone: finish,
      });
    }, 950);
  };
  shirt.addEventListener("click", zoom);
  shirt.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L10: 식탁의 후추(pepper) ──────────────────────────────── */
function renderPepper(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh3-pepper" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh3-pp-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4E2C8"/><stop offset="1" stop-color="#E0C49A"/></linearGradient>
        <linearGradient id="hh3-pp-soup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C86E"/><stop offset="1" stop-color="#D89A3E"/></linearGradient>
        <linearGradient id="hh3-pp-mill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4EAF2"/><stop offset=".6" stop-color="#C4CCD8"/><stop offset="1" stop-color="#9AA6B6"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh3-pp-table)"/>
      <ellipse cx="128" cy="164" rx="92" ry="10" fill="#4A2A08" opacity=".14"/>
      <ellipse cx="128" cy="140" rx="84" ry="26" fill="#FFFFFF" stroke="#C9D2DE" stroke-width="2.4"/>
      <ellipse cx="128" cy="136" rx="66" ry="18" fill="url(#hh3-pp-soup)"/>
      <path d="M104 130 q10 -6 20 0 M132 138 q10 -5 20 0" stroke="#B4741E" stroke-width="2" stroke-linecap="round" opacity=".6" fill="none"/>
      <g class="hh3-pp-flakes" opacity="0">
        <circle cx="116" cy="130" r="1.8" fill="#33261A"/><circle cx="126" cy="126" r="1.6" fill="#33261A"/>
        <circle cx="136" cy="132" r="1.8" fill="#33261A"/><circle cx="144" cy="127" r="1.5" fill="#33261A"/>
        <circle cx="121" cy="138" r="1.5" fill="#33261A"/><circle cx="139" cy="140" r="1.6" fill="#33261A"/>
      </g>
      <g class="hh3-pp-mill" role="button" tabindex="0" aria-label="후추통 — 탭해서 갈아 뿌리기">
        <path d="M206 60 q-8 10 0 18 q8 -8 0 -18 z" fill="#6E7684" opacity="0" class="puff"/>
        <rect x="222" y="58" width="34" height="16" rx="7" fill="url(#hh3-pp-mill)" stroke="#5C677D" stroke-width="2"/>
        <path d="M224 74 h30 l-4 60 q-11 6 -22 0 z" fill="url(#hh3-pp-mill)" stroke="#5C677D" stroke-width="2" stroke-linejoin="round"/>
        <path d="M228 92 h22 M229 108 h20" stroke="#8A96A6" stroke-width="1.6" opacity=".7"/>
        <ellipse cx="231" cy="80" rx="3" ry="8" fill="#fff" opacity=".5"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="84" r="9" fill="#FFE8CE"/>
        <path d="M44 93 v26 M44 100 l12 8 M44 100 l-12 5 M44 119 l-9 16 M44 119 l9 16"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "저녁 식탁의 수프 — 마무리는 후추죠! <b>후추통을 탭</b>해서 톡톡 뿌려 볼까요?";

  let done = false;
  let timer = 0;
  const mill = fig.querySelector(".hh3-pp-mill") as SVGGElement;
  const tap = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.tap);
    fig.classList.add("ground");
    face("curious");
    helper.innerHTML = "톡톡 — 까만 알갱이가 눈처럼! 그런데 이 흔한 후추가 <b>중세 유럽에서는 은과 맞바꿀 만큼 귀했대요</b>. 대체 왜였을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "먼 아시아에서 사막과 바다를 건너 조금씩 왔기 때문에",
          "유럽 왕만 먹을 수 있다는 법이 있어서",
          "유럽 어디서나 자라지만 따기가 어려워서",
        ],
        good: "맞아요! 후추는 인도 등 <b>먼 아시아에서만 나는데</b>, 사막과 바다를 건너 상인의 손을 여러 번 거쳐야 유럽에 닿았어요 — 그래서 값이 은값! 이 향신료 길을 활짝 연 사건과 달라진 유럽의 이야기, 마지막 여행을 떠나요.",
        bad: "법도 아니고, 유럽에서 자라지도 않았어요 — 후추는 인도 등 <b>먼 아시아에서만 나서</b>, 사막과 바다를 건너 상인 손을 여러 번 거쳐야 했기에 은값이 됐답니다. 이 동방 무역이 유럽을 어떻게 바꿨는지, 마지막 이야기로 확인해요!",
        onDone: finish,
      });
    }, 950);
  };
  mill.addEventListener("click", tap);
  mill.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); tap(); }
  });
  return () => window.clearTimeout(timer);
}

/** Ⅲ 단원 훅 서브 디스패처 — hook.ts는 이 함수 하나만 부른다. 모르는 장면이면 null. */
export function renderHis3(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpts,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "lambskewer") return renderLambskewer(scene, helper, s, finish, face);
  if (name === "examnotice") return renderExamnotice(scene, helper, s, finish, face);
  if (name === "kanasign") return renderKanasign(scene, helper, s, finish, face);
  if (name === "hanjahw") return renderHanjahw(scene, helper, s, finish, face);
  if (name === "zeroscore") return renderZeroscore(scene, helper, s, finish, face);
  if (name === "chessmate") return renderChessmate(scene, helper, s, finish, face);
  if (name === "arabnum") return renderArabnum(scene, helper, s, finish, face);
  if (name === "francejersey") return renderFrancejersey(scene, helper, s, finish, face);
  if (name === "pepper") return renderPepper(scene, helper, s, finish, face);
  return null;
}
