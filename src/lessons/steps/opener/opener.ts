// opener: 도입 샘플의 공용 틀(2026-11-11, 중1 Ⅱ 도입 다시 만들기 샘플. 병행 토글 ss.u2intro 뒤에서만 보인다).
// 지금의 hook 스텝과 무엇이 다른가
//   · 글이 한 겹이다: 제목(질문 한 줄) 아래 바로 무대. 리드와 첫 말풍선을 따로 두지 않는다.
//   · 한 화면이다: 제목 → 무대 → 아래 칸(높이 고정). 예측 보기와 쌤의 말이 아래 칸을 번갈아 쓴다.
//     처음, 예측이 뜬 때, 답한 뒤 세 시점 모두 390×700의 스크롤 영역 554px 안에 든다.
//   · 답한 뒤의 말이 누른 보기 바로 아래에 붙는다(고르지 않은 보기는 접힌다. 화면 밖으로 밀려나지 않는다).
//   · 그림은 손그림 코드 그림이다(qa/sketch/scenes/intro-u2.mjs → ui/introArt.generated.ts, 열릴 때만 내려받는다).
// 예측 보기는 공용 hookAsk.ask()만 쓴다(choices[0]이 옳은 예측, 정답 없는 예측은 neutral).
// 장면은 scenes 표에 등록한다: longcell(u2l4) · baskets(u2l9) · factory(u2l2).
// CSS 접두는 .opn-(styles/opener.css).

import { el } from "../../../core/dom";
import { stickAvatar, setStickAvatar, type AvatarKind } from "../../../ui/avatar";
import { ask as hookAsk, type AskOpts } from "../hookAsk";
import { glue } from "../glue";
import type { StepRenderer } from "../../types";
import { longCell } from "./longCell";
import { baskets } from "./baskets";
import { factoryOff } from "./factoryOff";
import { sunCups } from "./sunCups";
import { speakerTeach } from "./speakerTeach";
import { gasBlanket } from "./gasBlanket";
import { dropLens } from "./dropLens";
import { blockBloom } from "./blockBloom";
import { dokdo } from "./dokdo";
import { shelves } from "./shelves";
import { beeSwitch } from "./beeSwitch";
// 중1 Ⅲ~Ⅶ 도입 장면 묶음(2026-11-12): 단원마다 자기 묶음(./uN/index.ts)을 채운다. 이 파일은 고치지 않는다.
import { U3_OPENERS } from "./u3";
import { U4_OPENERS } from "./u4";
import { U5_OPENERS } from "./u5";
import { U6_OPENERS } from "./u6";
import { U7_OPENERS } from "./u7";
// 중2 과학 도입 장면 묶음(2026-11-12): 단원마다 자기 묶음(./g2uN/index.ts)을 채운다. 이 파일은 고치지 않는다.
import { G2U1_OPENERS } from "./g2u1";
import { G2U2_OPENERS } from "./g2u2";
import { G2U3_OPENERS } from "./g2u3";
import { G2U4_OPENERS } from "./g2u4";
import { G2U5_OPENERS } from "./g2u5";
import { G2U6_OPENERS } from "./g2u6";
import { G2U7_OPENERS } from "./g2u7";
import { G2U8_OPENERS } from "./g2u8";

type BuiltinScene = "longcell" | "baskets" | "factory" | "suncups" | "speaker" | "blanket" | "droplens" | "blockbloom" | "dokdo" | "shelves" | "beeswitch";

export interface OpenerStep {
  title: string;
  /** Ⅰ·Ⅱ단원의 장면 이름, 또는 단원 묶음에 등록한 "u3-…" 꼴의 이름 */
  scene: BuiltinScene | `u${number}-${string}` | `g2u${number}-${string}`;
  /** 조작을 마치기 전 아래 버튼의 글 */
  wait?: string;
  cta?: string;
}

type IntroArt = typeof import("../../../ui/introArt.generated");

export interface OpenerCtx {
  /** 스텝 요소(검사 도구가 읽는 data-opn-* 표식을 여기에 남긴다) */
  step: HTMLElement;
  stage: HTMLElement;
  /** 무대 바로 아래의 조작 줄(장면이 버튼을 넣는다. 비어 있으면 자리를 차지하지 않는다) */
  controls: HTMLElement;
  art: IntroArt["INTRO_ART"];
  meta: IntroArt["INTRO_META"];
  /** 쌤의 말(아래 칸의 말풍선) */
  say(html: string): void;
  face(kind: AvatarKind): void;
  /** 예측 보기. question이 보기 위에 뜨고, 고르면 말풍선이 good(또는 bad)으로 바뀐다. */
  ask(question: string, o: Omit<AskOpts, "onDone"> & { onDone?: (picked: string) => void }): void;
  /** 도입 끝: 아래 버튼을 연다. */
  finish(): void;
  later(fn: () => void, ms: number): number;
  cancel(id: number): void;
  alive(): boolean;
  onCleanup(fn: () => void): void;
}

export type OpenerScene = (c: OpenerCtx) => void;
const scenes: Record<BuiltinScene, OpenerScene> = { longcell: longCell, baskets, factory: factoryOff, suncups: sunCups, speaker: speakerTeach, blanket: gasBlanket, droplens: dropLens, blockbloom: blockBloom, dokdo, shelves, beeswitch: beeSwitch };

/** 단원 묶음: 장면 코드와 그 단원의 그림 표. 묶음의 장면은 c.art, c.meta로 자기 단원의 표를 받는다. */
export interface OpenerPack {
  /** 장면 이름("u3-…" 꼴) → 장면 코드 */
  scenes: Record<string, OpenerScene>;
  /** 그림 표(node qa/sketch/build-intro.mjs u3 이 만든 introArt.u3.generated.ts). 없으면 빈 표로 장면을 돌린다 */
  art?: () => Promise<{ INTRO_ART: Record<string, string>; INTRO_META: unknown }>;
}
const packs: OpenerPack[] = [U3_OPENERS, U4_OPENERS, U5_OPENERS, U6_OPENERS, U7_OPENERS,
  G2U1_OPENERS, G2U2_OPENERS, G2U3_OPENERS, G2U4_OPENERS, G2U5_OPENERS, G2U6_OPENERS, G2U7_OPENERS, G2U8_OPENERS];

export const opener: StepRenderer = (host, step, api) => {
  const s = step as unknown as OpenerStep;
  host.classList.add("opn-step");
  host.dataset.opnScene = s.scene;
  host.dataset.opnPhase = "load";

  const stage = el("div", { class: `opn-stage opn-${s.scene}` });
  const controls = el("div", { class: "opn-controls" });
  const choices = el("div", { class: "hook-choices" });
  const bubble = el("div", { class: "opn-bubble", attrs: { role: "status", "aria-live": "polite" } });
  const avatar = stickAvatar("smile");
  const say = el("div", { class: "opn-say" }, el("div", { class: "opn-avatar" }, avatar), bubble);
  const titleEl = el("div", { class: "opn-title", html: glue(s.title) });
  host.append(titleEl, stage, el("div", { class: "opn-slot" }, controls, choices, say));
  const waitLabel = s.wait ?? "먼저 직접 해 보세요";
  api.setCTA(waitLabel, { enabled: false });

  // 글 맞춤(2026-11-16, 도입과 랩 글 다듬기): 쌤의 말은 한 번에 세 줄 안쪽(390px 폰 기준)이 규칙이다
  // (처음 규칙은 두 줄, 같은 날 사용자 결정으로 세 줄 허용. 한 화면 554px는 그대로 지킨다).
  // 14px로 두 줄을 넘으면 13px로 줄인다(장면의 say와 hookAsk가 바꾸는 글 모두). 13px로도 세 줄을 넘으면 개발 모드에서 경고를 남긴다.
  const bubbleLines = (): number => {
    const cs = getComputedStyle(bubble);
    const lh = parseFloat(cs.lineHeight) || 20;
    return Math.round((bubble.scrollHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh);
  };
  const fitBubble = (): void => {
    bubble.classList.remove("sm");
    if (!bubble.isConnected || !bubble.textContent?.trim() || bubbleLines() <= 2) return;
    bubble.classList.add("sm");
    if (import.meta.env.DEV && bubbleLines() > 3) console.warn(`[opn-fit] 쌤의 말 ${bubbleLines()}줄: ${bubble.textContent.trim().slice(0, 70)}`);
  };
  const bubbleMo = new MutationObserver(fitBubble);
  bubbleMo.observe(bubble, { childList: true, characterData: true, subtree: true });
  // 제목은 질문 한 줄이 규칙이다(한 화면 예산이 제목 30px를 잡는다). 21px로 한 줄을 넘으면 19px, 18px로 줄이고,
  // 18px로도 넘치면 18px 두 줄(줄 높이 24px)로 둔다.
  const titleLines = (): number => Math.round(titleEl.scrollHeight / (parseFloat(getComputedStyle(titleEl).lineHeight) || 30));
  const fitTitle = (): void => {
    titleEl.classList.remove("fs19", "fs18");
    if (!titleEl.isConnected || titleLines() <= 1) return;
    titleEl.classList.add("fs19");
    if (titleLines() <= 1) return;
    titleEl.classList.replace("fs19", "fs18");
    if (import.meta.env.DEV && titleLines() > 1) console.warn(`[opn-fit] 도입 제목 두 줄: ${titleEl.textContent?.trim().slice(0, 70)}`);
  };
  let bubbleW = -1;
  let titleW = -1;
  const bubbleRo = new ResizeObserver(() => {
    if (titleEl.clientWidth !== titleW) {
      titleW = titleEl.clientWidth;
      fitTitle();
    }
    if (bubble.clientWidth === bubbleW) return;
    bubbleW = bubble.clientWidth;
    fitBubble();
  });
  bubbleRo.observe(bubble);
  bubbleRo.observe(titleEl);
  // 글꼴(Pretendard 조각)을 다 받으면 글 폭이 바뀌므로 한 번 더 맞춘다(먼저 대체 글꼴로 재면 실제보다 넓게 잰다).
  const onFonts = (): void => {
    fitTitle();
    fitBubble();
  };
  document.fonts?.addEventListener("loadingdone", onFonts);
  // 한 화면 맞춤: 스텝이 스크롤 영역(폰 390×700에서 554px)을 넘으면 간격을 줄이고(opn-tight),
  // 예측을 고르는 동안이면 안내 말풍선을 잠시 접는다(opn-tight2. 고르면 쌤의 말이 다시 보인다). 넓은 화면은 칸이 넉넉해 하지 않는다.
  const fitSpace = (): void => {
    host.classList.remove("opn-tight", "opn-tight2");
    const sc = host.closest(".scroll");
    if (!sc || document.documentElement.classList.contains("wide")) return;
    const over = (): boolean => sc.scrollHeight > sc.clientHeight;
    if (!over()) return;
    host.classList.add("opn-tight");
    if (!over() || !host.classList.contains("opn-asking")) return;
    host.classList.add("opn-tight2");
    if (import.meta.env.DEV && over()) console.warn(`[opn-fit] 도입 한 화면 넘침: ${titleEl.textContent?.trim().slice(0, 40)}`);
  };
  const spaceRo = new ResizeObserver(fitSpace);
  spaceRo.observe(host);

  let on = true;
  const ids = new Set<number>();
  const cleanups: Array<() => void> = [
    () => {
      bubbleMo.disconnect();
      bubbleRo.disconnect();
      spaceRo.disconnect();
      document.fonts?.removeEventListener("loadingdone", onFonts);
    },
  ];
  const later = (fn: () => void, ms: number): number => {
    const id = window.setTimeout(() => {
      ids.delete(id);
      if (on) fn();
    }, ms);
    ids.add(id);
    return id;
  };

  const pack = packs.find((p) => s.scene in p.scenes);
  const scene: OpenerScene | undefined = pack ? pack.scenes[s.scene] : (scenes as Record<string, OpenerScene | undefined>)[s.scene];
  const table: Promise<{ INTRO_ART: Record<string, string>; INTRO_META: unknown }> = pack
    ? pack.art
      ? pack.art()
      : Promise.resolve({ INTRO_ART: {}, INTRO_META: {} })
    : import("../../../ui/introArt.generated");

  void table.then((m) => {
    if (!on) return;
    const ctx: OpenerCtx = {
      step: host,
      stage,
      controls,
      art: m.INTRO_ART,
      meta: m.INTRO_META as IntroArt["INTRO_META"], // 묶음의 장면은 자기 단원의 표 타입으로 다시 읽는다(uN/index.ts 머리말)
      say: (html) => {
        bubble.innerHTML = glue(html); // 숫자와 단위, 짧은 괄호가 줄바꿈으로 갈리지 않게(steps/glue.ts)
      },
      face: (kind) => setStickAvatar(avatar, kind),
      ask: (question, o) => {
        bubble.innerHTML = glue(question); // ask()가 이 글을 보기 위(.hook-q)로 옮기고, 말풍선은 안내로 바꾼다(붙여 쓰기 덩이도 함께 옮겨 간다)
        api.setCTA("먼저 결과를 예측해 보세요", { enabled: false });
        host.classList.add("opn-asking");
        hookAsk(choices, bubble, {
          hint: "정답을 몰라도 괜찮아요. 느낌대로 하나를 골라 보세요. 예측은 채점하지 않아요!",
          ...o,
          // 고른 뒤 말풍선에 뜨는 말도 붙여 쓰기(hookAsk는 수학, 사회, 역사도 쓰므로 과학 도입인 여기서 글을 넘기기 전에 건다)
          good: glue(o.good),
          ...(o.bad !== undefined ? { bad: glue(o.bad) } : {}),
          onDone: () => {
            const mine = choices.querySelector(".hook-choice.sel, .hook-choice.miss");
            host.classList.remove("opn-asking");
            host.classList.add("opn-picked");
            api.setCTA(waitLabel, { enabled: false }); // 예측 뒤에 할 일이 남은 장면을 위해 안내를 되돌린다(끝나는 장면은 곧 finish가 연다)
            o.onDone?.(mine?.textContent?.trim() ?? "");
          },
        });
      },
      finish: () => {
        host.dataset.opnPhase = "done";
        api.enableCTA(s.cta ?? "실험실 열기");
        later(() => setStickAvatar(avatar, "smile"), 1200);
      },
      later,
      cancel: (id) => {
        window.clearTimeout(id);
        ids.delete(id);
      },
      alive: () => on,
      onCleanup: (fn) => cleanups.push(fn),
    };
    host.dataset.opnPhase = "ready";
    if (scene) scene(ctx);
    else {
      // 등록되지 않은 장면 이름: 레슨이 멈추지 않게 바로 끝 버튼을 연다(개발 중에 콘솔로 알린다)
      console.warn(`[opener] 등록되지 않은 장면: ${s.scene}`);
      ctx.finish();
    }
  });

  return () => {
    on = false;
    ids.forEach((id) => window.clearTimeout(id));
    ids.clear();
    cleanups.forEach((fn) => fn());
  };
};
