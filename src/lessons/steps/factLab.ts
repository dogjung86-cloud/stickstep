// factLab — 사회 Ⅷ L5 기함: 의심스러운 게시물을 4가지 수사 도구(출처·근거·편향·의도)로
// 해부하는 팩트체크 랩. 미래엔 158쪽 '미디어 리터러시 기르기' 분석 틀(출처/근거/편견·선입견/
// 의도 4기준)과 지구 평평설 예시를 계승(설정 차용 허용 — 문구·판은 자체 제작).
// 문법: 도구는 자유 순서 탭 → 게시물의 해당 부분 하이라이트 + 단서 공개 → msn 2지선다 판정
// (options[0]=정답 고정) → 도구 완료 램프. 4/4 → 최종 판정 → "가짜 정보" 도장 + 능력 명명
// (미디어 리터러시 — 용어 선경험: 랩이 먼저 겪게 하고 concept가 뒤에서 정의).
// rAF 없음 — CSS 전환 + setTimeout 체인(타이머 Set 일괄 해제).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Tool {
  id: string;
  name: string; // 도구 버튼
  target: string; // 하이라이트할 포스트 영역 data-part
  clue: string; // 단서 helper
  q: string;
  options: [string, string]; // [0]=정답
  good: string;
  wrong: string;
  lamp: string; // 완료 시 도구에 붙는 짧은 결론
}

const TOOLS: Tool[] = [
  {
    id: "source",
    name: "출처 확인",
    target: "head",
    clue: "돋보기가 <b>올린 곳</b>을 비췄어요 — '평평 연구 모임'은 평소에도 과학적으로 확인되지 않은 주장을 자주 올려온 곳이에요.",
    q: "이 출처, 믿을 만한가요?",
    options: ["아니요 — 확인되지 않은 주장을 자주 올려온 곳이에요", "네 — 인터넷에 올라온 곳이면 일단 믿을 만해요"],
    good: "맞아요! 정보를 만나면 <b>누가 올렸는지</b>부터 확인해요 — 믿을 만한 기관·전문가인지, 근거 없는 주장을 반복해 온 곳인지요.",
    wrong: "인터넷에 올라왔다는 사실만으로는 아무것도 보증되지 않아요 — 누구나 올릴 수 있으니까요. 출처의 신뢰도부터 따져 봐요. 다시!",
    lamp: "신뢰도 낮음",
  },
  {
    id: "ground",
    name: "근거 검증",
    target: "ground",
    clue: "돋보기가 <b>근거 문장</b>을 비췄어요 — '비행기에서 내려다보면 지평선이 평평해 보인다'가 근거의 전부예요.",
    q: "이 근거, 튼튼한가요?",
    options: ["아니요 — 비행 높이는 지구 크기에 비해 너무 낮아 평평해 보일 뿐이에요", "네 — 눈으로 직접 본 것이니 확실한 근거예요"],
    good: "정확해요! 지구는 아주 커서 낮은 높이에선 굽은 정도가 눈에 안 띌 뿐이에요 — <b>근거가 주장을 정말 받쳐 주는지</b> 따져 보는 게 검증이죠.",
    wrong: "'직접 봤다'가 늘 튼튼한 근거는 아니에요 — 지구는 너무 커서 비행기 높이에선 평평해 '보일' 뿐이거든요. 근거가 주장을 받쳐 주는지 다시 따져 봐요!",
    lamp: "근거 무너짐",
  },
  {
    id: "bias",
    name: "치우침 탐지",
    target: "bias",
    clue: "돋보기가 <b>수상한 문장</b>을 비췄어요 — 우주에서 찍은 지구 사진을 '전부 조작'이라 부르며, 반대 증거를 아예 믿지 못하게 막고 있어요.",
    q: "이 게시물이 증거를 다루는 태도는 어떤가요?",
    options: ["반대 증거를 무조건 부정하며 한쪽으로 몰아가요", "양쪽 증거를 공평하게 살펴보고 있어요"],
    good: "맞아요! 자기 주장에 불리한 증거를 전부 '조작'이라 부르는 건 <b>한쪽으로 치우친</b> 신호예요 — 공정한 정보는 반대 증거도 정직하게 다뤄요.",
    wrong: "다시 읽어 봐요 — 반대 증거(지구 사진)를 살펴보긴커녕 '전부 조작'이라며 문을 닫아 버렸죠. 이건 공평이 아니라 치우침이에요!",
    lamp: "치우침 발견",
  },
  {
    id: "intent",
    name: "의도 추적",
    target: "tail",
    clue: "돋보기가 <b>글의 끝</b>을 비췄어요 — '충격적인 진실! 지금 바로 공유!' 관심을 끌려는 문구가 가득해요.",
    q: "이 글의 목적은 무엇에 가까울까요?",
    options: ["사람들의 관심을 끌어모으려는 것", "과학 지식을 정확하게 알리려는 것"],
    good: "그렇죠! '충격'과 '공유 재촉'은 정확한 앎보다 <b>관심 끌기</b>가 목적일 때 흔한 신호예요 — 글이 <b>왜 쓰였는지</b>까지 읽어 내는 게 마지막 돋보기랍니다.",
    wrong: "정확히 알리려는 글은 근거와 출처로 말해요 — '충격! 바로 공유!'로 재촉하지 않죠. 이 글의 목적을 다시 생각해 봐요!",
    lamp: "관심 끌기",
  },
];

// 기계 검산용 export(qa/audit-soc8-data.mjs)
export const FACT_TOOLS = TOOLS;

export const factLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "tools" } }, el("b", { text: "네 개의 돋보기" }), el("span", { text: "0 / 4" })),
    el("div", { class: "pn-badge world", dataset: { g: "verdict" } }, el("b", { text: "최종 판정" }), el("span", { text: "도장 찍기" })),
    el("div", { class: "pn-badge world", dataset: { g: "name" } }, el("b", { text: "능력의 이름" }), el("span", { text: "수사 완료 후" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "친구가 보내온 수상한 게시물이에요. 아래 <b>수사 도구</b>를 하나씩 골라 게시물을 뜯어 봐요 — 순서는 자유!",
  });

  // ── 게시물 카드(SNS 포스트 — DOM, 하이라이트 영역 4곳) ──
  const post = el(
    "div",
    { class: "fcl-post" },
    el(
      "div",
      { class: "fcl-part fcl-head", dataset: { part: "head" } },
      el("span", { class: "fcl-avatar" }),
      el("div", { class: "fcl-meta" }, el("b", { text: "평평 연구 모임" }), el("span", { text: "어제 · 웹 게시판" })),
    ),
    el("div", { class: "fcl-body" },
      el("p", { html: "지구는 사실 둥글지 않고 <b>평평</b>합니다!" }),
      el("p", { class: "fcl-part", dataset: { part: "ground" }, html: "비행기에서 내려다보면 지평선이 평평하게 보이는 것이 그 증거입니다." }),
      el("div", { class: "fcl-fig", html: flatEarthSvg() }),
      el("p", { class: "fcl-part", dataset: { part: "bias" }, html: "우주에서 찍었다는 둥근 지구 사진은 <b>전부 조작</b>이니 절대 믿지 마세요." }),
      el("p", { class: "fcl-part fcl-tail", dataset: { part: "tail" }, html: "충격적인 진실! 늦기 전에 <b>지금 바로 공유</b>하세요!" }),
    ),
  );
  const stampEl = el("div", { class: "fcl-stamp", text: "가짜 정보" });
  const stage = el("div", { class: "stage fcl-stage" }, post, stampEl);

  // ── 수사 도구 4버튼 ──
  const toolBox = el("div", { class: "fcl-tools" });
  const toolBtns = new Map<string, HTMLButtonElement>();
  for (const t of TOOLS) {
    const b = el(
      "button",
      { class: "fcl-tool", attrs: { type: "button" }, dataset: { t: t.id } },
      el("b", { text: t.name }),
      el("span", { class: "fcl-lamp", text: "?" }),
    ) as HTMLButtonElement;
    toolBtns.set(t.id, b);
    toolBox.appendChild(b);
  }

  // ── 판정(msn) ──
  const quizQ = el("div", { class: "msn-q" });
  const optBtns = [0, 1].map((i) => el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) } }));
  const quizCard = el("div", { class: "msn-quiz fcl-quiz" }, quizQ, ...optBtns);

  host.append(goalChips, helper, stage, toolBox, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const setChip = (g: string, sub?: string): void => {
    const chip = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
    if (!chip) return;
    if (sub) chip.querySelector("span")!.textContent = sub;
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  const doneTools = new Set<string>();
  let active: Tool | null = null; // 현재 열린 도구 판정
  let finalOpen = false;
  let clean = true;

  function highlight(part: string | null): void {
    post.querySelectorAll(".fcl-part").forEach((p) => p.classList.toggle("fcl-hl", part != null && (p as HTMLElement).dataset.part === part));
  }

  function openQuiz(q: string, options: [string, string]): void {
    quizQ.innerHTML = q;
    optBtns.forEach((b, i) => {
      b.classList.remove("ok", "no", "dim");
      b.innerHTML = options[i];
    });
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function openFinal(): void {
    finalOpen = true;
    helper.innerHTML = "네 개의 돋보기가 <b>모두 빨간불</b>이에요 — 이제 최종 판정의 시간!";
    openQuiz("이 게시물, 어떻게 할까요?", [
      "사실이 아니라고 판단하고, 공유하지 않는다",
      "재미있으니 일단 친구들에게 공유한다",
    ]);
  }

  for (const t of TOOLS) {
    const b = toolBtns.get(t.id)!;
    b.addEventListener("click", () => {
      if (doneTools.has(t.id) || finalOpen) return;
      if (active && active.id !== t.id) {
        helper.innerHTML = `지금은 <b>${active.name}</b> 수사 중이에요 — 아래 판정을 먼저 끝내 주세요!`;
        return;
      }
      active = t;
      haptic(HAPTIC.select);
      toolBox.querySelectorAll(".fcl-tool").forEach((x) => x.classList.toggle("live", x === b));
      highlight(t.target);
      helper.innerHTML = t.clue;
      openQuiz(t.q, t.options);
    });
  }

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (finalOpen) {
        if (i === 0) {
          haptic(HAPTIC.correct);
          btn.classList.add("ok");
          optBtns[1].classList.add("dim");
          finalOpen = false;
          quizCard.classList.remove("show");
          setChip("verdict", "도장 쾅!");
          stampEl.classList.add("on");
          haptic(HAPTIC.done);
          helper.innerHTML =
            "판정 완료 — <b>사실이 아닌 정보</b>! 확인 전에는 공유하지 않는 것까지가 수사예요. 방금 여러분이 쓴 이 능력, 정보를 <b>비판적으로 뜯어 보고 판단하는 힘</b>의 이름이 궁금하죠?";
          later(() => {
            setChip("name", "미디어 리터러시");
            helper.innerHTML =
              "이 능력의 이름은 <b>미디어 리터러시</b> — 미디어 속 정보를 비판적으로 평가하고 올바르게 활용하는 힘이에요. 오늘 네 개의 돋보기가 그 시작이랍니다!";
            api.recordQuiz(clean);
            api.enableCTA(s.cta ?? "용어로 정리하기");
          }, 1600);
        } else {
          clean = false;
          haptic(HAPTIC.wrong);
          btn.classList.add("no");
          helper.innerHTML =
            "잠깐! 사실 여부를 확인하기 전에 퍼뜨리면 <b>나도 잘못된 정보의 확성기</b>가 돼요 — 공유는 확인 다음이에요. 다시 골라 봐요!";
          later(() => btn.classList.remove("no"), 900);
        }
        return;
      }
      if (!active) return;
      const t = active;
      if (i === 0) {
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        helper.innerHTML = t.good;
        doneTools.add(t.id);
        const b = toolBtns.get(t.id)!;
        b.classList.remove("live");
        b.classList.add("done");
        (b.querySelector(".fcl-lamp") as HTMLElement).textContent = t.lamp;
        setChip("tools", `${doneTools.size} / 4`);
        if (doneTools.size < 4) {
          const chip = goalChips.querySelector('[data-g="tools"]') as HTMLElement;
          chip.classList.remove("on");
        }
        active = null;
        later(() => {
          quizCard.classList.remove("show");
          highlight(null);
          if (doneTools.size >= 4) later(openFinal, 400);
          else helper.innerHTML = "좋아요 — 다음 <b>수사 도구</b>를 골라 계속 파헤쳐 봐요!";
        }, 1300);
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML = t.wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  api.setCTA("게시물 수사를 끝내요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};

// 포스트 속 그림 — "평평한 지구" 주장 그림(원반 위 비행기). 루트 fill="none"(사진 덮기 사고 예방 관례).
function flatEarthSvg(): string {
  return `<svg viewBox="0 0 200 84" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="fcl-disc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC8E8"/><stop offset="1" stop-color="#4E9AC8"/></linearGradient>
    </defs>
    <ellipse cx="100" cy="62" rx="78" ry="12" fill="url(#fcl-disc)" stroke="#2E6A94" stroke-width="1.6"/>
    <path d="M40 60q18-6 40-4M96 55q26-3 52 4" stroke="#8FCB74" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M30 20h14l8 6h16l-4 5h-18l-8 4-8-2z" fill="#E8EEF5" stroke="#5E6A7E" stroke-width="1.4" transform="rotate(6 50 28)"/>
    <path d="M64 34q22 10 40 12" stroke="#8A93A6" stroke-width="1.4" stroke-dasharray="4 4"/>
    <path d="M148 22l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#F2C24E"/>
  </svg>`;
}
