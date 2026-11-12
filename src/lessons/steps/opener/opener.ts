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
  host.append(el("div", { class: "opn-title", html: s.title }), stage, el("div", { class: "opn-slot" }, controls, choices, say));
  const waitLabel = s.wait ?? "먼저 직접 해 보세요";
  api.setCTA(waitLabel, { enabled: false });

  let on = true;
  const ids = new Set<number>();
  const cleanups: Array<() => void> = [];
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
        bubble.innerHTML = html;
      },
      face: (kind) => setStickAvatar(avatar, kind),
      ask: (question, o) => {
        bubble.innerHTML = question; // ask()가 이 글을 보기 위(.hook-q)로 옮기고, 말풍선은 안내로 바꾼다
        api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
        hookAsk(choices, bubble, {
          ...o,
          onDone: () => {
            const mine = choices.querySelector(".hook-choice.sel, .hook-choice.miss");
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
