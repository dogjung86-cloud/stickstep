// hookSoc12 — 사회 Ⅻ(인권과 기본권) 훅 장면 6종(L1은 만화 「당연한 것들의 역사」가 도입 담당).
// hook.ts가 renderSoc12 서브 디스패처(hookSoc11 문법 — 모르는 장면이면 null)로 위임한다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만
// 손그림 라인. CSS는 hs8-frame·hs8-btn·hs8-noti 완전 재사용(신규 클래스 0 — soc.css 수정 불필요).
//   tenbook    L2 — 두꺼운 법전 어딘가에 '행복'이라는 단어가?(헌법 제10조)
//   schoolfree L3 — 공책은 돈 주고 사는데 수업은 왜 공짜?(무상 의무 교육 — 사회권)
//   seatbelt   L4 — 안전띠 강제는 자유 침해 아닐까?(기본권 제한)
//   dormrule   L5 — 규정과 달리 잠긴 기숙사 문(구제 기관 — 비상 사례 가상화)
//   whoworker  L6 — 가게 안에서 '근로자'가 아닌 사람은?(근로자·사용자)
//   teenwage   L7 — "어리니까 시급은 조금만"?(청소년도 같은 최저 임금)
// 민감 가드(인권 단원): 침해 장면 재현·클로즈업 0(잠긴 문·서류·저울로만), 특정 집단 표지 0,
// 무성별 스틱맨, 예측 choices[0]=정답·good≠bad 공용 규칙, 소재 이름은 도입에서 먼저 소개.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

/** 미니 스틱맨(팔·표정 옵션 — socFigures 계열 공용 문법) */
function man(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy" | "wow"; r?: number } = {}): string {
  const r = opts.r ?? 6.4;
  const arm = opts.arm ?? "out";
  const arms =
    arm === "up"
      ? `M${x} ${y + r + 4}l-${r + 2} -7M${x} ${y + r + 4}l${r + 2} -9`
      : arm === "down"
        ? `M${x} ${y + r + 4}l-${r + 1} ${r + 1}M${x} ${y + r + 4}l${r + 1} ${r + 1}`
        : `M${x} ${y + r + 4}l-${r + 2} 4M${x} ${y + r + 4}l${r + 2} 4`;
  const mood = opts.mood ?? "ok";
  const face =
    mood === "sad"
      ? `<circle cx="${x - 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 2} ${y + 3.6}q2-1.6 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3.2} ${y - 1.2}q1.3-1.5 2.6 0M${x + 0.6} ${y - 1.2}q1.3-1.5 2.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/><path d="M${x - 2.4} ${y + 2.6}q2.4 2.2 4.8 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`
        : mood === "wow"
          ? `<circle cx="${x - 2.1}" cy="${y - 1}" r="1.5" fill="none" stroke="#3C4654" stroke-width="1.1"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1.5" fill="none" stroke="#3C4654" stroke-width="1.1"/><ellipse cx="${x}" cy="${y + 3.4}" rx="1.5" ry="2" fill="none" stroke="#3C4654" stroke-width="1.1"/>`
          : `<circle cx="${x - 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.8} ${y + 3}q1.8 1.3 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`;
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}`;
}

const HS12_DEFS = `<defs>
  <linearGradient id="hs12-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="hs12-plum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C86ADB"/><stop offset=".55" stop-color="#AE3EC9"/><stop offset="1" stop-color="#8B2FA4"/></linearGradient>
  <linearGradient id="hs12-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87838"/><stop offset="1" stop-color="#8A6034"/></linearGradient>
  <linearGradient id="hs12-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECC26A"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
</defs>`;

function wrap145(inner: string): string {
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${HS12_DEFS}
    <ellipse cx="120" cy="139" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

/* ══════════ L2: 두꺼운 법전 속 '행복' 찾기 ══════════ */
function tenbookSvg(beat: number): string {
  // beat 0=닫힌 법전·1=조문 페이지·2=빛나는 페이지(단어는 감춤 — 정체는 예측 후 공개)
  const book =
    beat === 0
      ? `<rect x="76" y="34" width="88" height="72" rx="6" fill="url(#hs12-plum)" stroke="#6E2482" stroke-width="1.8"/>
         <path d="M84 34v72" stroke="#8B2FA4" stroke-width="2.4"/>
         <rect x="100" y="56" width="42" height="24" rx="4" fill="none" stroke="#E8C2F2" stroke-width="1.6"/>`
      : beat === 1
        ? `<path d="M120 32q-44-8-52 4v66q8-10 52-4q44-6 52 4V36q-8-12-52-4z" fill="url(#hs12-paper)" stroke="#8A93A6" stroke-width="1.6"/>
         <path d="M120 32v66" stroke="#C8D2DE" stroke-width="1.6"/>
         ${[0, 1, 2, 3].map((i) => `<path d="M80 ${48 + i * 12}h28M132 ${48 + i * 12}h28" stroke="#B8C2CE" stroke-width="1.8" stroke-linecap="round"/>`).join("")}`
        : `<path d="M120 32q-44-8-52 4v66q8-10 52-4q44-6 52 4V36q-8-12-52-4z" fill="url(#hs12-paper)" stroke="#8A93A6" stroke-width="1.6"/>
         <path d="M120 32v66" stroke="#C8D2DE" stroke-width="1.6"/>
         ${[0, 1, 2, 3].map((i) => `<path d="M80 ${48 + i * 12}h28" stroke="#B8C2CE" stroke-width="1.8" stroke-linecap="round"/>`).join("")}
         <g class="hs8-noti">
           <rect x="130" y="46" width="34" height="42" rx="5" fill="#FBF3FD" stroke="#AE3EC9" stroke-width="1.6"/>
           <text x="147" y="72" text-anchor="middle" font-size="15" font-weight="900" fill="#AE3EC9">?</text>
           <path d="M147 34l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8z" fill="#E4A8F0"/>
         </g>`;
  return wrap145(`
    ${book}
    ${man(36, 96, { mood: beat >= 2 ? "wow" : "ok" })}
    <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${beat === 0 ? "나라에서 가장 높은 법의 책" : beat === 1 ? "딱딱한 문장들이 빼곡…" : "그런데 어느 조문에서 빛이 나요!"}</text>`);
}

export function renderTenBook(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "법전 펼쳐 보기 (1/3)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = tenbookSvg(0);
  helper.innerHTML = "나라의 최고법이 적힌 두꺼운 책, 온통 딱딱한 규칙만 있을 것 같죠? 한 장씩 펼쳐 봐요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = tenbookSvg(1);
      helper.innerHTML = "예상대로 빼곡한 조문들, 그런데 계속 넘기다 보면 뜻밖의 단어가 나온대요.";
      btn.textContent = "더 넘겨 보기 (2/3)";
    } else {
      fig.innerHTML = tenbookSvg(2);
      btn.textContent = "조문 발견!";
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "열 번째 조문에서 빛이 나요. 이 안에 <b>'행복'</b>이라는 단어가 정말 적혀 있을까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "있다. 행복을 추구할 권리가 국민의 권리로 적혀 있다",
            "없다. 법에는 딱딱한 규칙과 처벌만 적는다",
            "동화책에나 나오는 이야기다",
          ],
          good: "정말 있어요! \"모든 국민은 인간으로서의 존엄과 가치를 가지며, <b>행복을 추구할 권리</b>를 가진다\", 최고법 한가운데에 행복이 살고 있죠. 이 조문이 오늘 이야기의 주인공이에요!",
          bad: "놀랍게도 있답니다. 최고법의 열 번째 조문이 \"모든 국민은 인간으로서의 존엄과 가치를 가지며, <b>행복을 추구할 권리</b>를 가진다\"예요. 법의 심장에 행복이 적혀 있는 이유, 지금 만나러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 공책은 사는데 수업은 공짜? ══════════ */
function schoolfreeSvg(beat: number): string {
  // beat 0=문구점 계산대(값 치름)·1=학교 정문(고지서 없음)
  if (beat === 0) {
    return wrap145(`
      <rect x="34" y="56" width="82" height="50" rx="6" fill="url(#hs12-wood)" stroke="#6E4E26" stroke-width="1.6"/>
      <rect x="44" y="40" width="30" height="18" rx="3" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.4"/>
      <path d="M50 46h18M50 51h12" stroke="#B8C2CE" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="96" cy="46" r="6.4" fill="url(#hs12-gold)" stroke="#8A6034" stroke-width="1.3"/>
      ${man(148, 62, { mood: "ok" })}
      ${man(196, 84, { mood: "joy", r: 5.4 })}
      <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">공책 한 권, 값을 치러야 내 것이 돼요</text>`);
  }
  return wrap145(`
    <rect x="70" y="34" width="100" height="60" rx="6" fill="url(#hs12-paper)" stroke="#8A93A6" stroke-width="1.6"/>
    <path d="M64 34l56-20 56 20" stroke="#8A93A6" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <rect x="108" y="64" width="24" height="30" rx="3" fill="#C8B0D4"/>
    <rect x="80" y="46" width="18" height="12" rx="2" fill="#EAF2FA"/><rect x="142" y="46" width="18" height="12" rx="2" fill="#EAF2FA"/>
    <g class="hs8-noti">
      <rect x="178" y="52" width="34" height="24" rx="4" fill="url(#hs12-paper)" stroke="#AE3EC9" stroke-width="1.6" transform="rotate(6 195 64)"/>
      <path d="M186 60h18M186 66h12" stroke="#E4A8F0" stroke-width="1.8" stroke-linecap="round" transform="rotate(6 195 64)"/>
      <path d="M182 78q13 6 26 0" stroke="#AE3EC9" stroke-width="1.6" fill="none" stroke-dasharray="2 3"/>
    </g>
    ${man(40, 88, { mood: "wow" })}
    <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">그런데 수업료 고지서는… 아무리 찾아도 없어요?</text>`);
}

export function renderSchoolFree(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "학교로 가 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = schoolfreeSvg(0);
  helper.innerHTML = "문구점에서 공책을 사면 값을 치르죠. 세상 대부분의 것에는 값이 있어요. 그럼 매일 듣는 <b>학교 수업</b>은요?";
  let done = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.innerHTML = schoolfreeSvg(1);
    btn.textContent = "이상한 점 발견!";
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "수업은 매일 듣는데 <b>수업료 고지서</b>는 한 번도 본 적이 없어요. 중학교 수업, 왜 공짜일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "교육을 받을 권리를 국가가 보장할 의무가 있어서",
          "학교가 저절로 운영되기 때문에",
          "공부는 원래 값을 매길 수 없어서",
        ],
        good: "정확해요! 모든 국민에게 <b>교육을 받을 권리</b>가 있고, 의무 교육은 무상, 국가가 보장할 의무를 지죠. 이렇게 '국가에 요구할 수 있는 권리'가 있다니, 오늘 그 서랍들을 열어 봐요!",
        bad: "저절로 되는 건 없어요. 선생님 월급도 교실 불빛도 나라 살림에서 나오죠. 모든 국민에게 <b>교육을 받을 권리</b>가 있어 국가가 무상 의무 교육을 보장하는 거예요. 이런 권리의 서랍들을 열어 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 안전띠 강제는 자유 침해? ══════════ */
function seatbeltSvg(beat: number): string {
  // beat 0=차에 탐(경고 점멸)·1=벨트 착용(평온)
  const belt =
    beat >= 1
      ? `<path d="M96 58q22 18 34 34" stroke="#3C4654" stroke-width="4" stroke-linecap="round"/>
         <g class="hs8-noti"><circle cx="130" cy="92" r="5" fill="#2E8A4C"/><path d="M127.6 92l1.8 2 3-3.6" stroke="#FFF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`
      : `<path d="M96 58q10 8 16 16" stroke="#8A93A6" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="4 5"/>
         <g class="hs8-noti"><circle cx="176" cy="44" r="7" fill="#C0392E"/><text x="176" y="47.6" text-anchor="middle" font-size="9" font-weight="900" fill="#FFF">!</text></g>`;
  return wrap145(`
    <path d="M34 100q0-30 26-42q16-22 62-22q46 0 60 22q26 12 26 42z" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.8"/>
    <rect x="70" y="48" width="56" height="30" rx="6" fill="#FDFEFF" stroke="#B8C2CE" stroke-width="1.4"/>
    <circle cx="70" cy="104" r="14" fill="#39455C"/><circle cx="70" cy="104" r="6" fill="#5A6478"/>
    <circle cx="178" cy="104" r="14" fill="#39455C"/><circle cx="178" cy="104" r="6" fill="#5A6478"/>
    ${man(96, 50, { mood: beat >= 1 ? "joy" : "ok", r: 6 })}
    <circle cx="146" cy="66" r="9" fill="none" stroke="#5A6478" stroke-width="2.4"/>
    ${belt}
    <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${beat >= 1 ? "찰칵, 경고음이 멈추고 출발!" : "차에 타자마자 삑삑, 안전띠 경고음이에요"}</text>`);
}

export function renderSeatbelt(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "안전띠 매기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = seatbeltSvg(0);
  helper.innerHTML = "가족 차에 타자마자 <b>삑삑</b>, 안전띠를 매기 전엔 경고음이 멈추지 않아요. 법이 <b>모든 탑승자에게</b> 안전띠를 강제하고 있거든요.";
  let done = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.innerHTML = seatbeltSvg(1);
    btn.textContent = "찰칵!";
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML = "그런데 잠깐, 맬지 말지는 <b>내 자유</b> 아닌가요? 법이 자유를 강제로 제한해도 되는 걸까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "생명과 안전을 지키기 위해 꼭 필요한 만큼 법으로 정한 제한이다",
          "어떤 이유로도 자유를 제한하면 안 되니 잘못된 법이다",
          "운전자를 감시하기 위한 장치일 뿐이다",
        ],
        good: "바로 그거예요! 기본권도 <b>필요한 경우엔 법률로</b> 제한할 수 있어요. 단, 아무 때나·아무렇게나는 아니죠. 오늘은 그 '제한의 규칙'을 판정하러 가요!",
        bad: "자유가 소중한 건 맞아요. 하지만 사고의 순간 안전띠는 생명을 지키는 마지막 손이죠. 이렇게 <b>꼭 필요한 경우, 법률로</b>라는 조건을 지키면 기본권도 제한할 수 있어요. 그 규칙을 판정하러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 규정과 다른 잠긴 문(기숙사) ══════════ */
function dormruleSvg(beat: number): string {
  // beat 0=규정판(주말 외출 가능)·1=그런데 문이 잠김·2=학생 시무룩+물음표
  const board = `
    <rect x="34" y="34" width="64" height="46" rx="5" fill="url(#hs12-paper)" stroke="#8A93A6" stroke-width="1.5"/>
    <path d="M42 44h48M42 52h40M42 60h44" stroke="#B8C2CE" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M42 68h28" stroke="#AE3EC9" stroke-width="1.9" stroke-linecap="round"/>`;
  const door = `
    <rect x="130" y="30" width="66" height="84" rx="6" fill="url(#hs12-wood)" stroke="#6E4E26" stroke-width="1.8"/>
    <circle cx="186" cy="74" r="3" fill="#5A4420"/>`;
  const lock =
    beat >= 1
      ? `<g class="hs8-noti">
          <rect x="152" y="66" width="20" height="17" rx="3.4" fill="#8A93A6" stroke="#5A6478" stroke-width="1.4"/>
          <path d="M157 66v-6q0-6 5-6t5 6v6" stroke="#5A6478" stroke-width="2.2" fill="none"/>
        </g>`
      : "";
  const kid = beat >= 2 ? man(112, 92, { mood: "sad", arm: "down", r: 6 }) : man(112, 92, { mood: "ok", r: 6 });
  const q = beat >= 2 ? `<text x="112" y="66" text-anchor="middle" font-size="14" font-weight="900" fill="#AE3EC9" class="hs8-noti">?</text>` : "";
  return wrap145(`
    ${board}${door}${lock}${kid}${q}
    <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${beat >= 2 ? "규정엔 된다는데 문은 잠겨 있어요. 어디에 말하죠?" : beat >= 1 ? "그런데 주말 문이 잠겼어요. 물어보지도 않고요" : "기숙사 규정판: 주말엔 외출할 수 있다고 적혀 있어요"}</text>`);
}

export function renderDormRule(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "다음 장면 보기 (1/2)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = dormruleSvg(0);
  helper.innerHTML = "스틱 중학교 기숙사의 규정판, <b>\"주말에는 외출할 수 있다\"</b>고 적혀 있어요. 그런데 이번 주말, 이상한 일이 벌어져요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    if (stage === 1) {
      fig.innerHTML = dormruleSvg(1);
      helper.innerHTML = "학생들에게 <b>물어보지도 않고</b> 주말 외출문이 잠겼어요. 규정과 다르게요.";
      btn.textContent = "다음 장면 보기 (2/2)";
    } else {
      fig.innerHTML = dormruleSvg(2);
      btn.textContent = "장면 관찰 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      helper.innerHTML = "규정엔 된다는데 문은 잠겨 있다. 학생들의 자유가 부당하게 막힌 걸지도 몰라요. 이럴 때 <b>도움을 청할 곳</b>이 있을까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "있다. 침해를 조사해 바로잡도록 권고하는 국가기관이 있다",
            "없다. 학교 안의 일은 참는 수밖에 없다",
            "졸업할 때까지 기다리는 방법뿐이다",
          ],
          good: "있어요! 인권 침해를 <b>조사하고 개선을 권고</b>하는 국가기관에 진정을 넣을 수 있죠. 방패가 뚫렸을 때 두드릴 문들, 오늘 전부 알려 드릴게요!",
          bad: "참지 않아도 돼요. 우리나라에는 이런 침해를 <b>조사하고 바로잡도록 권고</b>하는 국가기관이 있답니다. 방패가 뚫렸을 때 두드릴 문들, 오늘 전부 알려 드릴게요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 가게 안 '근로자' 찾기 ══════════ */
function whoworkerSvg(hi: number): string {
  // hi 0=전체·1=직원·2=알바생·3=사장(계산대)
  const ring = (x: number, y: number, on: boolean): string =>
    on ? `<circle cx="${x}" cy="${y}" r="21" fill="none" stroke="#AE3EC9" stroke-width="2.2" stroke-dasharray="5 5" class="hs8-noti"/>` : "";
  return wrap145(`
    <rect x="26" y="26" width="188" height="14" rx="5" fill="url(#hs12-plum)" opacity=".85"/>
    <rect x="150" y="66" width="64" height="44" rx="6" fill="url(#hs12-wood)" stroke="#6E4E26" stroke-width="1.6"/>
    <rect x="160" y="54" width="22" height="13" rx="2.6" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.3"/>
    ${man(52, 70, { mood: "ok" })}
    <path d="M44 84h16v10h-16z" fill="#E8DCF0" stroke="#8A93A6" stroke-width="1.2"/>
    ${man(104, 72, { mood: "joy" })}
    <ellipse cx="112" cy="88" rx="9" ry="3" fill="#EEF2F6" stroke="#8A93A6" stroke-width="1.2"/>
    <circle cx="109" cy="85" r="2.4" fill="#C8B0D4"/>
    ${man(182, 48, { mood: "ok" })}
    ${ring(52, 78, hi === 1)}${ring(104, 80, hi === 2)}${ring(182, 58, hi === 3)}
    <text x="52" y="120" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">주방 직원</text>
    <text x="104" y="120" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">방학 알바생</text>
    <text x="182" y="126" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">가게 주인</text>
    <text x="120" y="140" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">스틱 분식의 세 사람, 전부 부지런히 일하는 중!</text>`);
}

export function renderWhoWorker(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "한 사람씩 보기 (1/3)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = whoworkerSvg(0);
  helper.innerHTML = "스틱 분식의 점심시간, <b>주방 직원</b>, <b>방학 동안만 일하는 아르바이트생</b>, <b>가게 주인</b> 세 사람 모두 바쁘게 일하고 있어요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 3) return;
    stage += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = whoworkerSvg(stage);
    if (stage === 1) {
      helper.innerHTML = "주방 직원, 매달 <b>월급을 받고</b> 요리를 해요.";
      btn.textContent = "한 사람씩 보기 (2/3)";
    } else if (stage === 2) {
      helper.innerHTML = "방학 알바생, <b>한 달만</b> 일하고 시급을 받아요.";
      btn.textContent = "한 사람씩 보기 (3/3)";
    } else {
      btn.textContent = "세 사람 관찰 완료";
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      helper.innerHTML = "가게 주인, 가게를 운영하고 <b>월급을 주는</b> 쪽이에요. 셋 다 열심히 일하지만, 법이 말하는 <b>'근로자'가 아닌 사람</b>이 한 명 있대요. 누굴까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "가게 주인, 임금을 주는 쪽이라 근로자가 아니다",
            "방학 알바생, 잠깐 일하니 근로자가 아니다",
            "주방 직원, 주방에만 있으니 근로자가 아니다",
          ],
          good: "정확해요! 근로자는 <b>임금을 받고</b> 일하는 사람, 가게 주인은 임금을 <b>주는</b> 쪽이라 '사용자'예요. 한 달 알바생도 어엿한 근로자! 오늘은 근로자의 방패를 배우러 가요.",
          bad: "일하는 곳이나 기간은 상관없어요. 열쇠는 <b>임금을 받는가</b>예요. 알바생도 직원도 임금을 받으니 근로자, 가게 주인은 임금을 주는 쪽이라 '사용자'랍니다. 근로자의 방패를 배우러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: "어리니까 시급은 조금만"? ══════════ */
function teenwageSvg(beat: number): string {
  // beat 0=알바 공고판·1=동전 몇 닢 vs 법 책 등장
  if (beat === 0) {
    return wrap145(`
      <rect x="52" y="30" width="70" height="52" rx="5" fill="url(#hs12-paper)" stroke="#8A93A6" stroke-width="1.6"/>
      <path d="M62 42h50M62 52h38M62 62h44" stroke="#B8C2CE" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M62 72h26" stroke="#AE3EC9" stroke-width="2" stroke-linecap="round"/>
      ${man(168, 66, { mood: "joy", r: 6.8 })}
      <path d="M150 84q-10 4-18 2" stroke="#8A93A6" stroke-width="1.5" fill="none" stroke-dasharray="3 3"/>
      <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">방학 아르바이트 모집 공고, 설레는 첫 지원!</text>`);
  }
  return wrap145(`
    ${man(56, 60, { mood: "wow", r: 6.8 })}
    ${man(150, 56, { mood: "ok", r: 6.4 })}
    <g>
      <circle cx="108" cy="86" r="7" fill="url(#hs12-gold)" stroke="#8A6034" stroke-width="1.3"/>
      <circle cx="122" cy="90" r="7" fill="url(#hs12-gold)" stroke="#8A6034" stroke-width="1.3"/>
    </g>
    <g class="hs8-noti">
      <rect x="176" y="44" width="38" height="50" rx="5" fill="url(#hs12-plum)" stroke="#6E2482" stroke-width="1.6"/>
      <path d="M182 56h26M182 64h20M182 72h24" stroke="#E8C2F2" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M195 30l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8z" fill="#E4A8F0"/>
    </g>
    <text x="120" y="128" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">"어리니까 조금만", 그때 법의 책이 반짝!</text>`);
}

export function renderTeenWage(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "면접 보러 가기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = teenwageSvg(0);
  helper.innerHTML = "고등학생 사촌 언니·형이 <b>첫 방학 아르바이트</b>에 지원했어요. 두근두근 면접 날!";
  let done = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    haptic(HAPTIC.select);
    fig.innerHTML = teenwageSvg(1);
    btn.textContent = "잠깐, 그 말은…";
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "그런데 면접에서 이런 말을 들었어요. <b>\"어리니까 시급은 조금만 받아.\"</b> 법은 이 말에 뭐라고 할까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "청소년도 성인과 같은 최저 임금을 받아야 한다",
          "어리면 시급을 적게 받는 것이 법에 맞다",
          "청소년은 원래 일할 수 없으니 시급도 없다",
        ],
        good: "정확해요! 법이 정한 <b>최저 임금</b>은 나이와 상관없이 똑같이 적용돼요. '어리니까 조금만'은 법 위반이죠. 일터에서 방패를 지키는 법, 오늘 배우러 가요!",
        bad: "그렇지 않아요. 15세 이상이면 청소년도 일할 수 있고, 이때 <b>성인과 같은 최저 임금</b>을 받아야 해요. '어리니까 조금만'은 법이 금지한 말이랍니다. 일터의 방패를 지키는 법, 배우러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/** 사회 Ⅻ 서브 디스패처 — hook.ts가 위임(모르는 장면이면 null) */
export function renderSoc12(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "tenbook") return renderTenBook(scene, helper, s, finish, face);
  if (name === "schoolfree") return renderSchoolFree(scene, helper, s, finish, face);
  if (name === "seatbelt") return renderSeatbelt(scene, helper, s, finish, face);
  if (name === "dormrule") return renderDormRule(scene, helper, s, finish, face);
  if (name === "whoworker") return renderWhoWorker(scene, helper, s, finish, face);
  if (name === "teenwage") return renderTeenWage(scene, helper, s, finish, face);
  return null;
}
