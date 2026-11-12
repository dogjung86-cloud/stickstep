// [중2 Ⅶ v5] g2u7l8 swingLab: 「전기 그네는 어느 쪽으로 움직일까요?」 (3D)
// 책의 어디에서: 해 보기 '자기장 안에서 전류가 흐르는 코일이 받는 힘 관찰하기'(말굽자석 사이에 건 코일 그네. 스위치를 닫아 보고, 전류의 방향을 바꾸고,
//   말굽자석의 두 극을 바꾸고, 전류를 세게 해 본다)와 그림 '전류의 방향이나 자기장의 방향이 바뀔 때 코일이 받는 힘'.
// 한 통찰: 전류나 자기장 가운데 하나의 방향을 바꾸면 힘의 방향이 반대가 되고, 전류가 셀수록 힘이 크다.
// 학생이 정하는 것: 스위치를 누르는 것, 전류의 방향, 자석의 극, 전류의 세기(차례는 자유). 무대를 끌어 돌려 볼 수 있다.
// 실패하는 길: 스위치를 누르지 않으면 그네는 움직이지 않는다. 스위치를 오래 누르고 있으면 코일이 뜨거워져 전류를 끊어야 한다.
// 옛 랩(swingLab3d)은 가로 화면의 3D 장면에서 차례로 눌렀다. 여기서는 세로 한 화면에서 장치를 돌려 보며 학생이 고른 조합마다 힘을 계산한다.
// 힘의 방향은 전류(선의 방향)와 자기장(N극에서 S극)의 벡터곱으로 계산한다. three.js는 열릴 때만 내려받는다(ui/space3d, 동적 import).

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, xFrame, xHold, xRow, xSegs, type LabStep } from "./kit";

export const swingLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const tm = bvTimers();
  const cv = el("canvas", { class: "g2u7x-cv3d" }) as HTMLCanvasElement;
  const tag = el("div", { class: "g2u7x-tag", text: "스위치를 누르기 전" });
  const tip = el("div", { class: "g2u7x-tip", text: "끌어서 돌려 보기" });
  f.stage.append(cv, tag, tip);

  let held = false;
  let cur: 1 | -1 = -1; // 그네 아랫변에 흐르는 전류의 방향(z축)
  let nBottom = true; // N극이 아래
  let strong = false;
  let finished = false;
  let hot = 0; // 스위치를 누르고 있던 시간(초)
  let angle = 0;
  let az = 0.62;
  let elv = 0.26;
  const seen = { press: false, cur: false, pole: false, strong: false };
  /** 그네가 받는 힘의 x방향(+1이 자석 바깥쪽). 전류 z × 자기장 y = −x */
  const fx = (): number => -cur * (nBottom ? 1 : -1);

  const sw = xHold("main", "스위치 누르고 있기", (v) => {
    if (finished) return;
    held = v;
    if (v) {
      hot = 0;
      seen.press = true;
      if (cur === 1) seen.cur = true;
      if (!nBottom) seen.pole = true;
      if (strong) seen.strong = true;
      const out = fx() > 0;
      f.say(`그네가 자석 <b>${out ? "바깥쪽" : "안쪽"}</b>으로 ${strong ? "크게 " : ""}움직여요. 하나씩 바꿔 가며 견줘 보세요.`);
    }
    after();
  });
  const bCur = bvBtn("", "전류 방향 바꾸기");
  const bPole = bvBtn("", "자석의 극 바꾸기");
  const power = xSegs(
    [
      { k: "weak", t: "약한 전류" },
      { k: "strong", t: "센 전류" },
    ],
    "weak",
    (k) => {
      strong = k === "strong";
      f.say(strong ? "전류를 <b>세게</b> 했어요. 스위치를 눌러 그네가 얼마나 움직이는지 봐요." : "전류를 약하게 했어요. 스위치를 눌러 보세요.");
    },
  );
  f.slot.setControls(sw, xRow(bCur, bPole), power.el);
  bCur.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    cur = cur === 1 ? -1 : 1;
    f.say("<b>전류의 방향</b>을 바꿨어요. 스위치를 눌러 그네가 어느 쪽으로 가는지 봐요.");
  });
  bPole.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    nBottom = !nBottom;
    f.say("<b>자석의 두 극</b>을 바꿨어요. 스위치를 눌러 그네가 어느 쪽으로 가는지 봐요.");
  });
  function after(): void {
    f.pips((seen.press ? 1 : 0) + (seen.cur ? 1 : 0) + (seen.pole ? 1 : 0) + (seen.strong ? 1 : 0));
    if (!held && seen.press && seen.cur && seen.pole && seen.strong && !finished) {
      finished = true;
      sw.disabled = true;
      bCur.disabled = true;
      bPole.disabled = true;
      power.lock(true);
      tm.later(ask, 1600);
    }
  }
  function ask(): void {
    f.slot.ask(
      "전류의 방향과 자석의 극을 둘 다 바꾸면 그네가 움직이는 방향은?",
      [{ t: "처음과 같은 쪽", ok: true }, { t: "처음과 반대쪽" }, { t: "움직이지 않아요" }],
      (ok) => api.recordQuiz(ok),
      { why: "하나를 바꾸면 반대가 되고, 하나 더 바꾸면 <b>다시 처음</b>이 돼요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("자기장 안의 코일에 전류가 흐르면 코일은 <b>힘</b>을 받아요. 전류나 자기장의 방향을 바꾸면 힘의 방향이 반대가 되고, 전류가 셀수록 힘이 커요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // 무대를 끌어 돌려 본다
  let drag: { x: number; y: number } | null = null;
  cv.addEventListener("pointerdown", (e) => {
    bvCapture(cv, e.pointerId);
    drag = { x: e.clientX, y: e.clientY };
    tip.classList.add("off");
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    az = clamp(az - (e.clientX - drag.x) * 0.01, -0.5, 1.5);
    elv = clamp(elv + (e.clientY - drag.y) * 0.006, 0.05, 0.9);
    drag = { x: e.clientX, y: e.clientY };
  });
  ["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => (drag = null)));

  let loop: Loop | null = null;
  let dispose: (() => void) | null = null;
  void (async () => {
    const S = await import("../../../ui/space3d");
    if (!tm.alive()) return;
    const T = S.THREE;
    const stage = S.createSpaceStage(cv, { fov: 36 });
    if (!stage) {
      tag.textContent = "이 기기에서는 3D 장면을 열 수 없어요";
      return;
    }
    dispose = () => stage.dispose();
    const { scene, camera } = stage;
    scene.add(new T.AmbientLight(0xffffff, 1.5));
    const sun = new T.DirectionalLight(0xffffff, 2.2);
    sun.position.set(4, 8, 6);
    scene.add(sun);
    const box = (w: number, h: number, d: number, color: number, x: number, y: number, z: number): InstanceType<typeof T.Mesh> => {
      const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 }));
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    };
    // 받침과 기둥, 가로대
    box(4.6, 0.16, 3.4, 0x33415c, 0, -1.3, 0);
    box(0.14, 3.9, 0.14, 0x8fa4c2, 0.3, 0.65, 1.45);
    box(0.14, 3.9, 0.14, 0x8fa4c2, 0.3, 0.65, -1.45);
    box(0.14, 0.14, 3.04, 0x8fa4c2, 0.3, 2.6, 0);
    // 말굽자석(옆으로 눕힘, 벌어진 쪽이 +x)
    const top = box(2.0, 0.42, 1.0, 0x3d8fe8, -0.2, 0.78, 0);
    const bot = box(2.0, 0.42, 1.0, 0xe0503a, -0.2, -0.78, 0);
    box(0.42, 1.98, 1.0, 0x9aa7bd, -1.41, 0, 0);
    const lTop = S.makeLabel("S극", { size: 0.62, color: "#9CC8FF" });
    const lBot = S.makeLabel("N극", { size: 0.62, color: "#FFB3A6" });
    lTop.position.set(-0.6, 0.78, 0.62);
    lBot.position.set(-0.6, -0.78, 0.62);
    scene.add(lTop, lBot);
    // 그네(가로대에 매단 코일)
    const swing = new T.Group();
    swing.position.set(0.3, 2.6, 0);
    const copper = new T.MeshStandardMaterial({ color: 0xd9944a, roughness: 0.4, metalness: 0.5 });
    const rod = (len: number, x: number, y: number, z: number, alongZ: boolean): void => {
      const m = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, len, 12), copper);
      if (alongZ) m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z);
      swing.add(m);
    };
    rod(2.6, 0, -1.3, 0.85, false);
    rod(2.6, 0, -1.3, -0.85, false);
    rod(1.7, 0, -2.6, 0, true);
    scene.add(swing);
    // 화살표: 자기장(빨강), 전류(노랑), 힘(청록)
    const fieldArrows = [-0.28, 0.28].map((z) => {
      const a = new T.ArrowHelper(new T.Vector3(0, 1, 0), new T.Vector3(0.75, -0.5, z), 1.0, 0xff7b6b, 0.26, 0.16);
      scene.add(a);
      return a;
    });
    const curArrow = new T.ArrowHelper(new T.Vector3(0, 0, 1), new T.Vector3(0, -2.6, 0), 0.8, 0xffc45a, 0.3, 0.2);
    const forceArrow = new T.ArrowHelper(new T.Vector3(1, 0, 0), new T.Vector3(0, -2.6, 0), 1.0, 0x3fd6c0, 0.34, 0.24);
    swing.add(curArrow, forceArrow);
    const lField = S.makeLabel("자기장", { size: 0.58, color: "#FFB3A6" });
    const lCur = S.makeLabel("전류", { size: 0.58, color: "#FFD98A" });
    const lForce = S.makeLabel("힘", { size: 0.64, color: "#8FF0DF" });
    lField.position.set(1.25, 0, 0.6);
    scene.add(lField);
    swing.add(lCur, lForce);

    loop = createLoop((dt) => {
      const w = f.stage.clientWidth || 346;
      const h = f.stage.clientHeight || 230;
      if (cv.width !== Math.round(w * Math.min(window.devicePixelRatio || 1, 1.75))) stage.resize(w, h);
      if (held) {
        hot += dt / 60;
        if (hot > 5) {
          // 오래 누르면 코일이 뜨거워진다(책의 안전 수칙)
          sw.dispatchEvent(new Event("pointercancel"));
          haptic(HAPTIC.wrong);
          f.say("코일이 <b>뜨거워져서</b> 전류를 끊었어요. 스위치는 오래 누르지 않아요.");
        }
      }
      const by = nBottom ? 1 : -1;
      const out = fx();
      const goal = held ? out * (strong ? (out > 0 ? 0.42 : 0.34) : 0.2) : 0;
      angle += (goal - angle) * Math.min(1, dt * 0.07);
      swing.rotation.z = angle;
      (top.material as InstanceType<typeof T.MeshStandardMaterial>).color.setHex(nBottom ? 0x3d8fe8 : 0xe0503a);
      (bot.material as InstanceType<typeof T.MeshStandardMaterial>).color.setHex(nBottom ? 0xe0503a : 0x3d8fe8);
      fieldArrows.forEach((a) => {
        a.position.y = -0.5 * by;
        a.setDirection(new T.Vector3(0, by, 0));
      });
      curArrow.visible = held;
      forceArrow.visible = held;
      lCur.visible = held;
      lForce.visible = held;
      curArrow.setDirection(new T.Vector3(0, 0, cur));
      curArrow.position.set(0, -2.6, -cur * 0.4);
      forceArrow.setDirection(new T.Vector3(out, 0, 0));
      forceArrow.setLength(strong ? 1.4 : 0.95, 0.34, 0.24);
      lCur.position.set(0, -3.0, cur * 0.8);
      lForce.position.set(out * (strong ? 1.75 : 1.3), -2.3, 0);
      const r = 7.4;
      camera.position.set(Math.cos(elv) * Math.cos(az) * r, 0.6 + Math.sin(elv) * r, Math.cos(elv) * Math.sin(az) * r);
      camera.lookAt(0, 0.6, 0);
      // 글자표는 그 장면에서 직접 바꿀 수 없어 극이 바뀌면 자리만 맞바꾼다
      lTop.position.y = nBottom ? 0.78 : -0.78;
      lBot.position.y = nBottom ? -0.78 : 0.78;
      stage.render();
      tag.textContent = held ? `힘의 방향: 자석 ${out > 0 ? "바깥쪽" : "안쪽"}${strong ? ", 크게" : ""}` : `전류 ${cur === -1 ? "처음 방향" : "반대 방향"} · N극 ${nBottom ? "아래" : "위"}`;
      f.stage.dataset.force = held ? (out > 0 ? "out" : "in") : "none";
    }).start();
  })();

  f.say("말굽자석 사이에 코일 그네를 걸었어요. <b>스위치를 누르고</b>, 전류와 자석을 하나씩 바꿔 보세요.");
  api.setCTA("네 가지를 모두 해 보세요", { enabled: false });
  return () => {
    tm.clear();
    loop?.stop();
    loop = null;
    dispose?.();
    dispose = null;
  };
};
