// [중1 Ⅱ v5] u2l8 kinLab: 「박쥐는 누구와 더 가까울까?」
// 한 통찰: 생물은 겉모습 하나가 아니라 여러 고유한 특징을 견주어 나눈다. 같은 특징이 많을수록 가까운 사이다.
// 무대: 갈매기, 박쥐, 다람쥐가 나란히 있고 그 아래에 특징 네 줄의 표가 있다.
// 조작: 특징 카드 넷(날개, 몸의 겉, 태어나는 법, 젖)을 누르면 그 줄이 채워진다. 박쥐와 같은 칸은 초록 줄로 이어지고,
//   박쥐가 같은 점이 많은 쪽으로 다가간다(날개만 보면 갈매기 쪽, 넷을 다 보면 다람쥐 쪽).
// 흐름: 예측(채점하지 않음) → 조사 넷 → 판정(채점).
// 사실: 박쥐는 날개가 있지만 온몸이 털로 덮여 있고 새끼를 낳아 젖을 먹여 키운다(다람쥐와 같다). 갈매기는 깃털, 알.
// 그림: v4 브랜치 발주본의 사본(public/bio6/life). 다람쥐 그림은 줄무늬가 있는 우리나라 다람쥐다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { bvCanvas, bvSrc } from "../../../ui/bio6Kit";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "./b6Lab";

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
const WHO_IMG: Record<Who, string> = { gull: "bio6/life/gull.webp", bat: "bio6/life/bat.webp", squirrel: "bio6/life/chipmunk.webp" };

interface Feat {
  name: string;
  sub: string;
  cells: Record<Who, string>;
  /** 박쥐와 같은 쪽 */
  like: "gull" | "squirrel";
  say: string;
}
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

export const kinLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as KnlStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: KEYS.length + 1, cls: "knl-stage", qCls: "knl-q" });
  const canvas = bvCanvas(f.stage);

  // ── 무대: 세 동물 ────────────────────────────────────────────────
  const toks = {} as Record<Who, HTMLElement>;
  WHO.forEach((w, i) => {
    const t = el(
      "div",
      { class: `knl-tok ${w}` },
      el("div", { class: "knl-face" }, el("img", { attrs: { src: bvSrc(WHO_IMG[w]), alt: "", draggable: "false" } })),
      el("b", { text: WHO_NAME[w] }),
    );
    t.style.left = `${8 + i * 115}px`;
    toks[w] = t;
  });

  // ── 무대: 특징 표(네 줄) ─────────────────────────────────────────
  const table = el("div", { class: "knl-table" });
  const rows = {} as Record<Key, HTMLElement>;
  KEYS.forEach((k) => {
    const r = el(
      "div",
      { class: "knl-row", dataset: { k } },
      el("div", { class: "knl-cell gull" }),
      el("i", { class: "knl-link l" }),
      el("div", { class: "knl-cell bat" }),
      el("i", { class: "knl-link r" }),
      el("div", { class: "knl-cell squirrel" }),
    );
    rows[k] = r;
    table.appendChild(r);
  });
  const sumL = el("div", { class: "knl-sum l" }, el("span", { text: "박쥐와 같은 점" }), el("b", { text: "0" }));
  const sumR = el("div", { class: "knl-sum r" }, el("span", { text: "박쥐와 같은 점" }), el("b", { text: "0" }));
  canvas.el.append(toks.gull, toks.bat, toks.squirrel, table, sumL, sumR);

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
    (sumL.lastElementChild as HTMLElement).textContent = String(left);
    (sumR.lastElementChild as HTMLElement).textContent = String(right);
    sumL.classList.toggle("lead", left > right);
    sumR.classList.toggle("lead", right > left);
    // 박쥐는 같은 점이 많은 쪽으로 다가간다
    toks.bat.style.transform = `translateX(${(right - left) * 13}px)`;
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
    const r = rows[k];
    r.classList.add("open");
    WHO.forEach((w, i) => {
      const c = r.querySelector(`.knl-cell.${w}`) as HTMLElement;
      tm.later(() => {
        c.textContent = F.cells[w];
        c.classList.add("in");
        if (w !== "bat" && F.cells[w] === F.cells.bat) c.classList.add("same");
      }, 120 + i * 170);
    });
    tm.later(() => {
      r.classList.add(F.like === "gull" ? "link-l" : "link-r");
      (r.querySelector(".knl-cell.bat") as HTMLElement).classList.add("same");
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
