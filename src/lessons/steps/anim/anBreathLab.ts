// anBreathLab — 중2 Ⅵ L9 "호흡운동 모형".
// 플라스틱 컵 모형(컵=흉강, 빨대=숨관, 작은 고무풍선=허파, 고무 막=가로막)을 직접 움직여
// **부피 → 압력 → 공기 이동**의 인과를 손으로 잡는다. 오른쪽 몸 인셋이 같은 상태를 실시간으로 미러링한다.
// 허파에는 근육이 없다 — 풍선은 스스로 부풀지 않고 컵 속 공간이 넓어질 때 따라 부푼다.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  TISSUE, VESSEL, SUBSTANCE, canvasPoint, capturePointer, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 512;

const DIA_MID = 288; // 고무 막의 기준 위치
const DIA_MIN = 262; // 위로 올렸을 때
const DIA_MAX = 320; // 아래로 당겼을 때

/** 모형 부품 ↔ 몸의 부위 — 짝짓기 국면의 데이터. */
/** 오른쪽 열의 표시 순서 — 왼쪽과 나란히 두면 답이 보이므로 두 칸 엇갈리게 배치한다.
 *  **그리기와 클릭 판정이 반드시 이 함수 하나를 함께 써야 한다**(어긋나면 정답을 눌러도 오답이 된다). */
const bodyAtRow = (i: number): string => PAIRS[(i + 2) % PAIRS.length].body;

const PAIRS: { part: string; body: string }[] = [
  { part: "플라스틱 컵", body: "흉강" },
  { part: "빨대", body: "숨관" },
  { part: "작은 고무풍선", body: "허파" },
  { part: "고무 막", body: "가로막" },
];

export const anBreathLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "플라스틱 컵과 고무 막으로 만든 호흡운동 모형을 움직여 흉강의 부피와 압력, 공기의 이동을 관찰하는 모형",
    height: CVH,
    goals: [
      { id: "inhale", title: "들숨 만들기", sub: "부피 ↑ 압력 ↓" },
      { id: "exhale", title: "날숨 만들기", sub: "부피 ↓ 압력 ↑" },
      { id: "match", title: "모형 ↔ 몸", sub: "네 부분 짝짓기" },
    ],
    helper: "<b>고무 막</b>을 아래로 끌어당기고 <b>갈비뼈 올리기</b>를 눌러 보세요. 작은 풍선이 어떻게 되나요?",
    finish: "완성! <b>갈비뼈가 올라가고 가로막이 내려가면</b> 흉강의 부피가 커져 허파 내부 압력이 <b>낮아지고</b> 공기가 들어와요(들숨). 반대로 하면 부피가 작아져 압력이 <b>높아지고</b> 공기가 나가요(날숨). 허파는 <b>근육이 없어 스스로 움직이지 못해요</b>.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("three");
  const ribBtn = el("button", { class: "an-btn", attrs: { type: "button" }, html: "갈비뼈 올리기<span class='an-btn-sub'>컵을 위로</span>" });
  const diaBtn = el("button", { class: "an-btn", attrs: { type: "button" }, html: "가로막 내리기<span class='an-btn-sub'>고무 막 당기기</span>" });
  const modeBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "모형 ↔ 몸 짝짓기" });
  lab.controls.append(ribBtn, diaBtn, modeBtn);

  let diaY = DIA_MID;
  let rib = 0; // -1 내려감 · 0 기본 · +1 올라감
  let dragging = false;
  let phase: "run" | "match" = "run";
  const matched = new Map<string, string>();
  let pickedPart: string | null = null;
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 3800): void => { toast = m; toastUntil = performance.now() + ms; };
  /** 흉강 부피(상대값) — 고무 막을 당길수록, 컵(갈비뼈)을 올릴수록 커진다. */
  const volume = (): number => 100 + (diaY - DIA_MID) * 0.9 + rib * 20;
  /** 압력은 부피에 반비례(보일 법칙의 정성적 적용). 100을 기준으로 상대 표시. */
  const pressure = (): number => (100 * 100) / volume();

  function judge(): void {
    const v = volume();
    if (v >= 138 && !lab.has("inhale")) {
      lab.collect("inhale", "공기 들어옴");
      lab.setHelper("공기가 들어왔어요! 부피가 커지니 압력이 <b>낮아져</b> 몸 밖 공기가 밀려 들어온 거예요. 이번엔 반대로 — 고무 막을 <b>위로</b> 올리고 <b>갈비뼈 내리기</b>를 눌러 보세요.");
      say("들숨! 갈비뼈 올라가고 가로막 내려감 → 부피 커짐 → 압력 낮아짐 → 공기가 들어와요.", 5200);
    }
    if (v <= 68 && !lab.has("exhale")) {
      lab.collect("exhale", "공기 나감");
      lab.setHelper("공기가 나갔어요! 마지막으로 <b>모형 ↔ 몸 짝짓기</b>를 눌러 모형의 각 부분이 몸의 무엇인지 맞춰 봐요.");
      say("날숨! 갈비뼈 내려가고 가로막 올라감 → 부피 작아짐 → 압력 높아짐 → 공기가 나가요.", 5200);
    }
  }

  life.on(ribBtn, "click", () => {
    rib = rib >= 1 ? -1 : 1;
    ribBtn.innerHTML = rib > 0
      ? "갈비뼈 내리기<span class='an-btn-sub'>컵을 아래로</span>"
      : "갈비뼈 올리기<span class='an-btn-sub'>컵을 위로</span>";
    ribBtn.classList.toggle("on", rib > 0);
    haptic(HAPTIC.tap);
    judge();
  });
  life.on(diaBtn, "click", () => {
    diaY = diaY > DIA_MID ? DIA_MIN : DIA_MAX;
    diaBtn.innerHTML = diaY > DIA_MID
      ? "가로막 올리기<span class='an-btn-sub'>고무 막 밀기</span>"
      : "가로막 내리기<span class='an-btn-sub'>고무 막 당기기</span>";
    diaBtn.classList.toggle("on", diaY > DIA_MID);
    haptic(HAPTIC.tap);
    judge();
  });
  life.on(modeBtn, "click", () => {
    phase = phase === "run" ? "match" : "run";
    modeBtn.classList.toggle("on", phase === "match");
    modeBtn.textContent = phase === "match" ? "모형 조작으로 돌아가기" : "모형 ↔ 몸 짝짓기";
    pickedPart = null;
    haptic(HAPTIC.tap);
    if (phase === "match") lab.setHelper("왼쪽 <b>모형 부품</b>을 탭하고, 오른쪽에서 그에 해당하는 <b>몸의 부위</b>를 탭해 짝지어요.");
    else lab.setHelper("<b>고무 막</b>을 끌거나 버튼을 눌러 부피와 압력을 바꿔 보세요.");
  });

  // ── 입력 ────────────────────────────────────────────────────────────────
  const onDown = (ev: Event): void => {
    const e = ev as PointerEvent;
    const p = canvasPoint(lab.canvas, e, BASE_W);
    if (phase === "match") {
      const li = PAIRS.findIndex((_, i) => p.x >= 14 && p.x <= 168 && p.y >= 90 + i * 52 && p.y <= 90 + i * 52 + 44);
      if (li >= 0) {
        if (matched.has(PAIRS[li].part)) { say("이미 짝지었어요."); return; }
        pickedPart = PAIRS[li].part;
        haptic(HAPTIC.tap);
        say(`${pickedPart} — 몸의 어느 부분일까요?`);
        return;
      }
      const ri = PAIRS.findIndex((_, i) => p.x >= 192 && p.x <= 346 && p.y >= 90 + i * 52 && p.y <= 90 + i * 52 + 44);
      if (ri >= 0) {
        if (!pickedPart) { say("먼저 왼쪽 모형 부품을 탭해 주세요."); return; }
        const want = PAIRS.find((x) => x.part === pickedPart)!;
        if (want.body === bodyAtRow(ri)) {
          matched.set(pickedPart, want.body);
          pickedPart = null;
          haptic(HAPTIC.correct);
          say(`맞아요! ${want.part} = ${want.body}`, 3400);
          if (matched.size === PAIRS.length) lab.collect("match", "네 쌍 완성");
        } else {
          haptic(HAPTIC.wrong);
          say(`${pickedPart}은(는) ${bodyAtRow(ri)}이 아니에요. 다시 생각해 봐요.`, 4200);
        }
      }
      return;
    }
    // 고무 막 잡기
    if (p.x > 60 && p.x < 200 && Math.abs(p.y - diaY) < 30) {
      dragging = true;
      capturePointer(lab.canvas, e);
      lab.canvas.classList.add("grabbing");
    }
  };
  const onMove = (ev: Event): void => {
    if (!dragging) return;
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    diaY = clamp(p.y, DIA_MIN, DIA_MAX);
    judge();
  };
  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    lab.canvas.classList.remove("grabbing");
  };
  life.on(lab.canvas, "pointerdown", onDown);
  life.on(lab.canvas, "pointermove", onMove);
  life.on(lab.canvas, "pointerup", onUp);
  life.on(lab.canvas, "pointercancel", onUp);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawModel(ctx: CanvasRenderingContext2D, t: number): void {
    const v = volume();
    const lung = clamp((v - 55) / 95, 0.16, 1); // 풍선 크기 비율
    const cupDy = -rib * 10;

    ctx.save();
    ctx.translate(0, cupDy);
    // 빨대(숨관 + 두 갈래)
    ctx.strokeStyle = VESSEL.airway.lo;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(130, 62);
    ctx.lineTo(130, 132);
    ctx.moveTo(130, 132);
    ctx.lineTo(106, 162);
    ctx.moveTo(130, 132);
    ctx.lineTo(154, 162);
    ctx.stroke();
    ctx.strokeStyle = VESSEL.airway.mid;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(130, 62);
    ctx.lineTo(130, 132);
    ctx.moveTo(130, 132);
    ctx.lineTo(106, 162);
    ctx.moveTo(130, 132);
    ctx.lineTo(154, 162);
    ctx.stroke();

    // 작은 고무풍선 2개 = 허파
    for (const dx of [-1, 1]) {
      const cx = 130 + dx * 24;
      const r = 16 + 20 * lung;
      const g = ctx.createRadialGradient(cx - r * 0.3, 168, r * 0.2, cx, 168 + r * 0.5, r * 1.3);
      g.addColorStop(0, TISSUE.lung.hi);
      g.addColorStop(1, TISSUE.lung.lo);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, 170 + r * 0.4, r * 0.82, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = TISSUE.lung.lo;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // 플라스틱 컵(흉강) — 아래가 잘린 투명 컵
    ctx.beginPath();
    ctx.moveTo(88, 96);
    ctx.lineTo(172, 96);
    ctx.lineTo(190, 292);
    ctx.lineTo(70, 292);
    ctx.closePath();
    ctx.fillStyle = withAlpha("#BBD2E4", 0.1);
    ctx.fill();
    ctx.strokeStyle = withAlpha("#BBD2E4", 0.85);
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // 갈비뼈 붙임딱지
    ctx.strokeStyle = withAlpha(TISSUE.bone.mid, 0.9);
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const y = 140 + i * 42;
      ctx.beginPath();
      ctx.moveTo(80 + i * 1.5, y);
      ctx.quadraticCurveTo(130, y - 14, 180 - i * 1.5, y);
      ctx.stroke();
    }
    ctx.restore();

    // 고무 막(가로막) — 당긴 만큼 아래로 늘어진다
    ctx.save();
    const my = diaY + cupDy;
    ctx.strokeStyle = TISSUE.membrane.lo;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(70, 292 + cupDy);
    ctx.quadraticCurveTo(130, my + (my - DIA_MID) * 0.6, 190, 292 + cupDy);
    ctx.stroke();
    ctx.strokeStyle = TISSUE.membrane.mid;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(70, 292 + cupDy);
    ctx.quadraticCurveTo(130, my + (my - DIA_MID) * 0.6, 190, 292 + cupDy);
    ctx.stroke();
    // 손잡이 — 여기를 끌 수 있다는 신호
    ctx.fillStyle = dragging ? SUBSTANCE.energy.mid : withAlpha(SUBSTANCE.energy.mid, 0.7);
    ctx.beginPath();
    ctx.arc(130, my + (my - DIA_MID) * 0.3 + 8, dragging ? 9 : 7.5 + Math.sin(t / 320) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    labelChip(ctx, 130, my + 34, "고무 막을 끌어요", { size: 9, bg: withAlpha("#0B1524", 0.8) });

    // 공기 이동 화살표
    const v2 = volume();
    if (v2 > 112 || v2 < 88) {
      const inward = v2 > 112;
      ctx.save();
      ctx.strokeStyle = inward ? "#6BC6F5" : "#F5A66B";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 3;
      const y0 = inward ? 34 : 62;
      const y1 = inward ? 58 : 32;
      ctx.beginPath();
      ctx.moveTo(130, y0);
      ctx.lineTo(130, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(130, y1);
      ctx.lineTo(125, y1 + (inward ? -7 : 7));
      ctx.lineTo(135, y1 + (inward ? -7 : 7));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      labelChip(ctx, 130, 20, inward ? "공기가 들어와요" : "공기가 나가요", {
        size: 9.5,
        bg: withAlpha(inward ? "#1B6E96" : "#9A5A18", 0.92),
      });
    }
  }

  function drawBodyInset(ctx: CanvasRenderingContext2D): void {
    const v = volume();
    const lung = clamp((v - 55) / 95, 0.16, 1);
    ctx.save();
    ctx.fillStyle = withAlpha("#0B1524", 0.5);
    roundRect(ctx, 232, 86, 118, 190, 12);
    ctx.fill();
    ctx.strokeStyle = withAlpha("#8FA6C2", 0.28);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    labelChip(ctx, 291, 100, "우리 몸", { size: 9.5, bg: withAlpha("#0B1524", 0.86) });

    const dy = -rib * 7;
    // 허파
    for (const dx of [-1, 1]) {
      const cx = 291 + dx * 21;
      const r = 13 + 13 * lung;
      ctx.fillStyle = TISSUE.lung.mid;
      ctx.beginPath();
      ctx.ellipse(cx, 168 + dy, r * 0.8, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = TISSUE.lung.lo;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    // 갈비뼈
    ctx.strokeStyle = withAlpha(TISSUE.bone.mid, 0.92);
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const y = 140 + i * 30 + dy;
      ctx.beginPath();
      ctx.moveTo(252, y);
      ctx.quadraticCurveTo(291, y - 10, 330, y);
      ctx.stroke();
    }
    // 가로막
    const dm = 236 + (diaY - DIA_MID) * 0.5;
    ctx.strokeStyle = TISSUE.membrane.mid;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(252, 236 + dy);
    ctx.quadraticCurveTo(291, dm + 12, 330, 236 + dy);
    ctx.stroke();
    ctx.font = "700 8.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.72);
    ctx.fillText(rib > 0 ? "갈비뼈 올라감" : rib < 0 ? "갈비뼈 내려감" : "갈비뼈", 291, 122);
    ctx.fillText(diaY > DIA_MID ? "가로막 내려감" : diaY < DIA_MID ? "가로막 올라감" : "가로막", 291, 266);
  }

  function drawReadout(ctx: CanvasRenderingContext2D): void {
    const v = volume();
    const pr = pressure();
    ctx.save();
    ctx.fillStyle = withAlpha("#0B1524", 0.62);
    roundRect(ctx, 8, 352, 344, 106, 12);
    ctx.fill();
    ctx.restore();
    const row = (i: number, label: string, txt: string, frac: number, color: string): void => {
      const y = 374 + i * 30;
      ctx.font = "800 10.5px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = withAlpha("#FFFFFF", 0.66);
      ctx.fillText(label, 20, y);
      ctx.fillStyle = withAlpha("#0B1524", 0.6);
      roundRect(ctx, 108, y - 8, 150, 16, 8);
      ctx.fill();
      ctx.fillStyle = color;
      roundRect(ctx, 108, y - 8, Math.max(6, 150 * clamp(frac, 0, 1)), 16, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.fillText(txt, 344, y);
      ctx.textAlign = "left";
    };
    row(0, "흉강 부피", v > 112 ? "커짐" : v < 88 ? "작아짐" : "기본", (v - 55) / 95, TISSUE.lung.mid);
    row(1, "허파 내부 압력", pr < 90 ? "낮아짐" : pr > 112 ? "높아짐" : "기본", (pr - 60) / 120, SUBSTANCE.carbon.mid);
    row(2, "공기 이동", v > 112 ? "몸 밖 → 허파" : v < 88 ? "허파 → 몸 밖" : "멈춤", v > 112 ? 1 : v < 88 ? 0.35 : 0.6, VESSEL.airway.mid);
  }

  function drawMatch(ctx: CanvasRenderingContext2D): void {
    PAIRS.forEach((pr, i) => {
      const y = 90 + i * 52;
      const done = matched.has(pr.part);
      const on = pickedPart === pr.part;
      // 왼쪽 — 모형 부품
      ctx.fillStyle = withAlpha(done ? "#04B45F" : "#0B1524", done ? 0.3 : 0.55);
      roundRect(ctx, 14, y, 154, 44, 11);
      ctx.fill();
      ctx.strokeStyle = on ? "#FFE9A8" : withAlpha("#8FA6C2", 0.3);
      ctx.lineWidth = on ? 2.4 : 1.2;
      ctx.stroke();
      ctx.font = "800 11.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(pr.part, 91, y + 22);
      // 오른쪽 — 몸의 부위(위치를 섞어 두면 헷갈리므로 순서는 그대로, 정답은 짝으로 판정)
      const rowBody = bodyAtRow(i);
      const bodyDone = [...matched.values()].includes(rowBody);
      ctx.fillStyle = withAlpha(bodyDone ? "#04B45F" : "#0B1524", bodyDone ? 0.3 : 0.55);
      roundRect(ctx, 192, y, 154, 44, 11);
      ctx.fill();
      ctx.strokeStyle = pickedPart ? withAlpha("#FFE9A8", 0.6) : withAlpha("#8FA6C2", 0.3);
      ctx.lineWidth = pickedPart ? 2 : 1.2;
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(rowBody, 269, y + 22);
    });
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.6);
    ctx.fillText(`짝지은 쌍 ${matched.size} / ${PAIRS.length}`, BASE_W / 2, 320);
    ctx.textAlign = "left";
  }

  const loop: Loop = createLoop((_dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    if (phase === "run") {
      drawModel(ctx, t);
      drawBodyInset(ctx);
      drawReadout(ctx);
    } else {
      drawMatch(ctx);
    }

    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.56);
    ctx.fillText("허파에는 근육이 없어요 — 컵과 고무 막이 움직여 줘야 부풀어요", BASE_W / 2, 486);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, phase === "run" ? 336 : 470, toast, {
        size: 10, bg: withAlpha("#0B1524", 0.94), fg: "#FFE9A8",
      });
    }
    ctx.restore();
    lab.setPill(phase === "match" ? `짝짓기 ${matched.size}/4` : `부피 ${Math.round(volume())} · 압력 ${Math.round(pressure())}`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
