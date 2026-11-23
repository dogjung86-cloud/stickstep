// [중2 Ⅵ v5] 순환 랩 세 판(g2u6l3).
//
// g2u6HeartLab 「판막이 없으면 혈액은 어디로 흐를까요?」
//   그림(심장의 구조: 두 심방, 두 심실, 판막). 학생이 정하는 것: 심방과 심실 가운데 무엇을 수축시킬지, 판막을 끼울지 뺄지.
//   판막을 빼고 심실을 수축시키면 혈액이 심방으로도 거꾸로 흐른다(실패가 보인다).
//   그림은 앞에서 본 모습이라 화면 왼쪽이 몸의 오른쪽(우심방, 우심실)이다.
//
// g2u6BloodLab 「혈액 속의 무엇이 이 일을 맡을까요?」
//   그림(혈액의 구성: 혈구를 가라앉힘, 혈구의 종류와 기능). 학생이 정하는 것: 가라앉히기, 상황마다 보낼 성분.
//   잘못 보내면 그 일이 해결되지 않는 것이 보인다.
//
// g2u6LoopLab 「혈액은 어떤 길로 온몸을 돌까요?」
//   활동. 학생이 정하는 것: 좌심실에서 나간 혈액이 다음에 갈 곳(모식도 위에서 직접 누른다).
//   길이 이어지지 않은 곳이나 거꾸로 가는 곳을 누르면 갈 수 없다고 알려 준다.

import type { StepRenderer } from "../../types";
import { bloodSvg, type BloodJob } from "./bloodArt";
import { heartSvg, type HeartScene } from "./heartArt";
import { P, bad, bvBtn, chip, g6Lab, g6Svg, good, noteLine, onStageTap, row, tap, toast, txt, type G6Step } from "./kit";

// ── 심장과 판막 ────────────────────────────────────────────────────
// 그림은 heartArt.ts(앞에서 본 심장의 단면. 혈관의 자리는 심장 그림, 순환 여행 랩과 같다).
// 수축한 결과(동맥으로, 또는 판막 없이 심방으로 거꾸로)는 3초 동안 남기고, 그사이 다른 단추를 누르면 곧바로 처음 모습으로 돌아간다.
// 판정 동안에는 판막을 뺀 채 거꾸로 흐른 장면을 멈춰 남기고, 결론에서는 판막이 막아 동맥으로만 나가는 장면을 남긴다(2026-11-15, 그래픽 감사 C082).
type Where = "atrium" | "ventricle" | "artery" | "back";
const HOLD_MS = 3000;
let heartSeq = 0;

export const g2u6HeartLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-heart", wait: "심방과 심실을 차례로 수축시켜 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "앞에서 본 심장의 단면. 그림의 왼쪽이 우심방과 우심실, 오른쪽이 좌심방과 좌심실이고, 대정맥은 우심방으로, 폐정맥은 좌심방으로 들어오며 폐동맥과 대동맥이 가운데에서 위로 나간다");
  const ns = `g6h${++heartSeq}`;
  let where: Where = "atrium";
  let valves = true;
  let seenCycle = false;
  let seenBack = false;
  let judging = false;
  let hold = 0;

  const scene = (): HeartScene => (where === "atrium" ? "rest" : where === "ventricle" ? "toVent" : where === "artery" ? "toArtery" : "back");
  const draw = (live = true): void => {
    stage.set(heartSvg({ scene: scene(), valves, live, ns }));
    host.dataset.g6Where = where;
    host.dataset.g6Valves = valves ? "1" : "0";
  };
  const go = bvBtn("main g2u6x-go", "판막이 하는 일 정리하기");
  go.disabled = true;
  const check = (): void => {
    f.pips((seenCycle ? 1 : 0) + (seenBack ? 1 : 0));
    go.disabled = !(seenCycle && seenBack);
    if (seenCycle && !seenBack) f.say(valves ? "이번에는 <b>판막을 빼고</b> 같은 차례로 수축시켜 봐요." : "판막을 뺐어요. 같은 차례로 <b>심방</b>부터 수축시켜 봐요.");
    else if (seenBack && !seenCycle) f.say(valves ? "판막을 끼웠어요. 같은 차례로 <b>심방</b>부터 수축시켜 봐요." : "이번에는 <b>판막을 끼우고</b> 같은 차례로 수축시켜 봐요.");
    else if (seenCycle && seenBack) f.say("판막이 있을 때와 없을 때를 모두 봤어요. <b>정리</b>해 봐요.");
  };
  /** 수축한 결과를 보이던 중이면 처음 모습(심방에 혈액)으로 되돌린다. */
  const endHold = (): void => {
    if (!hold) return;
    tm.cancel(hold);
    hold = 0;
    where = "atrium";
    draw();
    check();
  };

  // 심방 수축은 판막을 뺀 때에도 같은 글이 뜬다. 그래서 수정안의 "판막이 열리면서"는 뺐다(판막이 없을 때는 틀린 말).
  const cA = chip("atrium", "심방 수축하기", "위쪽 방(우심방·좌심방)", () => {
    if (judging) return;
    endHold();
    if (where !== "atrium") return;
    tap();
    where = "ventricle";
    draw();
    f.say("위쪽의 <b>심방</b>이 수축하자 혈액이 아래쪽 <b>심실</b>로 내려왔어요! 이어서 <b>심실 수축하기</b>를 눌러 보세요.");
  });
  const cV = chip("ventricle", "심실 수축하기", "아래쪽 방(우심실·좌심실)", () => {
    if (judging) return;
    endHold();
    if (where !== "ventricle") {
      bad();
      f.say("아직 심실에 혈액이 채워지지 않았어요. 먼저 <b>심방 수축하기</b>를 눌러 심방의 혈액을 심실로 보내 주세요.");
      return;
    }
    if (valves) {
      good();
      where = "artery";
      seenCycle = true;
      draw();
      // 다음에 할 일은 3초 뒤 check()가 상황에 맞게 알려 준다(판막을 뺀 경우를 먼저 봤으면 "판막 없이 해 보라"는 말이 틀린다)
      f.say("두꺼운 <b>심실</b>이 강하게 수축하자 심방과 심실 사이의 판막이 딱 닫히면서 혈액이 모두 <b>동맥</b>으로 밀려 나갔어요!");
    } else {
      bad();
      where = "back";
      seenBack = true;
      host.dataset.g6Fail = "back";
      draw();
      toast(lab, "혈액이 심방 쪽으로 거꾸로 역류했어요!", true, true);
      f.say("막아 주는 판막이 없자 심실이 수축할 때 혈액이 동맥으로만 가지 못하고 <b>심방으로 거꾸로</b> 밀려 올라갔어요!");
    }
    f.pips((seenCycle ? 1 : 0) + (seenBack ? 1 : 0));
    go.disabled = !(seenCycle && seenBack);
    hold = tm.later(() => {
      hold = 0;
      where = "atrium";
      draw();
      check();
    }, HOLD_MS);
  });
  const cValve = chip("valve", "판막 조건", "판막 있음", () => {
    if (judging) return;
    endHold();
    tap();
    valves = !valves;
    cValve.sub(valves ? "판막 있음" : "판막 없음(제거)");
    cValve.on(!valves);
    where = "atrium";
    draw();
    if (!seenCycle || !seenBack) f.say(valves ? "판막을 끼웠어요. 같은 차례로 <b>심방</b>부터 수축시켜 봐요." : "심장 속 판막을 <b>없앴어요</b>. 이 상태에서 <b>심방 수축하기 → 심실 수축하기</b>를 차례로 눌러 보세요.");
  });
  go.addEventListener("click", () => {
    if (judging || go.disabled) return;
    tap();
    if (hold) {
      tm.cancel(hold);
      hold = 0;
    }
    judging = true;
    lab.f.stage.querySelector(".g2u6x-toast")?.remove();
    // 판정의 근거(판막을 뺐을 때 거꾸로 흐른 모습)를 무대에 멈춰 남긴다
    valves = false;
    where = "back";
    draw(false);
    f.say("판막을 뺐을 때의 모습이에요. 혈액이 <b>심방 쪽으로</b> 거꾸로 올라갔어요.");
    lab.judge("판막이 없을 때 심실이 수축하자 혈액이 <b>심방으로 거꾸로</b> 흘렀어요. 이를 통해 알 수 있는 판막의 역할은 무엇인가요?", [{ t: "혈액이 거꾸로 흐르지(역류하지) 않게 막아 준다", ok: true }, { t: "스스로 수축하여 혈액을 더 세게 밀어낸다" }, { t: "혈액 속에 산소를 공급해 준다" }], "혈액을 밀어내는 것은 판막이 아니라 <b>심실의 근육</b>이에요.", () => {
      // 결론: 판막이 있어 동맥으로만 나가는 모습
      valves = true;
      where = "artery";
      draw(false);
      lab.finish("심장에서 혈액은 <b>정맥 → 심방 → 심실 → 동맥</b>의 한 방향으로만 흘러요. 심방과 심실 사이, 심실과 동맥 사이에 있는 <b>판막</b>이 혈액이 거꾸로 흐르는 것을 막아 주기 때문이에요.");
    });
  });
  f.slot.setControls(row(cA.el, cV.el), row(cValve.el), go);
  draw();
  f.say("심장의 위쪽 방은 <b>심방</b>, 두꺼운 근육으로 된 아래쪽 방은 <b>심실</b>이에요. 먼저 <b>심방 수축하기</b> 버튼을 눌러 혈액이 어디로 이동하는지 살펴보세요.");
  return lab.cleanup;
};

// ── 혈액의 구성 ────────────────────────────────────────────────────
const PARTS = [
  { key: "rbc", name: "적혈구" },
  { key: "wbc", name: "백혈구" },
  { key: "plt", name: "혈소판" },
  { key: "pla", name: "혈장" },
];
let bloodSeq = 0;
const JOBS: { ask: string; ans: string; short: string; done: string; scene: BloodJob }[] = [
  { ask: "(1/4) 허파에서 받은 <b>산소를 온몸의 조직세포로 운반하는</b> 성분은 무엇일까요?", ans: "rbc", short: "산소 운반", done: "맞아요! 붉은색 색소(헤모글로빈)가 있는 <b>적혈구</b>가 산소를 운반해요.", scene: "o2" },
  { ask: "(2/4) 몸속에 침입한 <b>세균을 잡아먹어 우리 몸을 지키는</b> 성분은 무엇일까요?", ans: "wbc", short: "식균 작용", done: "맞아요! 핵이 있는 큰 세포인 <b>백혈구</b>가 세균을 감싸서 없애 줘요.", scene: "germ" },
  { ask: "(3/4) 상처가 났을 때 <b>혈액을 굳게 하여 출혈을 멈추게 하는</b> 성분은 무엇일까요?", ans: "plt", short: "혈액 응고", done: "맞아요! 작은 조각 모양인 <b>혈소판</b>이 혈액을 응고시켜 피를 멈추게 해요.", scene: "cut" },
  { ask: "(4/4) <b>영양소와 노폐물</b>을 녹여서 운반하는 노란색 액체 성분은 무엇일까요?", ans: "pla", short: "영양소·노폐물 운반", done: "맞아요! 액체 성분인 <b>혈장</b>이 영양소와 노폐물을 녹여 운반해요.", scene: "nut" },
];
const MISS: Record<string, string> = {
  rbc: "적혈구는 붉은색 헤모글로빈이 있어 <b>산소</b>를 운반하는 혈구예요.",
  wbc: "백혈구는 몸속에 들어온 <b>세균</b>을 잡아먹는 혈구예요.",
  plt: "혈소판은 상처가 났을 때 <b>혈액을 응고시키는</b> 작은 조각이에요.",
  pla: "혈장은 영양소와 노폐물을 녹여서 운반하는 <b>노란색 액체</b>예요.",
};

export const g2u6BloodLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  const lab = g6Lab(host, api, s, { steps: 5, cls: "g2u6x-blood", wait: "혈액을 분리하고 네 성분의 역할을 확인해 보세요" });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "혈액이 든 시험관과, 혈액이 맡을 일의 장면");
  const ns = `g6b${++bloodSeq}`;
  let settled = false;
  let job = -1;
  let state: "ask" | "miss" | "done" = "ask";
  let finalView = false;
  let busy = false;

  // 그림은 bloodArt.ts. 일을 맡기는 동안 오른쪽 칸은 그 일의 장면이고, 마지막 판정에서는 혈구를 확대한 모습으로 돌아간다.
  const draw = (): void => {
    stage.set(bloodSvg({ settled, job: job >= 0 && !finalView ? JOBS[job].scene : null, state, ns }));
    host.dataset.g6Job = String(job);
    host.dataset.g6Settled = settled ? "1" : "0";
  };

  const chips = PARTS.map((p) =>
    chip(p.key, p.name, "", () => {
      if (busy || job < 0 || state === "done") return;
      const j = JOBS[job];
      if (p.key !== j.ans) {
        bad();
        lab.slip();
        host.dataset.g6Fail = p.key;
        chips.forEach((c) => c.el.classList.remove("miss"));
        chips[PARTS.indexOf(p)].el.classList.add("miss");
        // 알림 대신 장면이 그대로(또는 더 나빠진 채) 남고, 장면 왼쪽 위 글이 빨강으로 바뀐다
        state = "miss";
        draw();
        f.say(`${MISS[p.key]} 다른 성분을 골라요.`);
        return;
      }
      good();
      state = "done";
      busy = true;
      chips.forEach((c) => c.el.classList.remove("miss"));
      chips[PARTS.indexOf(p)].done();
      draw();
      f.say(j.done);
      f.pips(job + 2);
      tm.later(() => {
        busy = false;
        if (job < JOBS.length - 1) nextJob();
        else {
          // 판정의 근거(확대한 혈구)를 다시 보인다
          finalView = true;
          draw();
          lab.judge("현미경으로 확대한 혈구 가운데 그 수가 <b>가장 많은</b> 것은 무엇인가요?", [{ t: "적혈구", ok: true }, { t: "백혈구" }, { t: "혈소판" }], "현미경 시야를 보면 붉은 원반 모양의 <b>적혈구</b>가 가장 많이 분포해 있어요. 혈액이 붉게 보이는 것도 적혈구 때문이에요.", () =>
            lab.finish("혈액은 액체 성분인 <b>혈장</b>(영양소·노폐물 운반)과 혈구 성분인 <b>적혈구</b>(산소 운반), <b>백혈구</b>(식균 작용), <b>혈소판</b>(혈액 응고)으로 이루어져 있어요."),
          );
        }
      }, 1700);
    }),
  );
  const jobNote = noteLine("이제 일이 네 가지 생겨요. 일마다 <b>맡을 성분</b>을 하나씩 골라요.");
  const nextJob = (): void => {
    job += 1;
    state = "ask";
    // 몇 번째 일인지는 도움말 앞의 "(1/4)"가 알려 준다
    jobNote.innerHTML = `찾아야 할 역할: <b>${JOBS[job].short}</b> (아래에서 알맞은 혈액 성분을 골라 보세요)`;
    draw();
    f.say(JOBS[job].ask);
  };
  const spin = bvBtn("main g2u6x-spin", "혈액 가라앉히기(분리하기)");
  spin.addEventListener("click", () => {
    if (settled) return;
    good();
    settled = true;
    f.pips(1);
    draw();
    f.say("위는 노란 액체 <b>혈장</b>, 아래는 <b>혈구</b>예요. 붉은 원반이 적혈구, 핵이 있는 큰 것이 백혈구, 작은 조각이 혈소판이에요.");
    f.slot.setControls(jobNote, row(chips[0].el, chips[1].el), row(chips[2].el, chips[3].el));
    tm.later(nextJob, 3200);
  });
  f.slot.setControls(spin);
  draw();
  f.say("시험관에 붉은 혈액이 담겨 있어요. 먼저 아래 버튼을 눌러 <b>혈액을 가라앉히면</b> 어떤 성분으로 나뉘는지 살펴보세요.");
  return lab.cleanup;
};

// ── 혈액의 순환 경로 ────────────────────────────────────────────────
interface Node {
  key: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
const NODES: Node[] = [
  { key: "lv", name: "좌심실", x: 176, y: 118, w: 62, h: 42 },
  { key: "ao", name: "대동맥", x: 258, y: 150, w: 78, h: 42 },
  { key: "body", name: "온몸의 모세혈관", x: 104, y: 188, w: 138, h: 38 },
  { key: "vc", name: "대정맥", x: 10, y: 150, w: 78, h: 42 },
  { key: "ra", name: "우심방", x: 108, y: 70, w: 62, h: 42 },
  { key: "rv", name: "우심실", x: 108, y: 118, w: 62, h: 42 },
  { key: "pa", name: "폐동맥", x: 10, y: 38, w: 78, h: 42 },
  { key: "lung", name: "허파의 모세혈관", x: 104, y: 4, w: 138, h: 38 },
  { key: "pv", name: "폐정맥", x: 258, y: 38, w: 78, h: 42 },
  { key: "la", name: "좌심방", x: 176, y: 70, w: 62, h: 42 },
];
const ROUTE = ["lv", "ao", "body", "vc", "ra", "rv", "pa", "lung", "pv", "la", "lv"];
/** 그 자리에 닿았을 때의 혈액: 허파를 지난 뒤부터 온몸에 닿기 전까지가 산소가 많은 혈액이다. */
const RICH = new Set(["lung", "pv", "la", "lv", "ao"]);
const node = (k: string): Node => NODES.find((n) => n.key === k) as Node;
/** 이어진 두 곳 사이의 길(꺾은 선). 다른 방이나 혈관의 상자를 가로지르지 않게 손으로 놓은 점이다. 대정맥과 폐동맥의 길만 심장 왼쪽에서 한 번 엇갈린다. */
const PATHS: Record<string, [number, number][]> = {
  "lv>ao": [[238, 143], [258, 160]],
  "ao>body": [[290, 192], [290, 207], [242, 207]],
  "body>vc": [[104, 207], [56, 207], [56, 192]],
  "vc>ra": [[56, 150], [96, 102], [108, 96]],
  "ra>rv": [[139, 112], [139, 118]],
  "rv>pa": [[108, 134], [96, 128], [56, 80]],
  "pa>lung": [[56, 38], [56, 23], [104, 23]],
  "lung>pv": [[242, 23], [290, 23], [290, 38]],
  "pv>la": [[258, 70], [238, 86]],
  "la>lv": [[207, 112], [207, 118]],
};

export const g2u6LoopLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as G6Step;
  // 수정안의 "화살표를 따라"는 뺐다(이 모식도의 길에는 화살표가 없다)
  const lab = g6Lab(host, api, s, { steps: 3, cls: "g2u6x-loop", wait: "혈액이 이동할 곳을 차례로 눌러 보세요", tall: true });
  const { f, tm } = lab;
  const stage = g6Svg(lab, "심장과 허파, 온몸을 잇는 혈액 순환 모식도");
  let at = 0; // ROUTE의 몇 번째에 있는가
  let miss = "";
  let ended = false;

  const mid = (n: Node): [number, number] => [n.x + n.w / 2, n.y + n.h / 2];
  const draw = (): void => {
    let out = "";
    // 길(이어진 순서대로). 지나온 길은 혈액의 색으로 칠한다.
    for (let i = 0; i < ROUTE.length - 1; i++) {
      const pts = PATHS[`${ROUTE[i]}>${ROUTE[i + 1]}`];
      const passed = i < at;
      const col = passed ? (RICH.has(ROUTE[i]) ? P.red : P.dark) : "#33496E";
      out += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="${passed ? 7 : 4}" stroke-linecap="round" stroke-linejoin="round" opacity="${passed ? 0.95 : 0.7}"/>`;
    }
    NODES.forEach((n) => {
      const idx = ROUTE.indexOf(n.key);
      const here = ROUTE[at] === n.key;
      const visited = idx < at || ended;
      const rich = RICH.has(n.key);
      const fill = here || visited ? (rich ? "#5A2630" : "#3F2A4A") : "#17253D";
      const stroke = miss === n.key ? P.bad : here ? "#fff" : visited ? (rich ? P.red : P.dark) : "#55698A";
      out += `<g data-k="n${n.key}"${miss === n.key ? ` class="g2u6x-shake"` : ""}><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="11" fill="${fill}" stroke="${stroke}" stroke-width="${here ? 2.6 : 1.6}"/>${txt(n.x + n.w / 2, n.y + n.h / 2 + 4.5, n.name, { size: 12.5, fill: here || visited ? "#fff" : P.text })}</g>`;
    });
    const [bx, by] = mid(node(ROUTE[at]));
    const cur = ROUTE[at];
    out += `<circle class="g2u6x-pop" cx="${bx + node(cur).w / 2 - 9}" cy="${by - node(cur).h / 2 + 9}" r="7" fill="${RICH.has(cur) ? P.red : P.dark}" stroke="#fff" stroke-width="2"/>`;
    stage.set(out);
    host.dataset.g6At = String(at);
    host.dataset.g6Next = ended ? "" : ROUTE[at + 1];
  };
  // 색 이름은 범례와 순환 여행 랩의 말(선홍색, 어두워졌어요)에 맞춘다(수정안의 '암적색'은 이 단원에서 쓰지 않는 이름이라 바꿨다).
  // 다음에 누를 곳은 학생이 찾는다. 그래서 우심방과 좌심방에서 다음 곳을 알려 주던 수정안의 뒷문장은 뺐다.
  const SAY: Record<string, string> = {
    ao: "<b>좌심실</b>에서 나온 선홍색 혈액이 <b>대동맥</b>을 따라 온몸으로 뻗어 나가요. 다음은 어디로 갈까요?",
    body: "<b>온몸의 모세혈관</b>에서 조직세포에 산소를 넘겨주자 혈액이 <b>어두워졌어요</b>!",
    vc: "산소가 줄어든 혈액이 <b>대정맥</b>을 따라 다시 심장으로 돌아와요.",
    ra: "<b>우심방</b>으로 돌아와 <b>온몸순환</b>을 마쳤어요!",
    rv: "<b>우심실</b>에 혈액이 모였어요. 이제 산소를 공급받기 위해 허파로 이어진 혈관으로 나가 볼까요?",
    pa: "심실에서 나가는 혈관인 <b>폐동맥</b>을 지나요. 동맥이지만 아직 산소를 받기 전이라 <b>어두운 혈액</b>이 흐른다는 점에 주목해 보세요!",
    lung: "<b>허파의 모세혈관</b>에서 산소를 공급받자 혈액이 다시 밝은 <b>선홍색</b>으로 변했어요!",
    pv: "산소를 가득 실은 선홍색 혈액이 <b>폐정맥</b>을 따라 심장으로 돌아와요.",
    la: "<b>좌심방</b>으로 돌아와 <b>허파순환</b>도 마쳤어요!",
  };
  onStageTap(stage, (key) => {
    if (ended || !key.startsWith("n")) return;
    const k = key.slice(1);
    if (k === ROUTE[at]) return;
    if (k !== ROUTE[at + 1]) {
      bad();
      lab.slip();
      miss = k;
      host.dataset.g6Fail = k;
      draw();
      const back = at > 0 && k === ROUTE[at - 1];
      f.say(back ? "혈액은 <b>거꾸로</b> 흐르지 않아요. 판막이 막고 있어요. 앞으로 갈 곳을 찾아요." : `${node(ROUTE[at]).name}에서 ${node(k).name}${k === "lv" || k === "rv" ? "로는" : "으로는"} 바로 갈 수 없어요. <b>이어진 곳</b>을 찾아요.`);
      tm.later(() => {
        miss = "";
        draw();
      }, 700);
      return;
    }
    good();
    at += 1;
    miss = "";
    f.pips(at >= 10 ? 2 : at >= 4 ? 1 : 0);
    if (at === ROUTE.length - 1) {
      ended = true;
      draw();
      f.say("혈액이 <b>온몸순환</b>과 <b>허파순환</b>을 차례로 거쳐 다시 출발점인 좌심실로 돌아왔어요!");
      tm.later(() => {
        // 수정안의 "(동맥혈)"은 뺐다: 이 단원에서 쓰지 않는 말이고, 오답 "폐동맥과 대동맥"으로 끄는 힌트가 된다
        lab.judge("순환 경로 중 산소가 풍부한 <b>선홍색 혈액</b>이 흐른 혈관 두 개는 무엇인가요?", [{ t: "폐정맥과 대동맥", ok: true }, { t: "폐동맥과 대정맥" }, { t: "폐동맥과 대동맥" }], "허파에서 산소를 공급받은 뒤 심장으로 들어가는 <b>폐정맥</b>과, 좌심실에서 온몸으로 나가는 <b>대동맥</b>에 선홍색 혈액이 흘러요.", () =>
          lab.finish("혈액은 <b>좌심실 → 대동맥 → 온몸의 모세혈관 → 대정맥 → 우심방</b>으로 흐르는 <b>온몸순환</b>과, <b>우심실 → 폐동맥 → 허파의 모세혈관 → 폐정맥 → 좌심방</b>으로 흐르는 <b>허파순환</b>을 번갈아 이어 가며 끊임없이 온몸을 순환해요."),
        );
      }, 1600);
      return;
    }
    draw();
    f.say(SAY[k]);
  });
  f.slot.setControls(noteLine(`<i style="background:${P.red}"></i>산소가 <b>많은</b> 혈액 &nbsp; <i style="background:${P.dark}"></i>산소가 <b>적은</b> 혈액<br>흰 테두리가 지금 혈액이 있는 곳이에요. 그림에서 <b>다음에 갈 곳</b>을 눌러요.`));
  draw();
  f.say("혈액이 <b>좌심실</b>에 있어요. 좌심실이 수축하면 어디로 나갈까요? 그림에서 눌러요.");
  return lab.cleanup;
};
