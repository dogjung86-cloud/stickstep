// [중2 Ⅷ v5] g2u8l5 galaxyLab: 「태양계는 우리은하의 어디에 있을까요?」
// 가로 3D 우리은하 관측실(rotateStage + galaxyStage3d.ts)에서
//   1) 위에서 본 막대나선 원반 위 태양계의 자리를 예측·확인(중심에서 약 8500 pc 나선팔, 전체 지름 약 30000 pc),
//   2) 위에서 본 모습(막대나선 모양)과 옆에서 본 모습(중심부가 볼록한 원반 모양)을 입체로 돌려 비교,
//   3) 태양계에서 은하 중심 방향과 바깥쪽 방향을 바라볼 때 지구 밤하늘 은하수(넓고 뚜렷 vs 좁고 희미)를 비교한다.
// WebGL을 쓸 수 없는 기기에서는 즉시 세로 요약 판정으로 안전하게 이어진다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { RotateStage } from "../../../ui/rotateStage";
import { bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sCap, sDisk, sFrame, sLine, sLog, sPhoto, starPhoto, sText, type LabStep } from "./kit";
import type { GalDir, GalView, GalaxyStage3D } from "./galaxyStage3d";

export const galaxyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 4, api, tall: true });
  const tm = bvTimers();

  // 세로 무대: 처음에는 우리은하 상상도 + 옆모습 일러스트 + [가로 화면으로 우리은하 3D 열기] 단추,
  // 가로 3D 탐구를 마치고 돌아오면 위·옆 모습과 은하수 비교 요약판을 그린다.
  const previewImg = sPhoto("g2u8x-gal", "milkyway-top.webp", "위에서 본 우리은하 상상도");
  previewImg.style.left = "10px";
  previewImg.style.top = "14px";
  previewImg.style.width = "164px";
  previewImg.style.height = "164px";
  f.stage.appendChild(previewImg);

  const mwPreview = el("div", { class: "g2u8x-mwview on" });
  mwPreview.style.backgroundImage = `url(${starPhoto("milkyway-pan.webp")})`;
  mwPreview.style.left = "184px";
  mwPreview.style.right = "10px";
  mwPreview.style.width = "auto";
  mwPreview.style.top = "30px";
  mwPreview.style.height = "64px";
  f.stage.appendChild(mwPreview);

  const st = sCanvas(f.stage);
  const enterBtn = el("button", { class: "g2u8x-enterbtn pulse", attrs: { type: "button" }, text: "가로 화면으로 우리은하 3D 열기" }) as HTMLButtonElement;
  f.stage.appendChild(enterBtn);

  const log = sLog(["태양계의 위치", "위·옆에서 본 모양", "방향별 은하수"], 1, true);
  f.slot.setControls(sCap("가로 3D 화면을 열어 우리은하를 위와 옆에서 돌려 보고 세 가지 탐구를 완료해 보세요."), log.el);

  let disposed = false;
  let rot: RotateStage | null = null;
  let loop: Loop | null = null;
  let g3d: GalaxyStage3D | null = null;

  let guessXZ: [number, number] | null = null;
  let sunRevealed = false;
  let seenSide = false;
  const seenDirs = new Set<"in" | "out">();
  let curDir: GalDir = null;
  let curView: GalView = "top";
  let asked = false;
  let doneBar: HTMLElement | null = null;

  const doneCount = (): number => Number(sunRevealed) + Number(seenSide) + Number(seenDirs.size === 2);
  const allDone = (): boolean => doneCount() === 3;

  function syncProgress(): void {
    if (sunRevealed) log.set(0, "약 8500 pc 나선팔");
    if (seenSide) log.set(1, "막대나선 · 볼록한 원반");
    if (seenDirs.size === 2) log.set(2, "중심 쪽이 넓고 뚜렷");
    f.pips(doneCount());
    host.dataset.g2u8GalDone = String(doneCount());
  }

  // 세로 무대 캔버스 오버레이(들어가기 전 안내 + 탐구 완료 후 요약)
  st.run((ctx, w, h, t) => {
    sBox(ctx, 16, 20, 50, 21, 10.5, "rgba(11,21,36,.82)", "rgba(255,255,255,.35)", 1);
    sText(ctx, "상상도", 41, 30.8, { color: "#FFE066", px: 12, w: 800 });
    sText(ctx, "지구에서 본 은하수", (184 + w - 10) / 2, 17, { color: S.ink, px: 12, w: 700 });

    if (sunRevealed) {
      // 위에서 본 우리은하 위 태양계(중심에서 아래쪽 나선팔) + 지름 표시
      const cx = 10 + 82;
      const cy = 14 + 82;
      const sx = cx;
      const sy = 14 + 164 * 0.75;
      sLine(ctx, 10 + 14, cy, 10 + 150, cy, "rgba(255,255,255,.82)", 1.4);
      sLine(ctx, cx, cy, sx, sy, S.ok, 2);
      sDisk(ctx, sx, sy, 4.5 + Math.sin(t / 280) * 0.7, S.sun, "#fff", 1.4);
      sText(ctx, "태양계", sx + 24, sy + 2, { color: S.sun, px: 12, w: 800 });
      sText(ctx, "약 8500 pc", cx + 34, (cy + sy) / 2 - 4, { color: S.ok, px: 12, w: 800 });
    }

    // 오른쪽 아래 칸: 옆에서 본 우리은하 단면 모식도(중심부가 볼록한 원반)
    const bx = 184;
    const bw = w - 10 - bx;
    const by = 104;
    const bh = 68;
    sBox(ctx, bx, by, bw, bh, 10, "rgba(14,25,48,.85)", "rgba(145,175,235,.32)", 1);
    sText(ctx, "옆에서 본 모습", bx + bw / 2, by + 15, { color: "#DCE7FB", px: 12, w: 800 });
    const mcx = bx + bw / 2;
    const mcy = by + 43;
    // 원반과 볼록한 중심부
    ctx.save();
    const dg = ctx.createRadialGradient(mcx, mcy, 2, mcx, mcy, bw * 0.42);
    dg.addColorStop(0, "#FFF0B8");
    dg.addColorStop(0.32, "rgba(255,214,120,.82)");
    dg.addColorStop(1, "rgba(130,175,255,0)");
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.ellipse(mcx, mcy, bw * 0.42, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(mcx, mcy, 15, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (sunRevealed) {
      sDisk(ctx, mcx + bw * 0.22, mcy, 3.4, S.sun, "#fff", 1.1);
    }
    sText(ctx, "중심부가 볼록한 원반", mcx, by + bh - 8, { color: S.gold, px: 12, w: 700 });
    void h;
  });

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({
      title: "우리은하 3D 탐사 (끌어서 기울이기)",
      onLeave: () => leave(),
    });

    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;

    const btnTop = el("button", { class: "g2u8x-gal3d-tab on", attrs: { type: "button", "data-v": "top" }, text: "위에서 보기" }) as HTMLButtonElement;
    const btnSide = el("button", { class: "g2u8x-gal3d-tab", attrs: { type: "button", "data-v": "side" }, text: "옆에서 보기" }) as HTMLButtonElement;
    const tabs = el("div", { class: "g2u8x-gal3d-tabs" }, btnTop, btnSide);

    const guideTxt = el("span", { html: "원반 위에서 <b>태양계가 있을 자리</b>를 눌러 예측해 보세요." });
    const badge = el("div", { class: "g2u8x-gal3d-badge" }, el("i", { text: "상상도" }), guideTxt);

    const mwTitle = el("div", { class: "g2u8x-gal3d-mw-t", text: "지구에서 본 은하수" });
    const mwImg = el("div", { class: "g2u8x-gal3d-mw-img" });
    mwImg.style.backgroundImage = `url(${starPhoto("milkyway-pan.webp")})`;
    const mwSub = el("div", { class: "g2u8x-gal3d-mw-s", text: "태양계 위치를 먼저 찾아요" });
    const mwCard = el("div", { class: "g2u8x-gal3d-mw", attrs: { "aria-hidden": "true" } }, mwTitle, mwImg, mwSub);

    const lblGuess = el("div", { class: "g2u8x-gal3d-lbl guess", text: "내 예측" });
    const lblCenter = el("div", { class: "g2u8x-gal3d-lbl", text: "은하 중심" });
    const lblSun = el("div", { class: "g2u8x-gal3d-lbl sun", text: "태양계" });
    const lblDist = el("div", { class: "g2u8x-gal3d-lbl ok", text: "약 8500 pc" });
    const lblDiam = el("div", { class: "g2u8x-gal3d-lbl", text: "지름 약 30000 pc" });
    const labelsLayer = el("div", { class: "g2u8x-gal3d-labels", attrs: { "aria-hidden": "true" } }, lblGuess, lblCenter, lblSun, lblDist, lblDiam);

    const btnReveal = el("button", { class: "g2u8x-gal3d-btn primary", attrs: { type: "button", "data-k": "reveal" }, text: "실제 태양계 위치 확인하기" }) as HTMLButtonElement;
    btnReveal.disabled = !guessXZ;
    const btnIn = el("button", { class: "g2u8x-gal3d-btn", attrs: { type: "button", "data-k": "in" }, text: "은하 중심 방향 보기" }) as HTMLButtonElement;
    const btnOut = el("button", { class: "g2u8x-gal3d-btn", attrs: { type: "button", "data-k": "out" }, text: "은하 바깥쪽 방향 보기" }) as HTMLButtonElement;
    const dock = el("div", { class: "g2u8x-gal3d-dock" }, btnReveal, btnIn, btnOut);

    rot.stage.append(canvas, tabs, badge, mwCard, labelsLayer, dock);

    const mod = await import("./galaxyStage3d");
    if (disposed || !rot) return;
    g3d = mod.createGalaxyStage3D(canvas);
    if (!g3d) {
      sunRevealed = true;
      seenSide = true;
      seenDirs.add("in");
      seenDirs.add("out");
      syncProgress();
      asked = true;
      api.recordQuiz(true);
      rot.leave();
      finish();
      f.say("이 기기에서는 3D 화면을 열 수 없어 핵심 내용으로 바로 정리할게요.");
      return;
    }

    const syncHud = (): void => {
      btnTop.classList.toggle("on", curView === "top");
      btnSide.classList.toggle("on", curView === "side");
      btnSide.classList.toggle("pulse", sunRevealed && !seenSide);
      btnReveal.style.display = sunRevealed ? "none" : "";
      btnReveal.disabled = !guessXZ;
      btnIn.style.display = sunRevealed ? "" : "none";
      btnOut.style.display = sunRevealed ? "" : "none";
      btnIn.classList.toggle("on", curDir === "in");
      btnOut.classList.toggle("on", curDir === "out");

      if (curDir) {
        mwImg.classList.add("on");
        mwImg.classList.toggle("out", curDir === "out");
        mwSub.textContent = curDir === "in" ? "중심 방향: 넓고 뚜렷해요" : "바깥쪽 방향: 좁고 희미해요";
      } else {
        mwImg.classList.toggle("on", false);
        mwSub.textContent = sunRevealed ? "아래에서 시선 방향을 골라요" : "태양계 위치를 먼저 찾아요";
      }

      if (!sunRevealed) {
        guideTxt.innerHTML = guessXZ
          ? "예측 표시 완료! 아래 <b>실제 태양계 위치 확인하기</b>를 눌러 보세요."
          : "원반 위에서 <b>태양계가 있을 자리</b>를 눌러 예측해 보세요.";
      } else if (!seenSide) {
        guideTxt.innerHTML = "태양계는 중심에서 <b>약 8500 pc</b> 떨어진 나선팔에 있어요! 왼쪽 위 <b>옆에서 보기</b>도 눌러 보세요.";
      } else if (seenDirs.size < 2) {
        guideTxt.innerHTML = curDir === "in"
          ? "중심 방향은 별이 겹쳐 <b>은하수가 넓고 뚜렷해요</b>! <b>바깥쪽 방향</b>도 눌러 비교해 보세요."
          : curDir === "out"
            ? "바깥쪽 방향은 별이 적어 <b>은하수가 좁고 희미해요</b>! <b>은하 중심 방향</b>도 눌러 보세요."
            : "중심부가 볼록한 원반 모양이에요! 아래 버튼으로 <b>두 시선 방향의 은하수</b>를 비교해 보세요.";
      } else {
        guideTxt.innerHTML = "우리은하의 모양, 태양계의 위치, 방향별 은하수까지 모두 확인했어요!";
      }

      if (allDone() && rot && !doneBar) {
        dock.classList.add("hide");
        const back = el("button", { class: "g2u8x-rotdone-btn", attrs: { type: "button" }, text: "돌아가서 정리하기" });
        back.addEventListener("click", () => rot?.leave());
        doneBar = el("div", { class: "g2u8x-rotdone" }, el("span", { text: "세 가지 탐구를 모두 완료했어요!" }), back);
        rot.stage.appendChild(doneBar);
      }
    };

    const applyView = (v: GalView): void => {
      curView = v;
      g3d?.setView(v);
      if (v === "side" && sunRevealed && !seenSide) {
        seenSide = true;
        haptic(HAPTIC.ctaUnlock);
        syncProgress();
      }
      syncHud();
    };

    if (guessXZ) g3d.setGuess(guessXZ[0], guessXZ[1]);
    g3d.revealSun(sunRevealed);
    g3d.setDir(curDir);
    g3d.setView(curView);
    syncHud();

    btnTop.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      applyView("top");
    });
    btnSide.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      applyView("side");
    });

    btnReveal.addEventListener("click", () => {
      if (!guessXZ || sunRevealed) return;
      sunRevealed = true;
      haptic(HAPTIC.correct);
      g3d?.revealSun(true);
      if (curView === "side") seenSide = true;
      syncProgress();
      syncHud();
    });

    const pickDir = (d: "in" | "out"): void => {
      curDir = d;
      seenDirs.add(d);
      haptic(HAPTIC.tap);
      g3d?.setDir(d);
      mwPreview.classList.toggle("out", d === "out");
      syncProgress();
      syncHud();
    };
    btnIn.addEventListener("click", () => pickDir("in"));
    btnOut.addEventListener("click", () => pickDir("out"));

    // 포인터 조작: 끌면 3D 카메라 기울기 회전, 짧게 누르면(확인 전) 원반 위 태양계 위치 예측
    let pid = -1;
    let sx = 0;
    let sy = 0;
    let lx = 0;
    let ly = 0;
    let dragged = false;
    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      pid = e.pointerId;
      const p = rot.mapPoint(e);
      sx = lx = p.x;
      sy = ly = p.y;
      dragged = false;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pid || !rot || !g3d) return;
      const p = rot.mapPoint(e);
      if (Math.hypot(p.x - sx, p.y - sy) > 8) dragged = true;
      if (dragged) {
        const { w, h } = rot.size();
        const snapped = g3d.nudgeOrbit(-((p.x - lx) / Math.max(1, w)) * 3.0, ((p.y - ly) / Math.max(1, h)) * 2.4);
        if (snapped && snapped !== curView) {
          curView = snapped;
          if (snapped === "side" && sunRevealed && !seenSide) {
            seenSide = true;
            haptic(HAPTIC.ctaUnlock);
            syncProgress();
          }
          syncHud();
        }
      }
      lx = p.x;
      ly = p.y;
    });
    const up = (e: PointerEvent): void => {
      if (e.pointerId !== pid || !rot || !g3d) return;
      pid = -1;
      if (!dragged && !sunRevealed && e.type === "pointerup") {
        const { w, h } = rot.size();
        const p = rot.mapPoint(e);
        const hit = g3d.pickDisc((p.x / w) * 2 - 1, -((p.y / h) * 2 - 1));
        if (hit) {
          guessXZ = hit;
          g3d.setGuess(hit[0], hit[1]);
          haptic(HAPTIC.tap);
          syncHud();
        }
      }
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    // 개발·검사용 직접 제어 훅
    if (import.meta.env.DEV) {
      (host as unknown as { __galDev?: Record<string, unknown> }).__galDev = {
        guess: (x = -2.2, z = 4.5) => {
          guessXZ = [x, z];
          g3d?.setGuess(x, z);
          syncHud();
        },
      };
    }

    loop = createLoop((dt, tMs) => {
      if (!rot || !g3d) return;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      g3d.resize(w, h);
      g3d.step(dt, tMs);

      const pin = (elLbl: HTMLElement, show: boolean, x: number, y: number, z: number, dy = 0): void => {
        elLbl.classList.toggle("on", show);
        if (!show) return;
        const pr = g3d!.project(x, y, z, w, h);
        elLbl.style.transform = `translate(-50%, -50%) translate(${pr.x.toFixed(1)}px, ${(pr.y + dy).toFixed(1)}px)`;
      };
      pin(lblGuess, !!guessXZ && !sunRevealed, guessXZ?.[0] ?? 0, 0.2, guessXZ?.[1] ?? 0, -18);
      pin(lblCenter, sunRevealed, 0, curView === "side" ? 1.55 : 0.2, 0, -16);
      pin(lblSun, sunRevealed, 0, 0.2, mod.SUN_Z, 20);
      pin(lblDist, sunRevealed && curView === "top", 2.4, 0.2, mod.SUN_Z * 0.5, 0);
      pin(lblDiam, sunRevealed, curView === "side" ? -mod.GAL_R * 0.52 : -mod.GAL_R * 0.48, curView === "side" ? -1.15 : 0.2, curView === "side" ? 0 : -1.2, 16);
    });
    loop.start();
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    g3d?.dispose();
    g3d = null;
    rot?.dispose();
    rot = null;
    doneBar = null;
    enterBtn.classList.remove("pulse");
    if (allDone()) {
      enterBtn.textContent = "우리은하 3D 다시 보기";
      if (!asked) {
        asked = true;
        askFinal();
      }
    } else {
      enterBtn.textContent = "가로 화면 다시 열기";
      f.say("아직 완료하지 않은 탐구가 남아 있어요. 가로 3D 화면을 열어 세 가지를 모두 확인해 보세요.");
    }
  }

  function askFinal(): void {
    f.say("우리은하를 위와 옆에서 입체로 살펴보고, 방향에 따른 은하수 모습까지 모두 비교했어요!");
    f.slot.ask(
      "태양계는 우리은하의 어디에 위치해 있나요?",
      [{ t: "은하 중심에서 떨어진 나선팔", ok: true }, { t: "우리은하의 정중앙(중심부)" }, { t: "우리은하 원반 바깥의 빈 공간" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "태양계는 우리은하 중심에서 <b>약 8500 pc</b> 떨어진 나선팔에 자리 잡고 있어요.",
        onNext: () => {
          f.say("이번에는 옆에서 본 모양과 은하수가 뚜렷하게 보이는 방향을 확인해 봐요.");
          f.slot.ask(
            "우리은하를 옆에서 본 모양과 은하수가 가장 넓고 뚜렷하게 보이는 방향은?",
            [{ t: "중심부가 볼록한 원반, 은하 중심 방향", ok: true }, { t: "완전한 공 모양, 은하 바깥쪽 방향" }, { t: "중심부가 오목한 원반, 은하 바깥쪽 방향" }],
            (ok) => api.recordQuiz(ok),
            {
              why: "옆에서 보면 <b>중심부가 볼록한 원반</b> 모양이고, 별이 많이 모여 있는 <b>은하 중심 방향</b>을 볼 때 은하수가 넓고 뚜렷해요.",
              onNext: finish,
            },
          );
        },
      },
    );
  }

  function finish(): void {
    f.pips(4);
    f.say("위에서 보면 막대나선 모양, 옆에서 보면 중심부가 볼록한 원반 모양인 우리은하의 구조를 완성했어요!");
    f.slot.conclude("우리은하는 위에서 보면 <b>막대나선</b> 모양, 옆에서 보면 <b>중심부가 볼록한 원반</b> 모양이에요. 태양계는 중심에서 약 8500 pc 떨어진 <b>나선팔</b>에 있어 중심 쪽 은하수가 넓고 뚜렷해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  enterBtn.addEventListener("click", () => void enter());
  f.say("가로 3D 화면을 열어 우리은하를 위와 옆에서 돌려 보고, <b>태양계의 위치</b>와 <b>은하수</b>를 탐구해 보세요.");
  api.setCTA("가로 3D 화면에서 세 가지 탐구를 완료해 보세요", { enabled: false });
  return () => {
    disposed = true;
    tm.clear();
    loop?.stop();
    g3d?.dispose();
    rot?.dispose();
    st.stop();
  };
};
