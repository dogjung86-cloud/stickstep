// [랩의 다른 느낌 샘플 1: 종이 콜라주] u2l8 kinLab 「박쥐는 누구와 더 가까울까?」를 같은 내용, 같은 통찰로 다시 그린다.
// 정본(steps/bio6/kinLab.ts)과 같은 것: 질문, 예측, 특징 네 가지와 칸의 글, 판정, 결론, 채점, 검사 표식(data-knl-*).
// 다른 것은 무대뿐이다. 어두운 판 위의 동그라미 얼굴과 알약 표 대신, 모눈 공책 위에
//   오려 낸 동물 스티커 셋(크게) · 이름을 적은 종이 띠 · 조사할 때마다 붙는 쪽지 · 같은 특징에 긋는 노란 형광펜과 초록 마커
// 로 같은 일을 보여 준다(사용자의 종이 콜라주 영상과 같은 어휘).
// 한 통찰: 생물은 겉모습 하나가 아니라 여러 고유한 특징을 견주어 나눈다. 같은 특징이 많을수록 가까운 사이다.
// 그림: 새 발주 없음. public/bio6/life의 발주본을 qa/make-labstyle-stickers.py가 스티커 모양으로 다시 오린 것(public/labstyle/collage).
// 움직임은 CSS와 타이머만 쓴다(정본 뼈대의 약속 그대로).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "../bio6/b6Lab";

interface KnlStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Key = "wing" | "skin" | "birth" | "milk";
const KEYS: Key[] = ["wing", "skin", "birth", "milk"];
type Who = "gull" | "bat" | "squirrel";
const WHO: Who[] = ["gull", "bat", "squirrel"];
const WHO_NAME: Record<Who, string> = { gull: "갈매기", bat: "박쥐", squirrel: "다람쥐" };

/** 스티커(오려 낸 그림). w는 설계 판(346×230)에서의 폭, ratio는 그림의 가로세로 비, cx는 가운데 자리, rot은 붙인 각도. */
const STICKER: Record<Who, { src: string; w: number; ratio: number; cx: number; top: number; rot: number }> = {
  gull: { src: "labstyle/collage/gull.webp", w: 100, ratio: 1.136, cx: 58, top: 3, rot: -3 },
  bat: { src: "labstyle/collage/bat.webp", w: 124, ratio: 1.579, cx: 173, top: 6, rot: 1.5 },
  squirrel: { src: "labstyle/collage/chipmunk.webp", w: 94, ratio: 1.091, cx: 288, top: 3, rot: 2.5 },
};

interface Feat {
  name: string;
  sub: string;
  cells: Record<Who, string>;
  /** 박쥐와 같은 쪽 */
  like: "gull" | "squirrel";
  say: string;
}
// 글은 정본과 글자 하나까지 같다.
const FEAT: Record<Key, Feat> = {
  wing: {
    name: "날개",
    sub: "있을까, 없을까",
    cells: { gull: "날개 있음", bat: "날개 있음", squirrel: "날개 없음" },
    like: "gull",
    say: "갈매기와 박쥐는 <b>날개</b>가 있어요. 겉모습은 갈매기 쪽과 닮았네요.",
  },
  skin: {
    name: "몸의 겉",
    sub: "털일까, 깃털일까",
    cells: { gull: "깃털로 덮임", bat: "털로 덮임", squirrel: "털로 덮임" },
    like: "squirrel",
    say: "박쥐의 몸은 깃털이 아니라 <b>털</b>로 덮여 있어요. 다람쥐와 같아요.",
  },
  birth: {
    name: "태어나는 법",
    sub: "알일까, 새끼일까",
    cells: { gull: "알을 낳음", bat: "새끼를 낳음", squirrel: "새끼를 낳음" },
    like: "squirrel",
    say: "박쥐는 알이 아니라 <b>새끼</b>를 낳아요. 다람쥐와 같아요.",
  },
  milk: {
    name: "젖",
    sub: "먹여 키울까",
    cells: { gull: "젖을 안 먹임", bat: "젖을 먹임", squirrel: "젖을 먹임" },
    like: "squirrel",
    say: "박쥐는 새끼에게 <b>젖</b>을 먹여 키워요. 이것도 다람쥐와 같아요.",
  },
};

const ic = (bg: string, body: string): string => `<svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="34" height="34" rx="10" fill="${bg}"/>${body}</svg>`;
const ICON: Record<Key, string> = {
  wing: ic("#E7F1FF", `<path d="M6 21c3 -9 11 -13 22 -12 -1 3 -3 5 -6 6 2 0 4 0 6 1 -2 3 -5 4 -9 4 1 1 3 1 5 1 -4 4 -11 5 -18 0z" fill="#74A8E8" stroke="#2F5FA8" stroke-width="1.4" stroke-linejoin="round"/>`),
  skin: ic("#FFF1DC", `<path d="M8 25c0 -6 1 -10 3 -14M14 26c0 -7 1 -12 3 -17M20 26c0 -7 1 -11 3 -15M26 25c0 -5 0 -9 2 -12" stroke="#B9772E" stroke-width="2.4" stroke-linecap="round"/>`),
  birth: ic("#F1ECFF", `<ellipse cx="13" cy="18.5" rx="6.4" ry="8.2" fill="#fff" stroke="#7C5CF0" stroke-width="1.5"/><circle cx="24" cy="20" r="4.6" fill="#D0BFFF" stroke="#7C5CF0" stroke-width="1.5"/><circle cx="25.6" cy="18.8" r=".9" fill="#3F2499"/><path d="M21.4 16.4l-1.4 -2.8 2.8 1.2M26.4 16l1.6 -2.6 .8 3" fill="#D0BFFF" stroke="#7C5CF0" stroke-width="1.2" stroke-linejoin="round"/>`),
  milk: ic("#EAF6FB", `<path d="M17 6c5 6.4 8 10.6 8 14.4a8 8 0 0 1 -16 0c0 -3.8 3 -8 8 -14.4z" fill="#fff" stroke="#3BA3D0" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.6 20.4a4.6 4.6 0 0 0 3.4 4.4" stroke="#A5D8F0" stroke-width="1.8" stroke-linecap="round"/>`),
};

// 쪽지 한 줄의 자리(설계 판 px). 세 칸 사이의 틈을 빨간 마커 선이 건넌다.
const COL_X: Record<Who, number> = { gull: 6, bat: 121, squirrel: 236 };
const COL_W = 104;
const ROW_Y = 107;
const ROW_H = 21;
const ROW_GAP = 3;
/** 쪽지마다 붙인 각도(도). 손으로 붙인 듯 조금씩 다르다. 같은 자리는 언제나 같은 각도다. */
const TILT = [-1.1, 0.7, -0.5, 0.9, -0.8, 0.4, 1.0, -0.6, 0.5, -1.0, 0.8, -0.4];

/** 초록 마커로 그은 이음 선(틈 11px을 건너 양쪽 쪽지에 9px씩 걸친다). 빨강은 앱에서 오답의 색이라 쓰지 않는다. */
const MARKER = "#0B8F5F";
const LINK_SVG = `<svg viewBox="0 0 29 21" aria-hidden="true"><path pathLength="1" d="M2.4 11.6C8.5 8.8 19.5 13.6 26.6 10" fill="none" stroke="${MARKER}" stroke-width="4" stroke-linecap="round"/></svg>`;
/** 초록 마커로 그린 동그라미(수를 두른다). 같은 점이 더 많은 쪽은 속을 칠한다. */
const RING_D = "M15 3.5C8.4 3.3 3.3 8.4 3.5 15.2 3.7 22 8.8 26.8 15.4 26.6 22 26.4 26.9 21.4 26.6 14.8 26.3 8.4 21.6 3.6 15 3.5";
const RING_SVG = `<svg viewBox="0 0 30 30" aria-hidden="true"><path class="lsc-ring-fill" d="${RING_D}Z" fill="${MARKER}" stroke="none"/><path class="lsc-ring-line" pathLength="1" d="${RING_D}" fill="none" stroke="${MARKER}" stroke-width="2.4" stroke-linecap="round"/></svg>`;

export const kinCollage: StepRenderer = (host, step, api) => {
  const s = step as unknown as KnlStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: KEYS.length + 1, cls: "ls-paper lsc-stage", qCls: "knl-q" });
  host.classList.add("ls-collage");
  const canvas = bvCanvas(f.stage);

  // ── 무대: 오려 낸 스티커 셋 ──────────────────────────────────────
  const toks = {} as Record<Who, HTMLElement>;
  WHO.forEach((w, i) => {
    const S = STICKER[w];
    const h = S.w / S.ratio;
    const img = el("img", { class: "lsc-pic", attrs: { src: bvSrc(S.src), alt: "", draggable: "false", width: String(S.w), height: String(Math.round(h)) } });
    // 움직이는 것은 스티커뿐이다. 이름 띠는 제 칸에 붙어 있다(박쥐가 다가가도 어느 줄이 박쥐 것인지 헷갈리지 않게)
    const t = el("div", { class: `lsc-tok ${w}` }, el("div", { class: "lsc-move" }, el("div", { class: "lsc-stick" }, img)), el("b", { class: "lsc-name", text: WHO_NAME[w] }));
    t.style.left = `${S.cx - S.w / 2}px`;
    t.style.top = `${S.top}px`;
    t.style.width = `${S.w}px`;
    t.style.setProperty("--rot", `${S.rot}deg`);
    t.style.setProperty("--d", `${(0.08 + i * 0.11).toFixed(2)}s`);
    toks[w] = t;
  });

  // ── 무대: 쪽지 네 줄(조사하면 붙는다) ────────────────────────────
  const slips = {} as Record<Key, Record<Who, HTMLElement>>;
  const links = {} as Record<Key, Record<"gull" | "squirrel", HTMLElement>>;
  const board = el("div", { class: "lsc-board" });
  KEYS.forEach((k, ri) => {
    const y = ROW_Y + ri * (ROW_H + ROW_GAP);
    slips[k] = {} as Record<Who, HTMLElement>;
    WHO.forEach((w, ci) => {
      const c = el("div", { class: `lsc-slip ${w}`, dataset: { k } }, el("span"));
      c.style.left = `${COL_X[w]}px`;
      c.style.top = `${y}px`;
      c.style.setProperty("--r", `${TILT[ri * 3 + ci]}deg`);
      slips[k][w] = c;
      board.appendChild(c);
    });
    links[k] = {
      gull: el("i", { class: "lsc-link", html: LINK_SVG }),
      squirrel: el("i", { class: "lsc-link", html: LINK_SVG }),
    };
    links[k].gull.style.left = `${COL_X.gull + COL_W - 9}px`;
    links[k].squirrel.style.left = `${COL_X.bat + COL_W - 9}px`;
    [links[k].gull, links[k].squirrel].forEach((n) => {
      n.style.top = `${y}px`;
      board.appendChild(n);
    });
  });
  const mkSum = (side: "l" | "r"): HTMLElement =>
    el("div", { class: `lsc-sum ${side}` }, el("span", { text: "박쥐와 같은 점" }), el("b", {}, el("i", { html: RING_SVG }), el("em", { text: "0" })));
  const sumL = mkSum("l");
  const sumR = mkSum("r");
  canvas.el.append(board, toks.gull, toks.squirrel, toks.bat, sumL, sumR);

  // ── 상태 ─────────────────────────────────────────────────────────
  const done = new Set<Key>();
  let busy = false;
  let phase: "predict" | "look" | "ask" | "done" = "predict";

  const cards = {} as Record<Key, BvCard>;
  KEYS.forEach((k) => {
    cards[k] = bvCard("knl-card", { name: FEAT[k].name, sub: FEAT[k].sub, icon: ICON[k], key: k });
  });

  function tally(): void {
    const left = [...done].filter((k) => FEAT[k].like === "gull").length;
    const right = [...done].filter((k) => FEAT[k].like === "squirrel").length;
    (sumL.querySelector("em") as HTMLElement).textContent = String(left);
    (sumR.querySelector("em") as HTMLElement).textContent = String(right);
    sumL.classList.toggle("lead", left > right);
    sumR.classList.toggle("lead", right > left);
    sumL.classList.toggle("some", left > 0);
    sumR.classList.toggle("some", right > 0);
    // 박쥐 스티커는 같은 점이 많은 쪽으로 다가간다
    toks.bat.style.setProperty("--dx", `${(right - left) * 7}px`);
    host.dataset.knlDone = KEYS.filter((k) => done.has(k)).join(",");
    host.dataset.knlL = String(left);
    host.dataset.knlR = String(right);
    host.dataset.knlBusy = busy ? "1" : "0";
    host.dataset.knlPhase = phase;
  }

  function look(k: Key): void {
    if (phase !== "look" || busy || done.has(k)) return;
    haptic(HAPTIC.tap);
    busy = true;
    const F = FEAT[k];
    WHO.forEach((w, i) => {
      const c = slips[k][w];
      tm.later(() => {
        (c.firstElementChild as HTMLElement).textContent = F.cells[w];
        c.classList.add("in");
      }, 120 + i * 170);
    });
    tm.later(() => {
      // 박쥐와 같은 쪽지에 형광펜을 긋고, 초록 마커로 둘을 잇는다
      slips[k].bat.classList.add("same");
      slips[k][F.like].classList.add("same");
      links[k][F.like].classList.add("on");
      done.add(k);
      cards[k].done();
      cards[k].sub(`${WHO_NAME[F.like]}와 같음`);
      cards[k].el.disabled = true;
      f.pips(done.size);
      f.say(F.say);
      busy = false;
      tally();
      if (done.size === KEYS.length) tm.later(ask, 1700);
    }, 120 + 3 * 170 + 120);
    tally();
  }
  KEYS.forEach((k) => cards[k].el.addEventListener("click", () => look(k)));

  function ask(): void {
    phase = "ask";
    tally();
    f.say("네 가지를 다 조사했어요. 박쥐가 어느 쪽으로 다가갔는지 봐요.");
    f.slot.ask(
      "박쥐는 날개가 있는데도 다람쥐와 더 가까워요. 까닭은?",
      [{ t: "다람쥐와 같은 특징이 더 많아서", ok: true }, { t: "다람쥐와 사는 곳이 같아서" }, { t: "갈매기보다 몸집이 작아서" }],
      (ok) => api.recordQuiz(ok),
      { why: "털, 새끼, 젖. 다람쥐와는 <b>셋</b>이 같고, 갈매기와는 날개 하나뿐이에요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    tally();
    f.pips(KEYS.length + 1);
    f.say("박쥐의 가까운 사이를 찾았어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("생물은 겉모습 하나가 아니라 <b>여러 특징</b>을 견주어 나눠요. 같은 특징이 많을수록 가까운 사이예요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(2, ...KEYS.map((k) => cards[k])));
  tally();
  f.say("날개로 하늘을 나는 <b>박쥐</b>예요. 갈매기와 다람쥐 가운데 누구와 더 가까울지 짐작해 봐요.");
  f.slot.ask(
    "박쥐는 누구와 더 가까운 사이일까요?",
    [{ t: "다람쥐", ok: true }, { t: "갈매기" }],
    () => undefined,
    {
      predict: true,
      nextDelay: 700,
      onNext: () => {
        phase = "look";
        f.slot.showControls();
        f.say("이제 아래에서 <b>특징</b>을 하나씩 조사해 봐요. 박쥐와 같은 특징끼리 이어져요.");
        tally();
      },
    },
  );
  api.setCTA("특징 네 가지를 조사해 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
