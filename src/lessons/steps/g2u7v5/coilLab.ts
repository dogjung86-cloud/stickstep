// [중2 Ⅶ v5] g2u7l7 coilLab: 「코일에 전류가 흐르면 나침반은 어디를 가리킬까요?」
// 다루는 내용: 탐구 활동(코일 주위에 나침반을 놓고 스위치를 닫아 N극이 가리키는 방향을 보고,
//   전류의 방향만 반대로 바꿔 보고, 전류의 세기를 바꿔 본다).
// 한 통찰: 전류가 흐르는 코일 주위에는 자기장이 생긴다. 전류의 방향을 바꾸면 자기장의 방향이 반대가 되고, 전류가 세면 자기장도 세다.
// 학생이 정하는 것: 나침반을 어디에 몇 개 놓을지, 스위치, 전류의 방향, 전류의 세기(차례는 자유).
// 실패하는 길: 나침반을 놓지 않으면 아무것도 볼 수 없다. 스위치를 열어 두면 모든 바늘이 북쪽만 가리킨다.
// 옛 랩(coilFieldLab)은 정해진 자리의 나침반을 보기만 했다. 여기서는 학생이 고른 자리마다 자기장을 계산해 바늘을 돌린다.
// 걸음(2026-11-14 보강): 전류의 방향을 처음 바꾸기 전에 예측을 먼저 한다. 코일 자리에 막대자석을 놓아 견주면 바늘이 똑같이 가리킨다(코일의 한쪽 끝이 N극).
// 바늘의 방향: 지구 자기장(화면 위쪽이 북쪽)과 코일의 자기장(막대자석과 같은 꼴로 계산)을 더한 방향이다. 약한 전류에서는 바늘이 조금만 돌아간다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { mBar, mCoil, mCoilEnds, mCompass } from "./magKit";
import { X, xArrow, xBox, xCanvas, xCap, xFrame, xRow, xSegs, xText, type LabStep } from "./kit";

const C = { x: 173, y: 112 };
const MAG_BUSY = "지금은 막대자석과 비교하는 화면이에요. <b>코일로 돌아가기</b>를 누른 뒤 전류 조건을 바꿔 보세요.";
const SPOTS: [number, number][] = [[76, 112], [270, 112], [173, 50], [173, 172], [104, 58], [258, 164]];

export const coilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 5, api, tall: true });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let on = false;
  let magnet = false; // 코일 자리에 막대자석을 놓아 견주는 중
  let showField = false; // 코일·막대자석 주위 자기장 선 보이기
  let guessed = false; // 전류의 방향을 바꾸기 전에 예측을 했는지
  let asking = false;
  let dir: 1 | -1 = 1; // 코일 속 자기장이 오른쪽을 향하는 전류 방향이 1
  let strong = false;
  let ready = false;
  let finished = false;
  const placed = SPOTS.map(() => false);
  const ang = SPOTS.map(() => -Math.PI / 2);
  const seen = { on: false, flip: false, power: false, mag: false };
  const n = (): number => placed.filter(Boolean).length;

  const sw = bvBtn("main", "스위치 닫기");
  const flip = bvBtn("", "전류 방향 바꾸기");
  const power = xSegs(
    [
      { k: "weak", t: "약한 전류" },
      { k: "strong", t: "센 전류" },
    ],
    "weak",
    (k) => {
      strong = k === "strong";
      if (on && n() >= 3) {
        seen.power = true;
        f.say(strong ? "전류를 세게 하자 나침반 바늘이 코일 자기장 방향으로 <b>더 크게</b> 돌아가요! 코일 주위의 자기장이 세졌기 때문이에요." : "전류를 약하게 하자 코일의 자기장이 약해져 나침반 바늘이 원래의 <b>북쪽 방향 쪽으로</b> 되돌아와요.");
      } else need();
      after();
    },
    () => {
      if (!magnet) return true;
      f.say(MAG_BUSY);
      return false;
    },
  );
  const cmp = bvBtn("", "막대자석 비교");
  const fieldBtn = bvBtn("", "자기장 선 보기");
  const noteTip = xCap("<b>더 알아보기</b> 약한 전류는 지구 자기장(북) 영향으로 살짝 기울고, <b>센 전류</b>일 때 막대자석과 똑같이 수평이 돼요.");
  f.slot.setControls(xRow(sw, flip), power.el, xRow(cmp, fieldBtn), noteTip);

  function need(): void {
    if (n() < 3) f.say("먼저 무대의 점선 원을 눌러 <b>나침반을 세 개 이상</b> 놓아 보세요.");
    else if (!on) f.say("아직 스위치가 열려 있어 나침반 바늘이 모두 <b>북쪽</b>만 가리키고 있어요. <b>스위치 닫기</b>를 눌러 전류를 흘려 보세요.");
  }
  function after(): void {
    f.pips((seen.on ? 1 : 0) + (seen.flip ? 1 : 0) + (seen.power ? 1 : 0) + (seen.mag ? 1 : 0));
    if (seen.on && seen.flip && seen.power && seen.mag && !magnet && !ready && !finished) {
      ready = true;
      sw.classList.add("main");
      sw.textContent = "확인 문제 풀기";
      f.say("전류 방향·세기·막대자석 비교를 모두 마쳤어요! 자기장 선도 살펴본 뒤 <b>확인 문제 풀기</b>를 눌러 보세요.");
    }
  }
  fieldBtn.addEventListener("click", () => {
    if (finished || asking) return;
    haptic(HAPTIC.tap);
    if (!on && !magnet) {
      need();
      return;
    }
    showField = !showField;
    fieldBtn.classList.toggle("main", showField);
    fieldBtn.textContent = showField ? "자기장 선 숨기기" : "자기장 선 보기";
    if (showField) {
      f.say("<b>자기장 선</b>이 N극에서 나와 S극으로 들어가요. 각 나침반의 빨간 바늘(N극)이 자기장 선 방향과 나란한지 살펴보세요!");
    } else {
      f.say("자기장 선을 숨겼어요. 나침반 바늘만으로 자기장 방향을 읽어 보세요.");
    }
  });
  sw.addEventListener("click", () => {
    if (finished || asking) return;
    haptic(HAPTIC.tap);
    if (ready && !magnet) {
      finished = true;
      sw.disabled = true;
      flip.disabled = true;
      cmp.disabled = true;
      fieldBtn.disabled = true;
      power.lock(true);
      ask1();
      return;
    }
    if (magnet) {
      f.say(MAG_BUSY);
      return;
    }
    on = !on;
    sw.textContent = on ? "스위치 열기" : "스위치 닫기";
    if (on && n() >= 3) {
      seen.on = true;
      f.say("코일에 전류가 흐르자 나침반 바늘들이 <b>일제히 돌아갔어요</b>! 놓인 위치에 따라 바늘이 가리키는 방향이 달라요. 이제 전류의 방향과 세기도 바꿔 보세요.");
    } else if (!on) f.say("스위치를 열어 전류를 끊자 코일의 자기장이 사라져 바늘들이 모두 <b>북쪽</b>으로 돌아왔어요.");
    else need();
    after();
  });
  const doFlip = (): void => {
    dir = dir === 1 ? -1 : 1;
    if (on && n() >= 3) {
      seen.flip = true;
      f.say("코일에 흐르는 전류의 방향을 반대로 바꾸자 나침반 바늘도 <b>정반대 방향</b>으로 돌아갔어요!");
    } else need();
    after();
  };
  flip.addEventListener("click", () => {
    if (finished || asking) return;
    haptic(HAPTIC.tap);
    if (magnet) {
      f.say(MAG_BUSY);
      return;
    }
    if (on && n() >= 3 && !guessed) {
      // 처음 바꾸기 전에 예측부터
      asking = true;
      f.slot.ask(
        "코일에 흐르는 전류의 방향을 반대로 바꾸면 나침반 바늘은 어떻게 될까요?",
        [{ t: "지금과 반대 방향으로 돌아가요", ok: true }, { t: "방향이 바뀌지 않고 그대로 있어요" }, { t: "모두 북쪽을 가리키며 멈춰요" }],
        () => undefined,
        {
          predict: true,
          onNext: () => {
            guessed = true;
            asking = false;
            f.slot.showControls();
            doFlip();
          },
        },
      );
      return;
    }
    doFlip();
  });
  cmp.addEventListener("click", () => {
    if (finished || asking) return;
    haptic(HAPTIC.tap);
    if (!magnet && !(on && n() >= 3)) {
      need();
      return;
    }
    magnet = !magnet;
    cmp.textContent = magnet ? "코일로 돌아가기" : "막대자석 비교";
    if (magnet) {
      seen.mag = true;
      f.say("코일 자리에 막대자석을 놓아도 주위 나침반 바늘들이 <b>똑같은 방향</b>을 가리켜요! 즉, 전류가 흐르는 코일은 막대자석과 같은 자기장을 만들어요.");
    } else if (!strong) {
      f.say("약한 전류에서는 지구 자기장(북) 영향이 남아 살짝 기울어요. <b>센 전류</b>로 바꾸면 막대자석처럼 완전히 수평으로 정렬해요.");
    } else {
      f.say("전류가 흐르는 코일은 <b>막대자석처럼</b> 한쪽 끝이 N극, 반대쪽 끝이 S극이 돼요.");
    }
    after();
  });
  st.cv.addEventListener("pointerdown", (e) => {
    if (finished || asking) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const i = SPOTS.findIndex(([x, y]) => Math.hypot(p.x / k - x, p.y / k - y) < 26);
    if (i < 0) return;
    haptic(HAPTIC.tap);
    placed[i] = !placed[i];
    if (on && n() >= 3 && !seen.on) {
      seen.on = true;
      f.say("코일에 전류가 흐르자 나침반 바늘들이 <b>일제히 돌아갔어요</b>! 놓인 위치에 따라 바늘이 가리키는 방향이 달라요. 이제 전류의 방향과 세기도 바꿔 보세요.");
      after();
    } else if (n() < 3) f.say(`나침반 <b>${n()}개</b>를 놓았어요. 세 개 이상 놓고 스위치를 닫아 보세요.`);
    else if (!on) need();
  });

  function ask1(): void {
    f.slot.ask(
      "코일에 흐르는 전류의 방향을 반대로 바꾸었을 때 나침반 바늘은 어떻게 되었나요?",
      [{ t: "반대 방향으로 돌아갔어요", ok: true }, { t: "그대로였어요" }, { t: "북쪽만 가리켰어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "전류의 방향이 바뀌면 <b>자기장의 방향</b>도 반대가 돼요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "코일에 흐르는 전류를 세게 했을 때 코일 주위의 자기장은 어떻게 변했나요?",
      [{ t: "더 세졌어요", ok: true }, { t: "더 약해졌어요" }, { t: "변하지 않았어요" }],
      () => undefined,
      { why: "자기장이 셀수록 바늘이 북쪽에서 <b>더 많이</b> 돌아가요.", onNext: ask3 },
    );
  }
  function ask3(): void {
    f.slot.ask(
      "전류가 흐르는 코일에서 자기장이 나오는 쪽 끝은 막대자석의 어느 극에 해당하나요?",
      [{ t: "N극", ok: true }, { t: "S극" }, { t: "어느 극에도 해당하지 않아요" }],
      () => undefined,
      { why: "자석 밖의 자기장은 <b>N극</b>에서 나와 S극으로 들어가요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(5);
    f.say("전류가 흐르는 코일 주위에 막대자석과 같은 모양의 자기장이 생긴다는 것을 확인했어요!");
    f.slot.conclude("전류가 흐르는 코일 주위에는 <b>막대자석 주위와 같은 모양의 자기장</b>이 생겨요. 전류의 방향이 바뀌면 자기장의 방향도 반대가 되고, 전류의 세기가 셀수록 자기장도 세져요.");
    api.enableCTA(s.cta ?? "다음");
  }

  /** 유한 길이 막대자석/코일의 두 극(N, S)이 만드는 순수 자기장 벡터. */
  const poleField = (x: number, y: number): [number, number] => {
    const nx = C.x + dir * 38;
    const sx = C.x - dir * 38;
    const ny = C.y;
    const add = (px: number, py: number, sign: number): [number, number] => {
      const dx = (x - px) / 55;
      const dy = (y - py) / 55;
      const r2 = Math.max(0.22, dx * dx + dy * dy);
      const r3 = r2 * Math.sqrt(r2);
      return [(sign * dx) / r3, (sign * dy) / r3];
    };
    const [bx1, by1] = add(nx, ny, 1); // N극에서 나가는 방향
    const [bx2, by2] = add(sx, ny, -1); // S극으로 들어가는 방향
    return [bx1 + bx2, by1 + by2];
  };

  const field = (x: number, y: number): [number, number] => {
    // 지구 자기장(북쪽 = 화면 위).
    // 막대자석과 센 전류는 동일한 순수 쌍극자(by = 0)로 계산해 흔히 그리는 모양처럼
    // 0.00° 차이 없이 완전히 똑같은 수평·접선 방향을 가리킨다.
    // 약한 전류는 지구 자기장(북)의 영향이 살짝 남아 ~11° 기울어져 전류 세기에 따른 차이를 보여 준다.
    let bx = 0;
    let by = magnet || (on && strong) ? 0 : on ? -0.36 : -1;
    if (magnet || on) {
      const k = magnet || strong ? 16 : 2.6;
      const [mx, my] = poleField(x, y);
      bx += mx * k;
      by += my * k;
    }
    return [bx, by];
  };

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    // 자기장 활성 시 은은한 배경 발광 오라
    if (on || magnet) {
      const aura = ctx.createRadialGradient(C.x, C.y, 12, C.x, C.y, 128);
      aura.addColorStop(0, magnet || strong ? "rgba(255,123,107,.13)" : "rgba(255,123,107,.07)");
      aura.addColorStop(1, "rgba(11,21,36,0)");
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, 346, 230);
    }
    // 전원 장치와 전선(코일의 두 끝, 왼쪽 아래와 오른쪽 아래에 잇는다)
    const ends = mCoilEnds(C.x, C.y);
    if (!magnet) {
      xBox(ctx, 12, 192, 84, 28, 8, "rgba(255,255,255,.08)", X.line);
      xText(ctx, "전원 장치", 54, 206.5, { px: 12, color: X.dim });
      ctx.fillStyle = dir === 1 ? "#E34B39" : "#3487E5";
      ctx.beginPath();
      ctx.arc(96, 200, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dir === 1 ? "#3487E5" : "#E34B39";
      ctx.beginPath();
      ctx.arc(96, 212, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = on ? "rgba(255,196,90,.75)" : "rgba(143,164,194,.7)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(96, 200);
      ctx.lineTo(ends.lx, 200);
      ctx.lineTo(ends.lx, ends.y);
      ctx.moveTo(96, 212);
      ctx.lineTo(ends.rx, 212);
      ctx.lineTo(ends.rx, ends.y);
      ctx.stroke();
    }
    if (on && !magnet) {
      const up = dir === 1;
      xArrow(ctx, ends.lx, up ? 186 : 150, ends.lx, up ? 150 : 186, X.cur, 2.4, 8);
      xText(ctx, "전류", ends.lx - 8, 168, { px: 12, color: X.cur, align: "right" });
    }
    // 자기장 선(켜져 있고 전류가 흐르거나 막대자석 비교 중일 때):
    // 나침반 바늘을 돌리는 동일한 두 극 자기장(poleField)을 적분해 그려 바늘과 자기장 선이 정확히 일치하게 한다.
    if (showField && (on || magnet)) {
      ctx.save();
      const alpha = strong || magnet ? 0.56 : 0.4;
      ctx.strokeStyle = `rgba(255,123,107,${alpha})`;
      ctx.lineWidth = strong || magnet ? 2.0 : 1.5;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -(t / 34);
      const nx = C.x + dir * 42;
      const sx = C.x - dir * 42;
      const trace = (x0: number, y0: number, signStep: number, maxSteps: number): [number, number][] => {
        const pts: [number, number][] = [[x0, y0]];
        let px = x0;
        let py = y0;
        for (let step = 0; step < maxSteps; step++) {
          const [fx, fy] = poleField(px, py);
          const mag = Math.hypot(fx, fy);
          if (mag < 1e-4) break;
          px += (fx / mag) * 4.5 * signStep;
          py += (fy / mag) * 4.5 * signStep;
          pts.push([px, py]);
          if (px < 8 || px > 338 || py < 8 || py > 222) break;
          if (Math.hypot(px - sx, py - C.y) < 16 && signStep > 0) break;
          if (Math.hypot(px - nx, py - C.y) < 16 && signStep < 0) break;
        }
        return pts;
      };
      // 위·아래 중앙을 지나는 실제 자기장 선 3겹(위/아래 나침반 50, 172와 꼭 맞게 통과)
      for (const dy of [-34, -62, -88, 34, 62, 88]) {
        const fwd = trace(C.x, C.y + dy, 1, 70);
        const bwd = trace(C.x, C.y + dy, -1, 70).reverse();
        const full = [...bwd, ...fwd.slice(1)];
        ctx.beginPath();
        full.forEach(([x, y], idx) => (idx ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      // 위·아래 중앙 자기장 방향 화살촉(N극에서 나와 S극으로 향함 = -dir 방향)
      for (const dy of [-34, -62, 34, 62]) {
        const ay = C.y + dy;
        ctx.fillStyle = `rgba(255,123,107,${Math.min(0.92, alpha + 0.3)})`;
        ctx.beginPath();
        ctx.moveTo(C.x - dir * 6, ay);
        ctx.lineTo(C.x + dir * 4, ay - 4.5);
        ctx.lineTo(C.x + dir * 4, ay + 4.5);
        ctx.closePath();
        ctx.fill();
      }
      // 양 끝 축 방향 바깥 자기장 선(좌·우 나침반 중심을 지나며 N극에서 나가고 S극으로 들어감)
      xArrow(ctx, C.x + dir * 50, C.y, C.x + dir * 134, C.y, `rgba(255,123,107,${alpha + 0.18})`, 1.9, 7);
      xArrow(ctx, C.x - dir * 134, C.y, C.x - dir * 50, C.y, `rgba(255,123,107,${alpha + 0.18})`, 1.9, 7);
      ctx.restore();
    }
    // 코일(또는 견주려고 놓은 막대자석)
    if (magnet) {
      mBar(ctx, C.x, C.y, dir === 1);
      xText(ctx, "막대자석", C.x, C.y - 34, { px: 12, color: X.dim });
    } else {
      mCoil(ctx, C.x, C.y, { cur: on, dir });
      xText(ctx, "코일", C.x, C.y - 34, { px: 12, color: X.dim });
      if (on) {
        // 코일 속 자기장의 방향. 오른손 네 손가락을 전류의 방향으로 감아 쥐면 엄지가 이 방향이다
        xArrow(ctx, C.x - dir * 34, C.y, C.x + dir * 34, C.y, X.field, 2.6, 9);
        const ph = (t / 600) % 1;
        ctx.fillStyle = "rgba(255,123,107,.5)";
        ctx.beginPath();
        ctx.arc(C.x - dir * 34 + dir * 68 * ph, C.y, 3, 0, Math.PI * 2);
        ctx.fill();
        xText(ctx, "코일 속 자기장", C.x, C.y + 35, { px: 12, color: X.field });
        if (seen.mag) {
          xText(ctx, "N극", C.x + dir * 54, C.y - 34, { px: 12, color: "#FFB3A6" });
          xText(ctx, "S극", C.x - dir * 54, C.y - 34, { px: 12, color: "#9CC8FF" });
        }
      }
    }
    // 북쪽 표시
    xArrow(ctx, 322, 40, 322, 16, "rgba(232,238,249,.6)", 2, 7);
    xText(ctx, "북", 322, 52, { px: 12, color: X.dim });
    // 나침반 자리
    SPOTS.forEach(([x, y], i) => {
      if (!placed[i]) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(232,238,249,.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }
      const [bx, by] = field(x, y);
      const goal = Math.atan2(by, bx);
      let d = goal - ang[i];
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      ang[i] += d * Math.min(1, dt * 0.08);
      mCompass(ctx, x, y, ang[i]);
    });
    // 왼쪽 위 상태 표시(약한 전류 vs 센 전류·막대자석의 자기장 세기 차이를 직관적으로 안내)
    if (magnet) {
      xText(ctx, "막대자석 자기장", 14, 20, { px: 12, color: "#FFB3A6", align: "left", w: 700 });
    } else if (on) {
      xText(
        ctx,
        strong ? "센 전류: 코일 자기장 우세" : "약한 전류: 북쪽 영향 살짝 남음",
        14,
        20,
        { px: 12, color: strong ? "#FFE08A" : X.dim, align: "left", w: 700 },
      );
    }
    xText(ctx, "빨간 끝이 N극", 284, 212, { px: 12, color: X.dim });
    ctx.restore();
  });

  f.say("코일 주위의 <b>점선 원</b>을 눌러 나침반을 놓아 보세요. 세 개 이상 놓은 뒤 <b>스위치 닫기</b>를 눌러 전류를 흘려 보세요.");
  api.setCTA("나침반을 놓고 전류를 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
