// [중2 Ⅲ v5] g2u3l3 물체를 보는 과정: g2u3PathLab 「책이 보이려면 빛은 어디로 가야 할까요?」
// 책의 어디에서: 해 보기 '물체를 보는 과정 표현하기'(전등이 켜진 방에서 책을 볼 때와 어항 속 물고기를 볼 때 빛의 경로를 화살표로 그린다)와 그림 Ⅲ-5.
// 학생이 정하는 것: 화살표의 시작과 끝. 전등, 물체, 눈 가운데 둘을 차례로 눌러 아무 쪽으로나 그릴 수 있다. 다 그리면 '빛 보내기'로 확인한다.
// 실패하는 길: 눈에서 나가는 화살표, 물체에서 전등으로 가는 화살표에는 빛이 흐르지 않는다(빨간 점선과 까닭 한 줄).
//             전등에서 물체로 가는 화살표가 없으면 물체가 눈으로 보낼 빛이 없다.
// 한 통찰: 광원에서 나온 빛이 물체에서 반사한 뒤 눈에 들어와야 물체가 보인다. 물속의 물체는 그 빛이 수면에서 굴절해 들어온다.
// 흐름: 방(전등, 책, 눈) → 어항(전등, 물고기, 눈. 빛을 보내면 수면에서 꺾인 길이 그려진다) → 판정 → 결론.
// 옛 랩(seeLab)은 정해진 경로 조각을 차례로 눌러 잇고 작살을 던졌다. 틀린 방향의 화살표를 그려 볼 수 없었다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { BEAM_WHITE, drawArrowHead, drawBeam, eyeProp, type Pt } from "../../../ui/lightKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { LX, lxCanvas, lxFrame, lxPill, lxText } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}
type Node = "lamp" | "obj" | "eye";
type ArrowState = "draw" | "ok" | "bad" | "dry";
interface Arrow {
  a: Node;
  b: Node;
  st: ArrowState;
}
interface Scene {
  key: "room" | "tank";
  obj: string;
  pos: Record<Node, Pt>;
}
const SCENES: Scene[] = [
  { key: "room", obj: "책", pos: { lamp: { x: 66, y: 52 }, obj: { x: 150, y: 176 }, eye: { x: 292, y: 96 } } },
  { key: "tank", obj: "물고기", pos: { lamp: { x: 60, y: 46 }, obj: { x: 150, y: 172 }, eye: { x: 298, y: 62 } } },
];
const WATER_Y = 112;
const TANK = { x0: 78, x1: 246, y1: 210 };
const N_WATER = 1.33;

/** 공기 쪽 점 a와 물속 점 w를 잇는 빛이 수면에서 꺾이는 자리(x). */
function bendX(a: Pt, w: Pt): number {
  let lo = Math.min(a.x, w.x);
  let hi = Math.max(a.x, w.x);
  const dir = w.x > a.x ? 1 : -1;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    const ta = Math.atan(Math.abs(m - a.x) / (WATER_Y - a.y));
    const tw = Math.atan(Math.abs(w.x - m) / (w.y - WATER_Y));
    // 수면의 점이 물속 점 쪽으로 갈수록 공기 쪽 각이 커지고 물 쪽 각이 작아진다
    const more = Math.sin(ta) - N_WATER * Math.sin(tw) > 0;
    if ((dir === 1) === more) hi = m;
    else lo = m;
  }
  return (lo + hi) / 2;
}

export const pathLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "path";
  host.dataset.lx = "room";

  let sc = 0;
  let arrows: Arrow[] = [];
  let sel: Node | null = null;
  let sent = false; // 빛을 보낸 뒤(결과가 그려져 있다)
  let seen = false; // 물체가 눈에 보인다
  let lock = false;
  const scene = (): Scene => SCENES[sc];
  const name = (n: Node): string => (n === "lamp" ? "전등" : n === "eye" ? "눈" : scene().obj);

  // 무대 위의 누르는 자리(전등, 물체, 눈)
  const nodeBtns = {} as Record<Node, HTMLButtonElement>;
  (["lamp", "obj", "eye"] as Node[]).forEach((n) => {
    const b = el("button", { class: "g2u3x-node", attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = n;
    b.addEventListener("click", () => tapNode(n));
    nodeBtns[n] = b;
    f.stage.appendChild(b);
  });

  const list = el("div", { class: "g2u3x-arrows" });
  const clearBtn = bvBtn("", "화살표 지우기");
  clearBtn.dataset.k = "clear";
  const sendBtn = bvBtn("main", "빛 보내기");
  sendBtn.dataset.k = "send";
  f.slot.setControls(el("div", { class: "g2u3x-cap", text: "그린 화살표" }), list, el("div", { class: "g2u3x-row2" }, clearBtn, sendBtn));

  const paintList = (): void => {
    list.replaceChildren(
      ...(arrows.length
        ? arrows.map((a) => el("span", { class: `g2u3x-chip ${a.st}`, text: `${name(a.a)} → ${name(a.b)}` }))
        : [el("span", { class: "g2u3x-chip none", text: "아직 없어요" })]),
    );
    sendBtn.disabled = arrows.length === 0 || lock;
    clearBtn.disabled = arrows.length === 0 || lock;
  };
  const reset = (): void => {
    arrows.forEach((a) => (a.st = "draw"));
    sent = false;
    seen = false;
  };

  function tapNode(n: Node): void {
    if (lock) return;
    haptic(HAPTIC.tap);
    if (sent) reset();
    if (!sel) {
      sel = n;
      f.say(`<b>${name(n)}</b>에서 시작해요. 화살표가 닿을 곳을 눌러 보세요.`);
      paintList();
      return;
    }
    if (sel === n) {
      sel = null;
      f.say("시작할 곳을 다시 골라 보세요.");
      return;
    }
    // 같은 두 곳 사이의 화살표는 새로 그린 것으로 바꾼다
    arrows = arrows.filter((a) => !((a.a === sel && a.b === n) || (a.a === n && a.b === sel)));
    arrows.push({ a: sel, b: n, st: "draw" });
    sel = null;
    paintList();
    f.say(`화살표를 그렸어요. 더 그리거나 <b>빛 보내기</b>로 ${scene().obj}${sc === 0 ? "이" : "가"} 보이는지 확인해요.`);
  }
  clearBtn.addEventListener("click", () => {
    if (lock) return;
    arrows = [];
    sel = null;
    reset();
    paintList();
    f.say("화살표를 지웠어요. <b>시작할 곳</b>부터 다시 눌러 보세요.");
  });

  sendBtn.addEventListener("click", () => {
    if (lock || !arrows.length) return;
    sel = null;
    sent = true;
    const has = (a: Node, b: Node): boolean => arrows.some((x) => x.a === a && x.b === b);
    const lit = has("lamp", "obj");
    arrows.forEach((x) => {
      if (x.a === "eye" || (x.a === "obj" && x.b === "lamp")) x.st = "bad";
      else if (x.a === "obj" && x.b === "eye") x.st = lit ? "ok" : "dry";
      else x.st = "ok";
    });
    seen = lit && has("obj", "eye");
    paintList();
    const o = scene().obj;
    const eul = sc === 0 ? "은" : "는";
    if (seen) {
      haptic(HAPTIC.correct);
      lock = true;
      paintList();
      const extra = arrows.some((x) => x.st === "bad") ? " 빨간 화살표에는 빛이 흐르지 않았어요." : "";
      if (sc === 0) {
        f.pips(1);
        f.say(`전등의 빛이 책에서 <b>반사</b>해 눈에 들어왔어요. 책이 보여요!${extra}`);
        tm.later(nextScene, 2600);
      } else {
        f.pips(2);
        host.dataset.lx = "bent";
        f.say(`물고기가 보여요! 빛이 <b>수면</b>을 지날 때의 길을 잘 보세요.${extra}`);
        tm.later(askFinal, 2800);
      }
      return;
    }
    haptic(HAPTIC.wrong);
    if (arrows.some((x) => x.a === "eye")) f.say("<b>눈</b>은 빛을 내지 못해요. 눈에서 나가는 화살표에는 빛이 흐르지 않아요. 빛이 나오는 곳에서 시작해요.");
    else if (arrows.some((x) => x.a === "obj" && x.b === "lamp")) f.say(`${o}${eul} 스스로 빛을 내지 못해요. 빛은 <b>전등</b>에서 나와요.`);
    else if (!lit && has("obj", "eye")) f.say(`${o}${eul} 스스로 빛을 내지 못해요. 눈으로 보낼 빛이 먼저 <b>${o}에 닿아야</b> 해요.`);
    else if (lit) f.say(`빛이 ${o}에 닿았어요. 하지만 그 빛이 <b>눈</b>까지 와야 ${o}${sc === 0 ? "이" : "가"} 보여요.`);
    else f.say(`전등의 빛이 눈에 바로 들어와 <b>전등</b>이 보여요. ${o}${eul} 아직 보이지 않아요.`);
  });

  function nextScene(): void {
    sc = 1;
    arrows = [];
    sel = null;
    sent = false;
    seen = false;
    lock = false;
    host.dataset.lx = "tank";
    paintList();
    f.say("이번에는 <b>어항 속 물고기</b>예요. 물고기가 보이게 빛의 길을 화살표로 그려 보세요.");
    api.setCTA("물고기가 보이게 그려 보세요", { enabled: false });
  }
  function askFinal(): void {
    host.dataset.lx = "ask";
    f.slot.ask(
      "물고기에서 반사한 빛은 물과 공기의 경계면을 어떻게 지나 눈에 왔나요?",
      [{ t: "경계면에서 꺾여서 왔어요", ok: true }, { t: "꺾이지 않고 곧게 왔어요" }, { t: "경계면에서 모두 되돌아갔어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "무대의 빛은 수면에서 방향이 바뀌었어요. 물속 물체를 볼 때는 빛이 <b>굴절</b>해 들어와요.", onNext: finish },
    );
  }
  function finish(): void {
    host.dataset.lx = "done";
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("전등에서 나온 빛이 물체에서 <b>반사</b>한 뒤 <b>눈에 들어와야</b> 물체가 보여요. 물속의 물체는 그 빛이 수면에서 굴절해 들어와요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // ── 그리기 ──
  const lampProp = (ctx: CanvasRenderingContext2D, p: Pt, t: number): void => {
    ctx.save();
    const glow = ctx.createRadialGradient(p.x, p.y + 6, 2, p.x, p.y + 6, 40);
    glow.addColorStop(0, `rgba(255,236,170,${0.55 + 0.1 * Math.sin(t / 400)})`);
    glow.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 6, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#93A3C0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, 0);
    ctx.lineTo(p.x, p.y - 12);
    ctx.stroke();
    const g = ctx.createLinearGradient(p.x - 18, 0, p.x + 18, 0);
    g.addColorStop(0, "#6E7FA3");
    g.addColorStop(1, "#B5C3DD");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y - 14);
    ctx.lineTo(p.x + 8, p.y - 14);
    ctx.lineTo(p.x + 19, p.y + 2);
    ctx.lineTo(p.x - 19, p.y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFE9A6";
    ctx.beginPath();
    ctx.arc(p.x, p.y + 5, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const bookProp = (ctx: CanvasRenderingContext2D, p: Pt, lit: boolean): void => {
    ctx.save();
    // 책상
    ctx.fillStyle = "#5B4A3C";
    ctx.fillRect(p.x - 62, p.y + 12, 124, 7);
    ctx.fillRect(p.x - 52, p.y + 19, 6, 22);
    ctx.fillRect(p.x + 46, p.y + 19, 6, 22);
    ctx.globalAlpha = lit ? 1 : 0.55;
    ctx.fillStyle = "#F5F0E4";
    ctx.beginPath();
    ctx.moveTo(p.x - 26, p.y + 10);
    ctx.lineTo(p.x - 20, p.y - 8);
    ctx.lineTo(p.x, p.y - 4);
    ctx.lineTo(p.x + 20, p.y - 8);
    ctx.lineTo(p.x + 26, p.y + 10);
    ctx.lineTo(p.x, p.y + 13);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#C9413A";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 4);
    ctx.lineTo(p.x, p.y + 13);
    ctx.stroke();
    ctx.restore();
  };
  const fishProp = (ctx: CanvasRenderingContext2D, p: Pt, lit: boolean, t: number): void => {
    ctx.save();
    ctx.globalAlpha = lit ? 1 : 0.6;
    const wag = Math.sin(t / 300) * 3;
    const g = ctx.createLinearGradient(p.x - 20, p.y - 10, p.x + 20, p.y + 10);
    g.addColorStop(0, "#FFB25E");
    g.addColorStop(1, "#E8663A");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 19, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x - 17, p.y);
    ctx.lineTo(p.x - 31, p.y - 9 + wag);
    ctx.lineTo(p.x - 31, p.y + 9 + wag);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1B2B45";
    ctx.beginPath();
    ctx.arc(p.x + 10, p.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const lightPath = (a: Node, b: Node): Pt[] => {
    const P = scene().pos;
    const p0 = P[a];
    const p1 = P[b];
    if (scene().key !== "tank" || (a !== "obj" && b !== "obj")) return [p0, p1];
    const air = a === "obj" ? p1 : p0;
    const bx = bendX(air, P.obj);
    return [p0, { x: bx, y: WATER_Y }, p1];
  };
  const trim = (pts: Pt[], r0: number, r1: number): Pt[] => {
    const out = pts.map((p) => ({ ...p }));
    const cut = (i: number, j: number, r: number): void => {
      const dx = out[j].x - out[i].x;
      const dy = out[j].y - out[i].y;
      const L = Math.hypot(dx, dy) || 1;
      out[i] = { x: out[i].x + (dx / L) * r, y: out[i].y + (dy / L) * r };
    };
    cut(0, 1, r0);
    cut(out.length - 1, out.length - 2, r1);
    return out;
  };

  let sig = "";
  st.run((ctx, t) => {
    const scn = scene();
    const P = scn.pos;
    // 누르는 자리를 그림에 맞춘다
    const now = `${st.cv.clientWidth}x${st.cv.clientHeight}:${sc}`;
    if (now !== sig) {
      sig = now;
      (["lamp", "obj", "eye"] as Node[]).forEach((n) => st.place(nodeBtns[n], P[n].x - 32, P[n].y - 30, 64, 60));
    }
    if (scn.key === "tank") {
      const wg = ctx.createLinearGradient(0, WATER_Y, 0, TANK.y1);
      wg.addColorStop(0, "rgba(90,160,235,.38)");
      wg.addColorStop(1, "rgba(50,110,200,.38)");
      ctx.fillStyle = wg;
      ctx.fillRect(TANK.x0, WATER_Y, TANK.x1 - TANK.x0, TANK.y1 - WATER_Y);
      ctx.strokeStyle = "rgba(190,225,255,.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(TANK.x0, WATER_Y);
      ctx.lineTo(TANK.x1, WATER_Y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(214,230,250,.75)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(TANK.x0, WATER_Y - 22);
      ctx.lineTo(TANK.x0, TANK.y1);
      ctx.lineTo(TANK.x1, TANK.y1);
      ctx.lineTo(TANK.x1, WATER_Y - 22);
      ctx.stroke();
      lxText(ctx, "물", TANK.x0 + 16, TANK.y1 - 14, { color: LX.dim });
      lxText(ctx, "공기", TANK.x1 + 22, WATER_Y - 12, { color: LX.dim });
    }
    const lit = sent && arrows.some((x) => x.a === "lamp" && x.b === "obj");
    lampProp(ctx, P.lamp, t);
    if (scn.key === "room") bookProp(ctx, P.obj, lit);
    else fishProp(ctx, P.obj, lit, t);
    eyeProp(ctx, P.eye.x, P.eye.y, Math.atan2(P.obj.y - P.eye.y, P.obj.x - P.eye.x), 15);
    lxText(ctx, "전등", P.lamp.x + 34, P.lamp.y - 18, { color: LX.dim });
    lxText(ctx, scn.obj, P.obj.x, P.obj.y + (scn.key === "room" ? 30 : 24), { color: LX.dim });
    lxText(ctx, "눈", P.eye.x + 2, P.eye.y + 26, { color: LX.dim });
    // 아직 아무것도 그리지 않았으면 누를 수 있는 세 곳을 알려 준다
    if (!sel && !arrows.length && !lock) {
      ctx.strokeStyle = `rgba(232,238,249,${0.25 + 0.25 * Math.sin(t / 300)})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      (Object.keys(P) as Node[]).forEach((n) => {
        ctx.beginPath();
        ctx.arc(P[n].x, P[n].y, 27, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }
    // 고른 시작점
    if (sel) {
      ctx.strokeStyle = `rgba(255,196,90,${0.6 + 0.3 * Math.sin(t / 200)})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(P[sel].x, P[sel].y, 27, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // 화살표
    const flow = (t / 900) % 1;
    arrows.forEach((x) => {
      if (x.st === "ok") {
        drawBeam(ctx, trim(lightPath(x.a, x.b), 20, 22), { rgb: BEAM_WHITE, flow, arrow: true });
        return;
      }
      const pts = trim([P[x.a], P[x.b]], 22, 24);
      const col = x.st === "bad" ? LX.red : x.st === "dry" ? "rgba(232,238,249,.35)" : "rgba(232,238,249,.9)";
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      if (x.st !== "draw") ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
      ctx.restore();
      drawArrowHead(ctx, pts[1].x, pts[1].y, Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x), 13, col);
      if (x.st === "bad") {
        const mx = (pts[0].x + pts[1].x) / 2;
        const my = (pts[0].y + pts[1].y) / 2;
        ctx.strokeStyle = LX.red;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mx - 6, my - 6);
        ctx.lineTo(mx + 6, my + 6);
        ctx.moveTo(mx + 6, my - 6);
        ctx.lineTo(mx - 6, my + 6);
        ctx.stroke();
      }
    });
    if (sent) lxPill(ctx, seen ? `${scn.obj}${sc === 0 ? "이" : "가"} 보여요` : `${scn.obj}${sc === 0 ? "이" : "가"} 안 보여요`, seen ? LX.green : LX.red, true);
  });

  paintList();
  f.say("전등이 켜진 방이에요. <b>전등, 책, 눈</b> 가운데 둘을 차례로 눌러 빛이 가는 길을 화살표로 그려 보세요.");
  api.setCTA("책이 보이게 그려 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
