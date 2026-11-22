// [중1 Ⅱ v5] u2l8 kinLab: 「하늘을 나는 박쥐는 누구와 더 가까울까?」
// 한 통찰: 생물은 겉모습 하나가 아니라 여러 고유한 특징을 견주어 나눈다. 같은 특징이 많을수록 가까운 사이다.
// 무대: 참새, 박쥐, 강아지가 나란히 있고 그 아래에 특징 네 줄의 표가 있다.
// 조작: 특징 카드 넷(날개, 몸 표면, 번식 방법, 새끼 키우기)을 누르면 그 줄이 채워진다. 박쥐와 같은 칸은 초록 줄로 이어지고,
//   박쥐가 같은 점이 많은 쪽으로 다가간다(날개만 보면 참새 쪽, 넷을 다 보면 강아지 쪽).
// 흐름: 예측(채점하지 않음) → 조사 넷 → 판정(채점).
// 사실: 박쥐는 날개가 있지만 온몸이 털로 덮여 있고 새끼를 낳아 젖을 먹여 키운다(강아지와 같다). 참새는 깃털, 알.
// 그림: 박쥐는 그림 파일(public/bio6/life/bat.webp), 참새와 강아지는 아래의 코드 그림(흰 바탕, 같은 둥근 틀에 든다).

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
type Who = "sparrow" | "bat" | "dog";
const WHO: Who[] = ["sparrow", "bat", "dog"];
const WHO_NAME: Record<Who, string> = { sparrow: "참새", bat: "박쥐", dog: "강아지" };
/** 참새: 밤색 정수리, 흰 뺨의 검은 점, 검은 턱, 줄무늬 날개, 짧고 굵은 부리(왼쪽을 보고 나뭇가지에 앉음). */
const SPARROW = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="64" height="64" fill="#FFFFFF"/>
  <path d="M8 55C20 52.6 38 52.4 58 54.6" stroke="#8A6340" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <path d="M28 49.6L26.6 54.6M33.6 50L33.4 54.8" stroke="#B07A5A" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M44 42L60 50.6L56.4 54.2L41 45.6Z" fill="#6B4423" stroke="#3E2610" stroke-width="1.2" stroke-linejoin="round"/>
  <ellipse cx="33" cy="39.6" rx="16" ry="11.4" transform="rotate(-16 33 39.6)" fill="#DCC9AA" stroke="#5E4428" stroke-width="1.3"/>
  <path d="M27.6 33.6C34 28.4 44.6 29 50.4 36.2C48.4 42.8 41.4 46.6 33.6 45.4C30.6 41.8 28.6 37.8 27.6 33.6Z" fill="#9A6634" stroke="#4A2E14" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M33 34.6l6 7.6M38.4 32.8l6 7.8M43.6 33.4l4.4 6" stroke="#3E2610" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M31.6 40.8C36.4 42.4 41.6 42.2 46 40.4" stroke="#F4EADB" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <circle cx="21" cy="25.6" r="10.4" fill="#F1EBE1" stroke="#5E4428" stroke-width="1.3"/>
  <path d="M10.8 24.2C11.6 16.6 17.4 13.6 22.4 14.4C27.4 15 30.8 18.8 31.4 23.4C27.6 21.6 22.4 21 17.6 21.6C15 22 12.6 22.8 10.8 24.2Z" fill="#8C5426" stroke="#4A2E14" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M10.6 27C12.6 31.4 15.6 33.4 19 33.6C18.2 35.6 16.6 37 14.6 37.4C12 35.6 10.6 31.4 10.6 27Z" fill="#1F1F1F"/>
  <ellipse cx="23.6" cy="29.8" rx="2" ry="1.6" fill="#2A2A2A"/>
  <path d="M11.8 24.4L5.6 26.6L11.6 28.6Z" fill="#3B3B3B" stroke="#1E1E1E" stroke-width=".9" stroke-linejoin="round"/>
  <circle cx="16.4" cy="24.2" r="2.1" fill="#1B1B1B"/>
  <circle cx="15.8" cy="23.5" r=".7" fill="#FFFFFF"/>
</svg>`;
/** 강아지: 앞을 보고 앉은 갈색 강아지의 머리와 가슴(늘어진 귀, 흰 주둥이와 가슴). */
const DOG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect width="64" height="64" fill="#FFFFFF"/>
  <path d="M15 64C15 52 20.6 44.4 32 44.4C43.4 44.4 49 52 49 64Z" fill="#D9A363" stroke="#8A5A2B" stroke-width="1.3"/>
  <path d="M25.6 64C25.4 56.6 27.6 51 32 49.4C36.4 51 38.6 56.6 38.4 64Z" fill="#FBF1E1"/>
  <path d="M17.6 19.4C12 18.8 8.6 25 9.4 33C10 38.4 13 40.6 16.4 38.4C18.6 33.4 19.4 26.2 17.6 19.4Z" fill="#A86A33" stroke="#6E4520" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M46.4 19.4C52 18.8 55.4 25 54.6 33C54 38.4 51 40.6 47.6 38.4C45.4 33.4 44.6 26.2 46.4 19.4Z" fill="#A86A33" stroke="#6E4520" stroke-width="1.2" stroke-linejoin="round"/>
  <ellipse cx="32" cy="30" rx="15.6" ry="14.6" fill="#D9A363" stroke="#8A5A2B" stroke-width="1.3"/>
  <path d="M25.4 18.6C28 16.6 36 16.6 38.6 18.6C36.4 20.2 27.6 20.2 25.4 18.6Z" fill="#E8BD85" opacity=".8"/>
  <ellipse cx="32" cy="37.2" rx="8.6" ry="6.8" fill="#FBF1E1" stroke="#C9A27A" stroke-width="1"/>
  <ellipse cx="32" cy="33.8" rx="3.4" ry="2.5" fill="#2B1D12"/>
  <ellipse cx="31" cy="33.2" rx="1" ry=".6" fill="#FFFFFF" opacity=".8"/>
  <path d="M32 36.4V38.6M28.6 39.4C30 41 34 41 35.4 39.4" stroke="#5A3A22" stroke-width="1.3" stroke-linecap="round" fill="none"/>
  <circle cx="25.8" cy="27.6" r="2.3" fill="#1F140C"/>
  <circle cx="38.2" cy="27.6" r="2.3" fill="#1F140C"/>
  <circle cx="25.2" cy="26.9" r=".75" fill="#FFFFFF"/>
  <circle cx="37.6" cy="26.9" r=".75" fill="#FFFFFF"/>
</svg>`;
/** 둥근 틀 안의 그림: 박쥐는 그림 파일, 참새와 강아지는 코드 그림. */
const WHO_ART: Record<Who, () => HTMLElement> = {
  sparrow: () => el("div", { class: "knl-face", html: SPARROW }),
  bat: () => el("div", { class: "knl-face" }, el("img", { attrs: { src: bvSrc("bio6/life/bat.webp"), alt: "", draggable: "false" } })),
  dog: () => el("div", { class: "knl-face", html: DOG }),
};

interface Feat {
  name: string;
  sub: string;
  cells: Record<Who, string>;
  /** 박쥐와 같은 쪽 */
  like: "sparrow" | "dog";
  say: string;
}
const FEAT: Record<Key, Feat> = {
  wing: {
    name: "날개",
    sub: "있을까, 없을까",
    cells: { sparrow: "날개 있음", bat: "날개 있음", dog: "날개 없음" },
    like: "sparrow",
    say: "참새와 박쥐는 <b>날개</b>가 있어요. 겉모습은 참새 쪽과 닮았네요.",
  },
  skin: {
    name: "몸 표면",
    sub: "털일까, 깃털일까",
    cells: { sparrow: "깃털로 덮임", bat: "털로 덮임", dog: "털로 덮임" },
    like: "dog",
    say: "박쥐의 몸은 깃털이 아니라 <b>털</b>로 덮여 있어요. 강아지와 같아요.",
  },
  birth: {
    name: "번식 방법",
    sub: "알일까, 새끼일까",
    cells: { sparrow: "알을 낳음", bat: "새끼를 낳음", dog: "새끼를 낳음" },
    like: "dog",
    say: "박쥐는 알이 아니라 <b>새끼</b>를 낳아요. 강아지와 같아요.",
  },
  milk: {
    name: "새끼 키우기",
    sub: "젖을 먹여 키울까",
    cells: { sparrow: "젖을 안 먹임", bat: "젖을 먹임", dog: "젖을 먹임" },
    like: "dog",
    say: "박쥐는 새끼에게 <b>젖</b>을 먹여 키워요. 이것도 강아지와 같아요.",
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
  // 세 줄 도움말을 처음부터 잡아 둔다(360 폭에서 세 줄이 되는 글이 있다. 랩 도중에 무대가 밀리지 않게)
  const f = bvFrame(host, { title: s.title, steps: KEYS.length + 1, cls: "knl-stage", qCls: "knl-q", api, tall: true });
  const canvas = bvCanvas(f.stage);

  // ── 무대: 세 동물 ────────────────────────────────────────────────
  const toks = {} as Record<Who, HTMLElement>;
  WHO.forEach((w, i) => {
    const t = el("div", { class: `knl-tok ${w}` }, WHO_ART[w](), el("b", { text: WHO_NAME[w] }));
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
      el("div", { class: "knl-cell sparrow" }),
      el("i", { class: "knl-link l" }),
      el("div", { class: "knl-cell bat" }),
      el("i", { class: "knl-link r" }),
      el("div", { class: "knl-cell dog" }),
    );
    rows[k] = r;
    table.appendChild(r);
  });
  const sumL = el("div", { class: "knl-sum l" }, el("span", { text: "박쥐와 같은 점" }), el("b", { text: "0" }));
  const sumR = el("div", { class: "knl-sum r" }, el("span", { text: "박쥐와 같은 점" }), el("b", { text: "0" }));
  canvas.el.append(toks.sparrow, toks.bat, toks.dog, table, sumL, sumR);

  // ── 상태 ─────────────────────────────────────────────────────────
  const done = new Set<Key>();
  let busy = false;
  let phase: "predict" | "look" | "ask" | "done" = "predict";

  const cards = {} as Record<Key, BvCard>;
  KEYS.forEach((k) => {
    cards[k] = bvCard("knl-card", { name: FEAT[k].name, sub: FEAT[k].sub, icon: ICON[k], key: k });
  });

  function tally(): void {
    const left = [...done].filter((k) => FEAT[k].like === "sparrow").length;
    const right = [...done].filter((k) => FEAT[k].like === "dog").length;
    (sumL.lastElementChild as HTMLElement).textContent = String(left);
    (sumR.lastElementChild as HTMLElement).textContent = String(right);
    sumL.classList.toggle("lead", left > right);
    sumR.classList.toggle("lead", right > left);
    // 박쥐는 같은 점이 많은 쪽으로 다가간다. 같은 점 하나에 26px(2026-11-15 그래픽 손질: 고치기 전 13px라 넷을 다 봐도
    // 무대 폭의 8%만 움직여 도움말 "어느 쪽으로 다가갔는지 봐요"가 가리키는 움직임이 약했다. 넷을 다 보면 52px, 얼굴 사이 9px까지)
    toks.bat.style.transform = `translateX(${(right - left) * 26}px)`;
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
      r.classList.add(F.like === "sparrow" ? "link-l" : "link-r");
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
    f.say("네 가지 특징을 모두 조사했어요! 박쥐가 참새와 강아지 중 어느 쪽으로 다가갔는지 살펴보세요.");
    f.slot.ask(
      "박쥐는 날개가 있어 하늘을 나는데도 참새보다 강아지와 더 가까운 사이예요. 그 까닭은 무엇인가요?",
      // 정답 보기만 길지 않게 둔다(SCI_GUIDE 중1 Ⅱ v5 문제 저작 규칙). 정답만 길면 길이만 보고 고를 수 있다. 몸 표면과 번식 방법은 이유 글이 말한다
      [{ t: "고유한 특징이 강아지와 더 많이 같아서", ok: true }, { t: "강아지와 살아가는 곳이 비슷해서" }, { t: "참새와 몸집이 서로 달라서" }],
      (ok) => api.recordQuiz(ok),
      { why: "박쥐는 참새와 날개가 있다는 점만 같지만, 강아지와는 <b>몸이 털로 덮여 있고 새끼를 낳아 젖을 먹여 키운다는 세 가지 고유한 특징</b>이 같아요.", onNext: finish },
    );
  }
  function finish(): void {
    phase = "done";
    tally();
    f.pips(KEYS.length + 1);
    f.say("날개만 보면 참새와 닮았지만, 생물 고유의 특징을 여러 가지 비교해 보니 강아지와 훨씬 가까운 사이였어요!");
    f.slot.conclude("생물을 분류할 때는 눈에 띄는 겉모습 하나가 아니라 몸의 구조, 번식 방법 등 <b>생물 고유의 여러 특징</b>을 비교해야 해요. 공통된 특징이 많을수록 더 가까운 사이예요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(2, ...KEYS.map((k) => cards[k])));
  tally();
  f.say("날개로 밤하늘을 나는 <b>박쥐</b>예요. 새인 참새와 포유류인 강아지 가운데 누구와 더 가까운 사이일지 예측해 볼까요?");
  f.slot.ask(
    "박쥐는 누구와 더 가까운 사이일까요?",
    [{ t: "강아지", ok: true }, { t: "참새" }],
    () => undefined,
    {
      predict: true,
      nextDelay: 700,
      onNext: () => {
        phase = "look";
        f.slot.showControls();
        f.say("이제 아래 카드를 눌러 <b>네 가지 특징</b>을 하나씩 조사해 보세요. 박쥐와 같은 특징을 가진 동물 쪽으로 선이 이어져요.");
        tally();
      },
    },
  );
  api.setCTA("네 가지 특징 카드를 모두 조사해 보세요", { enabled: false });
  return () => {
    tm.clear();
    canvas.off();
  };
};
