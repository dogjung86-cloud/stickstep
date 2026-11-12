// [중2 Ⅶ v5] g2u7l7 coilLab: 「코일에 전류가 흐르면 나침반은 어디를 가리킬까요?」
// 책의 어디에서: 탐구 '전류가 흐르는 코일 주위의 자기장 관찰하기'(코일 주위에 나침반을 놓고 스위치를 닫아 N극이 가리키는 방향을 보고,
//   전류의 방향만 반대로 바꿔 보고, 전류의 세기를 바꿔 본다).
// 한 통찰: 전류가 흐르는 코일 주위에는 자기장이 생긴다. 전류의 방향을 바꾸면 자기장의 방향이 반대가 되고, 전류가 세면 자기장도 세다.
// 학생이 정하는 것: 나침반을 어디에 몇 개 놓을지, 스위치, 전류의 방향, 전류의 세기(차례는 자유).
// 실패하는 길: 나침반을 놓지 않으면 아무것도 볼 수 없다. 스위치를 열어 두면 모든 바늘이 북쪽만 가리킨다.
// 옛 랩(coilFieldLab)은 정해진 자리의 나침반을 보기만 했다. 여기서는 학생이 고른 자리마다 자기장을 계산해 바늘을 돌린다.
// 바늘의 방향: 지구 자기장(화면 위쪽이 북쪽)과 코일의 자기장(막대자석과 같은 꼴로 계산)을 더한 방향이다. 약한 전류에서는 바늘이 조금만 돌아간다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xRow, xSegs, xText, type LabStep } from "./kit";

const C = { x: 173, y: 112 };
const SPOTS: [number, number][] = [[76, 112], [270, 112], [173, 50], [173, 172], [104, 58], [258, 164]];

export const coilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let on = false;
  let dir: 1 | -1 = 1; // 코일 속 자기장이 오른쪽을 향하는 전류 방향이 1
  let strong = false;
  let finished = false;
  const placed = SPOTS.map(() => false);
  const ang = SPOTS.map(() => -Math.PI / 2);
  const seen = { on: false, flip: false, power: false };
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
        f.say(strong ? "전류를 세게 하자 바늘이 <b>더 많이</b> 돌아가요. 코일의 자기장이 세졌어요." : "전류를 약하게 하자 바늘이 <b>북쪽에 가깝게</b> 돌아와요.");
      } else need();
      after();
    },
  );
  f.slot.setControls(xRow(sw, flip), power.el);

  function need(): void {
    if (n() < 3) f.say("점선 자리를 눌러 <b>나침반을 세 개 이상</b> 놓아야 자기장을 볼 수 있어요.");
    else if (!on) f.say("스위치가 열려 있어 바늘이 모두 <b>북쪽</b>만 가리켜요. 스위치를 닫아 보세요.");
  }
  function after(): void {
    f.pips((seen.on ? 1 : 0) + (seen.flip ? 1 : 0) + (seen.power ? 1 : 0));
    if (seen.on && seen.flip && seen.power && !finished) {
      finished = true;
      sw.disabled = true;
      flip.disabled = true;
      power.lock(true);
      tm.later(ask1, 2800);
    }
  }
  sw.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    on = !on;
    sw.textContent = on ? "스위치 열기" : "스위치 닫기";
    if (on && n() >= 3) {
      seen.on = true;
      f.say("바늘이 <b>돌아갔어요</b>. 자리마다 가리키는 방향이 달라요. 전류의 방향과 세기도 바꿔 보세요.");
    } else if (!on) f.say("전류가 끊기자 바늘이 모두 <b>북쪽</b>으로 돌아왔어요.");
    else need();
    after();
  });
  flip.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    dir = dir === 1 ? -1 : 1;
    if (on && n() >= 3) {
      seen.flip = true;
      f.say("코일의 전류 화살표가 뒤집히자 바늘도 <b>반대쪽으로</b> 돌아가요.");
    } else need();
    after();
  });
  st.cv.addEventListener("pointerdown", (e) => {
    if (finished) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const i = SPOTS.findIndex(([x, y]) => Math.hypot(p.x / k - x, p.y / k - y) < 26);
    if (i < 0) return;
    haptic(HAPTIC.tap);
    placed[i] = !placed[i];
    if (on && n() >= 3 && !seen.on) {
      seen.on = true;
      f.say("바늘이 <b>돌아갔어요</b>. 자리마다 가리키는 방향이 달라요. 전류의 방향과 세기도 바꿔 보세요.");
      after();
    } else if (n() < 3) f.say(`나침반 <b>${n()}개</b>를 놓았어요. 세 개 이상 놓고 스위치를 닫아 보세요.`);
    else if (!on) need();
  });

  function ask1(): void {
    f.slot.ask(
      "전류의 방향을 바꾸자 코일 끝에 놓은 나침반 바늘은?",
      [{ t: "반대쪽으로 돌아갔어요", ok: true }, { t: "그대로였어요" }, { t: "북쪽만 가리켰어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "전류의 방향이 바뀌면 <b>자기장의 방향</b>도 반대가 돼요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "전류를 세게 하자 바늘이 더 많이 돌아갔어요. 코일 주위의 자기장은?",
      [{ t: "세졌어요", ok: true }, { t: "약해졌어요" }, { t: "변하지 않았어요" }],
      () => undefined,
      { why: "자기장이 셀수록 바늘이 북쪽에서 <b>더 많이</b> 돌아가요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("코일에 전류가 흐르면 그 주위에 <b>자기장</b>이 생겨요. 전류의 방향을 바꾸면 자기장의 방향도 반대가 되고, 전류가 셀수록 자기장도 세져요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const field = (x: number, y: number): [number, number] => {
    // 지구 자기장(북쪽 = 화면 위)
    let bx = 0;
    let by = -1;
    if (on) {
      const m = dir * (strong ? 10 : 2.2);
      const rx = (x - C.x) / 60;
      const ry = (y - C.y) / 60;
      const r = Math.hypot(rx, ry);
      const dot = (m * rx) / r;
      bx += (3 * dot * (rx / r) - m) / r ** 3;
      by += (3 * dot * (ry / r)) / r ** 3;
    }
    return [bx, by];
  };

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    // 전원 장치와 전선
    xBox(ctx, 12, 192, 84, 28, 8, "rgba(255,255,255,.07)", X.line);
    xText(ctx, "전원 장치", 54, 206.5, { px: 12, color: X.dim });
    ctx.strokeStyle = on ? "rgba(255,196,90,.75)" : "rgba(143,164,194,.7)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(96, 200);
    ctx.lineTo(120, 200);
    ctx.lineTo(120, C.y);
    ctx.moveTo(96, 212);
    ctx.lineTo(226, 212);
    ctx.lineTo(226, C.y);
    ctx.stroke();
    if (on) {
      const up = dir === 1;
      xArrow(ctx, 120, up ? 184 : 148, 120, up ? 148 : 184, X.cur, 2.4, 8);
      xText(ctx, "전류", 112, 166, { px: 12, color: X.cur, align: "right" });
    }
    // 코일
    for (let i = 0; i < 9; i++) {
      const x = 124 + i * 12.2;
      ctx.strokeStyle = "#7A4B1E";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, C.y, 7, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#D9944A";
      ctx.lineWidth = 2.6;
      ctx.stroke();
    }
    xText(ctx, "코일", C.x, C.y - 34, { px: 12, color: X.dim });
    if (on) {
      // 코일에 흐르는 전류의 방향(앞쪽에서 본 감긴 방향). 오른손 네 손가락을 이 방향으로 감아 쥐면 엄지가 코일 속 자기장의 방향이다
      for (const i of [0, 4, 8]) {
        const x = 124 + i * 12.2 + 7;
        const y0 = C.y - dir * 13;
        const y1 = C.y + dir * 13;
        xArrow(ctx, x, y0, x, y1, "#6E3F16", 5, 11);
        xArrow(ctx, x, y0, x, y1, X.cur, 2.4, 8);
      }
    }
    if (on) {
      xArrow(ctx, C.x - dir * 34, C.y, C.x + dir * 34, C.y, X.field, 2.6, 9);
      const ph = (t / 600) % 1;
      ctx.fillStyle = "rgba(255,123,107,.5)";
      ctx.beginPath();
      ctx.arc(C.x - dir * 34 + dir * 68 * ph, C.y, 3, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillStyle = "#F4F7FB";
      ctx.strokeStyle = "#5C6A82";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang[i]);
      ctx.fillStyle = "#E0503A";
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(0, -4.5);
      ctx.lineTo(0, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3D8FE8";
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(0, -4.5);
      ctx.lineTo(0, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    xText(ctx, on ? "노란 화살표: 전류" : "빨간 끝이 N극", 284, 212, { px: 12, color: on ? X.cur : X.dim });
    ctx.restore();
  });

  f.say("코일 주위의 <b>점선 자리</b>를 눌러 나침반을 놓아요. 세 개 이상 놓고 스위치를 닫아 보세요.");
  api.setCTA("나침반을 놓고 전류를 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
