// u6SeaSkyLab (u6l3): 「바깥 압력이 달라지면 풍선 크기는 어떻게 될까?」
// 나온 곳: 생활 속 기체의 압력과 부피 관계(높은 곳에서 부푸는 과자 봉지와 대기압, 깊은 물속과 수압, 단원 도입의 잠수부 공기 방울).
//          이 소단원에는 실험이 없다. 원인(누르는 압력)을 손으로 바꾸면 결과(부피)가 그 자리에서 보이는 조작으로 만들었다.
// 학생이 정하는 것: 공기를 넣고 묶은 풍선을 어디로 옮길지. 바닷속 30 m에서 산 위 5500 m까지 여섯 자리.
// 볼 것: 자리마다 풍선을 누르는 압력(화살표의 길이와 값)과 풍선의 부피(몇 배). 풍선 속 입자의 수는 어디서나 같다.
// 판정: 산 위에서 풍선이 커진 까닭 → 누르는 압력이 4배인 바닷속 30 m에서의 부피.
// 값은 자연값이다: 물속에서는 10 m마다 약 1기압이 더해지고, 높이 3000 m에서 약 0.7기압, 5500 m에서 약 0.5기압.
// 풍선은 넓이가 부피에 비례하게 그린다. 부피는 오른쪽 아래 칸 막대(바닷가 4칸)로도 따로 보인다(원의 지름에 기대지 않게).
// 누르는 압력의 화살은 기압에 비례하는 길이와 굵기로 그린다(1기압 16px, 4기압 64px). 풍선에는 매듭과 끈이 있다(묶여 있어 입자가 드나들지 못한다).
// 옛 판(잠수부 방울을 버튼으로 띄우고 감압 용기의 마시멜로를 부풀린다)과 다른 점: 풍선 하나가 수압과 대기압을 한 줄로 오가고,
//          커지는 쪽과 작아지는 쪽을 모두 손으로 만든다. 마시멜로 장면은 교과서에 없어 뺐다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, ease, noteRow, chip, dots, stepDots, drawDots } from "./u6Kit";

// y는 풍선과 이름표의 높이. 가장 깊은 자리에서도 가장 긴 화살(4기압)이 무대 안에 들어오게 잡았다.
const STOPS = [
  { name: "바닷속 30 m", p: 4, y: 172 },
  { name: "바닷속 20 m", p: 3, y: 148 },
  { name: "바닷속 10 m", p: 2, y: 124 },
  { name: "바닷가", p: 1, y: 98 },
  { name: "산 3000 m", p: 0.7, y: 64 },
  { name: "산 5500 m", p: 0.5, y: 32 },
];
const SEA = 102; // 해수면
const ARROW = 16; // 1기압의 화살 길이(px)
const fmtP = (p: number): string => (p >= 1 ? `${p}기압` : `${p.toFixed(1)}기압`);
const fmtV = (p: number): string => {
  const v = 1 / p;
  return v === 1 ? "1배" : v === 2 ? "2배" : p === 4 ? "4분의 1배" : p === 3 ? "3분의 1배" : p === 2 ? "2분의 1배" : `${v.toFixed(1)}배`;
};

export const seaSkyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-seasky", label: "바닷속에서 산 위까지 옮겨 보는 풍선", wait: "풍선을 바닷속과 산 위로 옮겨 보세요" });
  const { frame, tm } = lab;
  let idx = 3;
  let y = STOPS[3].y;
  let pShown = 1;
  let phase: "play" | "ask" | "done" = "play";
  const seen = new Set<number>([3]);
  const ps = dots(8, 14, 0.9);

  const note = noteRow();
  const deep = chip("바닷속 30 m");
  const high = chip("산 5500 m");
  const chips = document.createElement("div");
  chips.className = "u6x-chips";
  chips.append(deep.el, high.el);
  const range = bvRange({
    cls: "u6x-rg",
    min: 0,
    max: STOPS.length - 1,
    value: idx,
    label: "풍선 옮기기",
    ticks: ["바닷속 30 m", "", "", "바닷가", "", "산 5500 m"],
    onInput: (v) => {
      if (phase !== "play") return;
      idx = v;
      haptic(HAPTIC.tap);
      seen.add(v);
      if (v === 0) deep.done();
      if (v === 5) high.done();
      sync();
      if (seen.has(0) && seen.has(5)) {
        phase = "ask";
        frame.say("산 위에서는 <b>부풀고</b> 바닷속에서는 <b>쪼그라들었어요</b>. 입자는 여덟 개 그대로예요.");
        range.input.disabled = true;
        api.setCTA("높이에 따른 변화를 비교해 볼까요?", { enabled: false });
        tm.later(askWhy, 1700);
      } else if (v === 0) frame.say("누르는 압력이 4배가 되자 풍선이 <b>쪼그라들었어요</b>. 이번에는 <b>산 위</b>로 옮겨 보세요.");
      else if (v === 5) frame.say("누르는 압력이 절반이 되자 풍선이 <b>부풀었어요</b>. 이번에는 <b>바닷속</b>으로 옮겨 보세요.");
    },
  });
  frame.slot.setControls(range.el, note.el, chips);
  function sync(): void {
    const st = STOPS[idx];
    note.set(`누르는 압력 <b>${fmtP(st.p)}</b>`, `부피 <b>${fmtV(st.p)}</b>`);
    host.dataset.u6Idx = String(idx);
  }

  const askDeep = (): void => {
    frame.pips(2);
    frame.say("바닷가에서 1기압, 바닷속 30 m에서 4기압이었어요.");
    frame.slot.ask(
      "누르는 압력이 <b>4배</b>인 바닷속 30 m에서 풍선의 부피는?",
      [{ t: "4분의 1로 줄었어요", ok: true }, { t: "4배로 늘었어요" }, { t: "절반으로 줄었어요" }],
      (ok) => lab.grade(ok),
      {
        why: "압력이 4배가 되면 부피는 <b>4분의 1</b>로 줄어들어요. 압력과 부피는 <b>반비례</b>해요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("풍선 속 입자는 어디서나 여덟 개 그대로였어요.");
          frame.slot.conclude("온도가 같을 때 기체를 누르는 압력이 <b>작아지면</b> 부피가 커지고, <b>커지면</b> 부피가 줄어요. 높은 산에서는 부풀고 깊은 물속에서는 쪼그라들어요.");
          api.enableCTA(s.cta ?? "용어 정복하기");
        },
      },
    );
  };
  function askWhy(): void {
    lab.phase("ask");
    frame.pips(1);
    frame.say("자리마다 적힌 <b>압력</b>과 풍선의 크기를 비교해 보세요.");
    frame.slot.ask(
      "산 위에서 풍선이 <b>커진</b> 까닭은 무엇일까요?",
      [{ t: "풍선을 누르는 압력이 작아져서", ok: true }, { t: "풍선 속 입자가 늘어나서" }, { t: "산 위의 공기가 풍선에 들어가서" }],
      (ok) => lab.grade(ok),
      { why: "풍선은 묶여 있어 입자 수는 그대로예요. 누르는 압력만 달라졌어요.", onNext: askDeep },
    );
  }

  lab.phase("play");
  frame.say("공기를 넣고 묶은 풍선이에요. 슬라이더를 움직여 <b>바닷속 30 m</b>와 <b>산 5500 m</b>까지 옮겨 보세요.");
  sync();

  lab.run((ctx, dt, tMs) => {
    y = ease(y, STOPS[idx].y, 0.18, dt);
    pShown = ease(pShown, STOPS[idx].p, 0.18, dt);
    const r = 19 * Math.sqrt(1 / pShown);
    // 하늘, 산, 바다
    const sky = ctx.createLinearGradient(0, 0, 0, SEA);
    sky.addColorStop(0, "rgba(60,110,190,.35)");
    sky.addColorStop(1, "rgba(150,200,240,.22)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 346, SEA);
    ctx.fillStyle = "#3B4A63";
    ctx.beginPath();
    ctx.moveTo(114, SEA);
    ctx.lineTo(140, 60);
    ctx.lineTo(150, 68);
    ctx.lineTo(168, 18);
    ctx.lineTo(184, 58);
    ctx.lineTo(192, 52);
    ctx.lineTo(202, SEA);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(240,246,255,.85)";
    ctx.beginPath();
    ctx.moveTo(168, 18);
    ctx.lineTo(161, 38);
    ctx.lineTo(168, 34);
    ctx.lineTo(175, 38);
    ctx.closePath();
    ctx.fill();
    const sea = ctx.createLinearGradient(0, SEA, 0, 230);
    sea.addColorStop(0, "rgba(64,150,220,.45)");
    sea.addColorStop(1, "rgba(14,44,96,.6)");
    ctx.fillStyle = sea;
    ctx.fillRect(0, SEA, 346, 230 - SEA);
    ctx.strokeStyle = "rgba(190,225,255,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= 200; x += 6) {
      const wy = SEA + Math.sin(x / 22 + tMs / 600) * 1.4;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    // 자리 이름표(오른쪽)
    STOPS.forEach((st, i) => {
      const on = i === idx;
      if (on) {
        rr(ctx, 204, st.y - 11, 138, 22, 8);
        ctx.fillStyle = "rgba(255,255,255,.14)";
        ctx.fill();
      }
      txt(ctx, st.name, 212, st.y, { color: on ? "#FFFFFF" : "#C3D2E8", size: 12.5 });
      txt(ctx, fmtP(st.p), 336, st.y, { color: on ? "#FFD68A" : "#C3D2E8", align: "right", size: 12.5 });
    });
    // 풍선: 묶은 매듭과 끈, 몸통, 입자. 누르는 압력은 기압에 비례하는 길이와 굵기의 화살 넷(사방에서 안쪽으로)
    const bx = 62;
    const by = y;
    ctx.strokeStyle = "rgba(201,214,236,.75)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(bx, by + r + 6);
    ctx.bezierCurveTo(bx - 5, by + r + 13, bx + 5, by + r + 19, bx - 1, by + r + 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,120,150,.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,170,190,.95)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,170,190,.95)";
    ctx.beginPath();
    ctx.moveTo(bx, by + r - 1);
    ctx.lineTo(bx + 4.5, by + r + 6);
    ctx.lineTo(bx - 4.5, by + r + 6);
    ctx.closePath();
    ctx.fill();
    stepDots(ps, r, dt);
    drawDots(ctx, ps, bx, by, 205, 2.4);
    const L = ARROW * pShown;
    const w = 1.6 + pShown * 0.9;
    const head = 4 + pShown * 1.1;
    ctx.strokeStyle = "#FFD68A";
    ctx.fillStyle = "#FFD68A";
    ctx.lineCap = "round";
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const r1 = r + 3; // 화살 끝(풍선 쪽)
      const r0 = r1 + L; // 화살 꼬리
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(bx + c * r0, by + sn * r0);
      ctx.lineTo(bx + c * (r1 + head * 0.8), by + sn * (r1 + head * 0.8));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx + c * r1, by + sn * r1);
      ctx.lineTo(bx + c * (r1 + head) - sn * head * 0.75, by + sn * (r1 + head) + c * head * 0.75);
      ctx.lineTo(bx + c * (r1 + head) + sn * head * 0.75, by + sn * (r1 + head) - c * head * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    // 부피는 오른쪽 아래 칸 막대로 따로(바닷가 4칸, 산 5500 m 8칸, 바닷속 30 m 1칸): 원의 크기에 기대지 않게
    const cells = 4 / pShown;
    txt(ctx, "부피", 208, 198, { color: "#C9D6EC", size: 12.5 });
    for (let i = 0; i < 8; i++) {
      const x = 240 + i * 12;
      rr(ctx, x, 191, 10, 14, 3);
      ctx.fillStyle = "rgba(255,255,255,.1)";
      ctx.fill();
      const f = Math.max(0, Math.min(1, cells - i));
      if (f > 0) {
        rr(ctx, x, 191, 10 * f, 14, 3);
        ctx.fillStyle = "rgba(255,150,178,.92)";
        ctx.fill();
      }
    }
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(240 + 4 * 12 - 1, 187);
    ctx.lineTo(240 + 4 * 12 - 1, 209);
    ctx.stroke();
    txt(ctx, `부피 ${fmtV(STOPS[idx].p)} · 입자 8개`, 208, 219, { color: "#FFFFFF", size: 12.5, weight: 800 });
  });

  return () => lab.cleanup();
};
