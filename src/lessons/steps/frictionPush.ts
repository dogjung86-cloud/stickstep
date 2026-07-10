// frictionPush — 마찰력 랩(V 단원 L5). 스틱맨이 되어 상자를 민다 (교과서 그림 V-10의 조작판).
//   · 버튼을 꾹 누르면 미는 힘(파랑→)이 자라고, 마찰력(빨강←)이 맞선다
//   · 미는 힘이 최대 정지 마찰을 넘는 순간 — 상자가 실제로 미끄러진다!
//   · 바닥(얼음/나무/사포)이 거칠수록, 상자를 쌓아 무거울수록 필요한 힘이 커진다
// 목표: 세 바닥에서 각각 상자를 움직여 보기 (+ 무거운 상자 체험은 자유).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawStickman, posePush, poseStand } from "../../ui/stick";
import { drawForceArrow, drawCrate } from "../../ui/forceProps";
import { contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface FrictionStep {
  title: string;
  lead?: string;
  cta?: string;
}

const FLOORS = [
  { id: "ice", name: "얼음 바닥", grip: 40, color: "#9CD8F0", desc: "미끌미끌" },
  { id: "wood", name: "나무 바닥", grip: 90, color: "#C89858", desc: "보통" },
  { id: "sand", name: "사포 바닥", grip: 150, color: "#B0764A", desc: "거칠거칠" },
] as const;
type FloorId = (typeof FLOORS)[number]["id"];

export const frictionPush: StepRenderer = (host, step, api) => {
  const s = step as unknown as FrictionStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:236px" });
  const pushVal = el("span", { text: "0" });
  const fricPill = el("span", { text: "밀어 보기 전이에요" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F25757" }), fricPill),
      el("div", { class: "tempread" }, pushVal, el("small", { text: " N" })),
    ),
    toastEl,
  );

  // 바닥 선택 + 상자 쌓기
  const seg = el("div", { class: "seg" });
  const floorBtns = new Map<FloorId, HTMLButtonElement>();
  FLOORS.forEach((f, i) => {
    const b = el("button", { class: i === 1 ? "on" : "", text: f.name, attrs: { type: "button", "aria-pressed": String(i === 1) } });
    seg.appendChild(b);
    floorBtns.set(f.id, b);
  });
  const stackBtn = el(
    "button",
    { class: "swapbtn", attrs: { type: "button" } },
    el("span", { text: "상자 쌓기 " }),
    el("span", { class: "fp-stack", text: "1개" }),
  );
  const pushBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "꾹 눌러 밀기" }));
  const controls = el("div", { class: "fp-controls" }, stackBtn, pushBtn);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    ...FLOORS.map((f) => el("div", { class: "pn-badge force", dataset: { g: f.id } }, el("b", { text: f.name.replace(" 바닥", "") }), el("span", { text: f.desc }))),
  );
  const helper = el("div", {
    class: "helper",
    html: "<b>꾹 눌러 밀기</b>를 누르고 있으면 미는 힘이 점점 커져요. 상자가 언제 움직이기 시작하는지 지켜보세요!",
  });
  host.append(goalChips, helper, stage, seg, controls); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let floor: FloorId = "wood";
  let boxes = 1; // 1~3
  let pushing = false;
  let pushN = 0; // 미는 힘(N)
  let boxX = 0; // 상자 위치 오프셋(px)
  let boxV = 0;
  let slidHere = false; // 현재 바닥에서 미끄러뜨렸나
  const goals = new Set<FloorId>();
  let finished = false;
  let toastTimer = 0;

  const gripN = (): number => FLOORS.find((f) => f.id === floor)!.grip * (0.5 + boxes * 0.5); // 무게 반영 한계
  const frictionNow = (): number => Math.min(pushN, gripN()); // 정지 마찰(움직이기 전) 근사

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  function reset(msgKeep = false): void {
    pushN = 0;
    boxX = 0;
    boxV = 0;
    slidHere = false;
    if (!msgKeep && !finished) fricPill.textContent = "밀어 보기 전이에요";
  }

  function setFloor(id: FloorId): void {
    if (floor === id) return;
    floor = id;
    floorBtns.forEach((b, k) => {
      b.classList.toggle("on", k === id);
      b.setAttribute("aria-pressed", String(k === id));
    });
    haptic(HAPTIC.tap);
    reset();
    const f = FLOORS.find((x) => x.id === id)!;
    if (!finished) helper.innerHTML = `<b>${f.name}</b>(${f.desc})이에요. 얼마나 세게 밀어야 움직일까요?`;
  }
  floorBtns.forEach((b, id) => b.addEventListener("click", () => setFloor(id)));

  stackBtn.addEventListener("click", () => {
    boxes = boxes >= 3 ? 1 : boxes + 1;
    (stackBtn.querySelector(".fp-stack") as HTMLElement).textContent = `${boxes}개`;
    haptic(HAPTIC.tap);
    reset();
    if (!finished) {
      helper.innerHTML =
        boxes > 1
          ? `상자 <b>${boxes}개</b> — 더 무거워졌어요. 같은 바닥인데 움직이는 데 필요한 힘이 어떻게 달라질까요?`
          : "다시 1개로. 가벼우면 살살 밀어도 움직여요.";
    }
  });

  pushBtn.addEventListener("pointerdown", (e) => {
    pushing = true;
    pushBtn.classList.add("done-static");
    pushBtn.setPointerCapture(e.pointerId);
    haptic(HAPTIC.tap);
  });
  const stopPush = (): void => {
    pushing = false;
    pushBtn.classList.remove("done-static");
  };
  pushBtn.addEventListener("pointerup", stopPush);
  pushBtn.addEventListener("pointercancel", stopPush);

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 236);
    const groundY = h * 0.78;
    const f = FLOORS.find((x) => x.id === floor)!;
    const limit = gripN();

    // 힘 모델
    if (pushing && !slidHere) pushN = Math.min(pushN + 1.6 * dt, limit + 60);
    else if (pushing && slidHere) pushN = Math.min(pushN + 1.6 * dt, limit + 80);
    else pushN = Math.max(0, pushN - 4 * dt);

    const moving = pushN > limit;
    if (moving) {
      boxV += ((pushN - limit) / 260) * dt;
      if (!slidHere) {
        slidHere = true;
        haptic(HAPTIC.correct);
        toast(`${Math.round(limit)} N을 넘는 순간 — 움직인다!`);
        if (!goals.has(floor)) {
          goals.add(floor);
          (goalChips.querySelector(`[data-g="${floor}"]`) as HTMLElement).classList.add("on");
          if (goals.size === 3 && !finished) {
            finished = true;
            helper.innerHTML =
              "세 바닥 완주! 마찰력은 접촉면이 <b>거칠수록</b>, 물체가 <b>무거울수록</b> 커져서 더 세게 밀어야 했어요. 방향은 늘 <b>미는 방향의 반대</b>였고요.";
            api.recordQuiz(true);
            api.enableCTA(s.cta ?? "개념 정리하기");
          } else if (!finished) {
            helper.innerHTML = `좋아요! 이제 <b>다른 바닥</b>으로 바꿔서 비교해 보세요. (${goals.size}/3)`;
          }
        }
      }
    } else {
      boxV *= Math.pow(0.82, dt);
    }
    boxX += boxV * dt;
    if (boxX > w * 0.3) {
      // 화면 밖으로 나가기 전에 부드럽게 리셋
      boxX = 0;
      boxV = 0;
      pushN = 0;
      if (!pushing) reset(true);
    }

    // HUD
    pushVal.textContent = String(Math.round(pushN));
    if (pushN > 2) {
      fricPill.textContent = moving
        ? `미끄러지는 중! 마찰력은 여전히 반대 방향`
        : `마찰력 ${Math.round(frictionNow())} N이 버티는 중 (한계 ${Math.round(limit)} N)`;
    }

    // ---- 그리기 ----
    // 바닥 재질
    const floorG = ctx.createLinearGradient(0, groundY, 0, h);
    floorG.addColorStop(0, `${f.color}33`);
    floorG.addColorStop(1, `${f.color}0A`);
    ctx.fillStyle = floorG;
    ctx.fillRect(0, groundY, w, h - groundY);
    ctx.strokeStyle = `${f.color}AA`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    // 재질 텍스처
    if (floor === "ice") {
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        const tx = ((i * 173) % w) + 12;
        ctx.beginPath();
        ctx.moveTo(tx, groundY + 6 + (i % 3) * 8);
        ctx.lineTo(tx + 26, groundY + 10 + (i % 3) * 8);
        ctx.stroke();
      }
    } else if (floor === "sand") {
      ctx.fillStyle = "rgba(255,220,180,.4)";
      for (let i = 0; i < 42; i++) {
        ctx.fillRect(((i * 97) % w), groundY + 4 + ((i * 37) % Math.max(6, h - groundY - 8)), 2, 2);
      }
    } else {
      ctx.strokeStyle = "rgba(120,80,36,.35)";
      ctx.lineWidth = 1.2;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, groundY + i * ((h - groundY) / 4));
        ctx.lineTo(w, groundY + i * ((h - groundY) / 4));
        ctx.stroke();
      }
    }

    // 상자(쌓기)
    const crateW = 74;
    const crateH = 52;
    const crateX = w * 0.52 + boxX;
    contactShadow(ctx, crateX, groundY + 5, crateW * 0.85, 0.26);
    for (let i = 0; i < boxes; i++) {
      drawCrate(ctx, crateX, groundY - i * crateH, crateW, crateH, tMs, moving ? 0.7 : pushing && pushN > limit * 0.75 ? 0.5 : 0);
    }

    // 스틱맨 — 상자 왼쪽에서 민다
    const eff = clamp(pushN / Math.max(60, limit), 0, 1);
    const manX = crateX - crateW / 2 - 34;
    contactShadow(ctx, manX, groundY + 4, 26, 0.22);
    drawStickman(ctx, manX, groundY, 80, pushing || pushN > 2 ? posePush(eff, tMs) : poseStand(tMs), { face: "dot" });

    // 힘 화살표: 미는 힘(파랑→, 상자 위쪽 공중), 마찰력(빨강←, 바닥 접촉면 아래 라벨)
    if (pushN > 3) {
      const scale = 0.32;
      const stackTop = groundY - boxes * crateH;
      drawForceArrow(ctx, crateX - crateW * 0.42, stackTop - 30, pushN * scale, 0, { color: "#4EA3F5", width: 4.2 });
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#9CC8F5";
      ctx.fillText(`미는 힘 ${Math.round(pushN)} N`, crateX - crateW * 0.42, stackTop - 40);
      const fr = frictionNow();
      drawForceArrow(ctx, crateX + crateW * 0.42, groundY - 6, -fr * scale, 0, { color: "#F25757", width: 4.2 });
      ctx.textAlign = "right";
      ctx.fillStyle = "#F5A0A0";
      ctx.fillText(`마찰력 ${Math.round(fr)} N`, crateX + crateW * 0.42, groundY + 18);
    }

    // 한계 게이지(상자 위) — 얼마나 더 밀어야 하는지 직감
    if (pushN > 3 && !moving) {
      const gx = crateX - crateW / 2;
      const gw2 = crateW;
      const gy = groundY - boxes * crateH - 58;
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.fillRect(gx, gy, gw2, 7);
      ctx.fillStyle = pushN / limit > 0.9 ? "#FFC24D" : "#4EA3F5";
      ctx.fillRect(gx, gy, gw2 * clamp(pushN / limit, 0, 1), 7);
      ctx.strokeStyle = "rgba(255,255,255,.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(gx, gy, gw2, 7);
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 236);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("세 가지 바닥에서 상자를 움직여 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
