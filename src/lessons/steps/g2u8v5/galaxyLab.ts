// [중2 Ⅷ v5] g2u8l5 galaxyLab: 「태양계는 우리은하의 어디에 있을까요?」
// 책의 어디에서: 그림 '우리은하의 모양'(위에서 본 모습, 태양계는 중심에서 약 8500 pc, 지름 약 30000 pc), 그림 '은하수의 모양'(은하 중심 쪽을 볼 때 은하수가 넓고 뚜렷하다).
// 한 통찰: 태양계는 은하 중심에서 떨어진 나선팔에 있어서, 중심 쪽을 볼 때와 바깥쪽을 볼 때 은하수가 다르게 보인다.
// 학생이 정하는 것: 태양계가 있을 자리의 예측(그림을 누른다, 채점하지 않는다), 바라보는 방향.
// 실사: 위에서 본 우리은하(NASA/JPL-Caltech, 상상도), 온 하늘의 은하수(ESO). 은하수 사진은 가운데가 은하 중심 방향이라, 방향에 따라 잘라 보여 준다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sArrow, sCanvas, sCap, sDisk, sFrame, sLine, sLog, sPhoto, sSegs, starPhoto, sText, type LabStep } from "./kit";

type Dir = "in" | "out";
const IMG = 210; // 은하 그림의 한 변
const IX = 8;
const IY = 10;
const SUN: [number, number] = [0.5, 0.75]; // 그림 안에서 태양계의 자리
const R_GAL = 0.44; // 그림에서 은하 원반의 반지름(그림 폭에 대한 비율)

export const galaxyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  f.stage.appendChild(sPhoto("g2u8x-gal", "milkyway-top.webp", "위에서 본 우리은하, 가운데 막대 모양과 나선팔"));
  const view = el("div", { class: "g2u8x-mwview" });
  view.style.backgroundImage = `url(${starPhoto("milkyway-pan.webp")})`;
  f.stage.appendChild(view);
  const st = sCanvas(f.stage);
  const tm = bvTimers();
  if (import.meta.env.DEV) f.stage.dataset.img = JSON.stringify({ x: IX, y: IY, size: IMG });

  let guess: [number, number] | null = null;
  let shown = false;
  let dir: Dir | null = null;
  let finished = false;
  const log = sLog(["은하 중심 쪽", "바깥쪽"], 2, true);
  const bShow = bvBtn("main", "실제 자리 확인하기");
  bShow.disabled = true;
  f.slot.setControls(sCap("왼쪽 그림은 위에서 본 우리은하예요. <b>태양계가 있을 것 같은 곳</b>을 그림에서 눌러 보세요."), bShow);

  st.cv.addEventListener("pointerdown", (e) => {
    if (shown) return;
    const p = st.pt(e);
    const gx = (p.x - IX) / IMG;
    const gy = (p.y - IY) / IMG;
    if (Math.hypot(gx - 0.5, gy - 0.5) > 0.5) return;
    guess = [gx, gy];
    haptic(HAPTIC.tap);
    bShow.disabled = false;
    f.say("예측한 자리에 표시했어요. 다시 눌러 옮길 수 있어요. 정했으면 <b>실제 자리</b>를 확인해 보세요.");
  });
  bShow.addEventListener("click", () => {
    if (!guess) return;
    shown = true;
    haptic(HAPTIC.correct);
    f.pips(1);
    const off = Math.hypot(guess[0] - SUN[0], guess[1] - SUN[1]);
    const mid = Math.hypot(guess[0] - 0.5, guess[1] - 0.5) < 0.08;
    f.say(`${off < 0.1 ? "아주 가까웠어요! " : mid ? "한가운데가 아니에요. " : ""}태양계는 은하 중심에서 <b>약 8500 pc</b> 떨어진 <b>나선팔</b>에 있어요. 우리은하의 지름은 약 30000 pc이에요.`);
    tm.later(() => {
      f.slot.setControls(seg.el, log.el);
      f.say("태양계에서 <b>어느 쪽</b>을 바라볼지 골라 보세요. 오른쪽에 그 방향의 은하수가 보여요.");
    }, 2600);
  });
  const seg = sSegs<Dir>(
    [
      { k: "in", t: "은하 중심 쪽 보기" },
      { k: "out", t: "바깥쪽 보기" },
    ],
    null,
    (k) => {
      dir = k;
      view.classList.add("on");
      view.classList.toggle("out", k === "out");
      log.set(k === "in" ? 0 : 1, k === "in" ? "넓고 뚜렷" : "좁고 희미");
      f.pips(log.has(0) && log.has(1) ? 2 : 1);
      f.say(k === "in" ? "은하 <b>중심 쪽</b>에는 별이 아주 많아요. 은하수가 <b>넓고 뚜렷하게</b> 보여요." : "<b>바깥쪽</b>에는 별이 적어요. 은하수가 <b>좁고 희미하게</b> 보여요.");
      if (log.has(0) && log.has(1) && !finished) {
        finished = true;
        tm.later(() => {
          seg.lock(true);
          askFinal();
        }, 1800);
      }
    },
  );

  function askFinal(): void {
    f.say("그림을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "태양계는 우리은하의 어디에 있나요?",
      [{ t: "중심에서 떨어진 나선팔", ok: true }, { t: "은하의 한가운데" }, { t: "은하 원반의 바깥" }],
      (ok) => api.recordQuiz(ok),
      { why: "은하 중심에서 <b>약 8500 pc</b> 떨어진 나선팔에 있어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("탐험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("태양계는 은하 중심에서 약 8500 pc 떨어진 <b>나선팔</b>에 있어요. 그래서 별이 많은 <b>은하 중심 쪽</b>을 볼 때 은하수가 더 넓고 뚜렷해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t) => {
    const G = (p: [number, number]): [number, number] => [IX + p[0] * IMG, IY + p[1] * IMG];
    const c = G([0.5, 0.5]);
    const sun = G(SUN);
    if (guess) {
      const g = G(guess);
      sDisk(ctx, g[0], g[1], 7, "rgba(255,255,255,.2)", "#fff", 2);
      if (!shown) sText(ctx, "내 예측", g[0], g[1] - 16, { color: "#fff", px: 12 });
    }
    if (shown) {
      // 지름과 중심에서 태양계까지
      const y = IY + IMG * 0.5;
      sLine(ctx, IX + IMG * (0.5 - R_GAL), y - 54, IX + IMG * (0.5 + R_GAL), y - 54, "rgba(255,255,255,.8)", 1.4);
      sText(ctx, "지름 약 30000 pc", c[0], y - 66, { color: "#fff", px: 12 });
      sLine(ctx, c[0], c[1], sun[0], sun[1], S.ok, 2);
      sText(ctx, "약 8500 pc", c[0] + 44, (c[1] + sun[1]) / 2, { color: S.ok, px: 12, w: 800 });
      sText(ctx, "은하 중심", c[0], c[1] - 14, { color: "#fff", px: 12 });
      sDisk(ctx, sun[0], sun[1], 5 + Math.sin(t / 300) * 0.8, S.sun, "#fff", 1.6);
      sText(ctx, "태양계", sun[0] - 30, sun[1] + 4, { color: S.sun, px: 12, w: 800 });
      if (dir) {
        const sg = dir === "in" ? -1 : 1;
        sArrow(ctx, sun[0], sun[1] + sg * 9, sun[0], sun[1] + sg * 44, "#fff", 3, 10);
      }
    }
    const vx = IX + IMG + 10;
    sText(ctx, "지구에서 본 은하수", (vx + w - 8) / 2, 16, { color: S.ink, px: 12 });
    if (!dir) sText(ctx, shown ? "방향을 골라요" : "", (vx + w - 8) / 2, 70, { color: S.dim, px: 12 });
    else sText(ctx, dir === "in" ? "넓고 뚜렷해요" : "좁고 희미해요", (vx + w - 8) / 2, 126, { color: S.gold, px: 13, w: 800 });
  });

  f.say("위에서 본 우리은하예요. 가운데 <b>막대 모양</b>을 소용돌이 모양의 <b>나선팔</b>이 감싸고 있어요. 태양계는 어디에 있을까요?");
  api.setCTA("태양계의 자리를 찾아보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
