// dataGraph — 자료 해석. 데이터 표를 보여주고, 꺾은선 그래프를 그려 규칙을 드러낸다.
// 탐구 단원의 "자료 해석하기" 단계에 사용.

import { el, clamp, afterPaint } from "../../core/dom";
import { createLoop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { renderBlocks, type Block } from "../../ui/blocks";
import type { StepRenderer } from "../types";

interface Series { name: string; color: string; points: number[]; }
interface DataGraphStep {
  title: string;
  lead?: string;
  xLabel: string;
  yLabel: string;
  xTicks: string[];
  yMin: number;
  yMax: number;
  yStep: number;
  series: Series[];
  showTable?: boolean;
  blocks?: Block[];
  cta?: string;
}

export const dataGraph: StepRenderer = (host, step, api) => {
  const s = step as unknown as DataGraphStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // 데이터 표
  if (s.showTable !== false) {
    const grid = `grid-template-columns:1.3fr ${s.series.map(() => "1fr").join(" ")}`;
    const tbl = el("div", { class: "tbl", style: "margin-top:18px" });
    const head = el("div", { class: "trow thead", style: grid }, el("div", { text: s.xLabel }));
    for (const se of s.series) head.appendChild(el("div", { html: se.name }));
    tbl.appendChild(head);
    s.xTicks.forEach((tick, r) => {
      const row = el("div", { class: "trow", style: grid }, el("div", { class: "tstate", text: tick }));
      for (const se of s.series) row.appendChild(el("div", { class: "tv keep", text: String(se.points[r]) }));
      tbl.appendChild(row);
    });
    host.appendChild(tbl);
  }

  // 그래프 캔버스
  const legend = el("div", { class: "chart-legend" });
  for (const se of s.series) {
    legend.appendChild(
      el("div", { class: "chart-leg" }, el("i", { style: `background:${se.color}` }), el("span", { text: se.name })),
    );
  }
  const canvas = el("canvas", { class: "chart-canvas", style: "height:230px" });
  const stage = el("div", { class: "chart-stage" }, canvas, legend);
  host.appendChild(stage);

  if (s.blocks) renderBlocks(host, s.blocks);
  api.setCTA(s.cta ?? "그래프가 그려지는 걸 보세요", { enabled: false });

  afterPaint(() => {
    const { ctx, w, h } = fitCanvas(canvas, 230);
    const padL = 40, padR = 14, padT = 14, padB = 30;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const n = s.xTicks.length;
    const xAt = (i: number) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const yAt = (v: number) => padT + plotH - ((v - s.yMin) / (s.yMax - s.yMin)) * plotH;

    let t0 = performance.now();
    const DUR = 1150;
    const loop = createLoop((_dt, t) => {
      const p = clamp((t - t0) / DUR, 0, 1);
      draw(p);
      if (p >= 1) {
        loop.stop();
        api.enableCTA("다음");
      }
    });
    // t0 기준을 루프 시작 시점으로
    t0 = performance.now();
    loop.start();

    function draw(p: number): void {
      ctx.clearRect(0, 0, w, h);
      // 그리드 + y 눈금
      ctx.strokeStyle = "rgba(255,255,255,.10)";
      ctx.fillStyle = "#8CA2C0";
      ctx.font = "600 11px Pretendard, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let v = s.yMin; v <= s.yMax + 0.001; v += s.yStep) {
        const y = yAt(v);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.fillText(String(v), padL - 8, y);
      }
      // x 눈금
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      s.xTicks.forEach((tick, i) => ctx.fillText(tick, xAt(i), h - padB + 8));

      // 시리즈 라인(왼→오 진행)
      for (const se of s.series) {
        ctx.strokeStyle = se.color;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.beginPath();
        const drawn = p * (n - 1);
        for (let i = 0; i < n; i++) {
          if (i > drawn) {
            // 부분 세그먼트 보간
            const prev = i - 1;
            if (prev >= 0 && drawn > prev) {
              const f = drawn - prev;
              const x = xAt(prev) + (xAt(i) - xAt(prev)) * f;
              const y = yAt(se.points[prev]) + (yAt(se.points[i]) - yAt(se.points[prev])) * f;
              ctx.lineTo(x, y);
            }
            break;
          }
          const x = xAt(i), y = yAt(se.points[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // 점
        for (let i = 0; i < n && i <= drawn + 0.001; i++) {
          ctx.fillStyle = se.color;
          ctx.beginPath();
          ctx.arc(xAt(i), yAt(se.points[i]), 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  });
};
