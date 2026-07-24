// m1u5 v2 파일럿 40문항(교과서 준거 규격) - 정본 설계표 qa/m1u5-v2-blueprint.md의 🅟 슬롯.
// 격리 저작본: 레슨 파일 무수정, index.ts 미등록. 승인 후 슬롯 번호대로 m1u5lN.ts에 이식한다.
// 공유 파일 가드(경과): 저작 시점엔 examFiguresMath.ts가 m2u4 v2 세션 WIP라 무수정 방침 → 신작 헬퍼 6종
// (m5StarFig·m5TubeFig·m5NetConeFig·m5FrustumFig·m5CompositeFig·m5TriPrismDimFig)을 이 파일 로컬로 저작.
// m2u4 종결·푸시(6c8cf5d) 확인 후 사용자 검수 8건 중 공유 헬퍼 4건(SX rLabel·SD cyl rLabel·SD cone hLabel·
// RC 번호 크기)만 examFiguresMath.ts에 시각 소급(m2u5 관행). 신작 6종의 이식은 확대 세션 몫(blueprint §9).
// 표기: 기하 풀 mfmt 미사용(gsym·유니코드 리터럴 °·π), em대시 금지, 뺄셈은 −(U+2212), num answer만 ASCII.
// 발문 표준: 관계 조건은 문두, 수치는 그림 라벨(단위 병기), 핵심 수치 이중 제시. 각 그림은 전부 실각 렌더.
// π 규칙: num 답이 aπ 꼴이면 "aπ ...일 때 a의 값" 부품 문항(무단위 면제 문구), 식 전체 보기는 mcq.
// 각 문항 주석 = [슬롯 n] 검산 노트.
import type { ExamItem } from "../src/content/exams/types";
import { GEO, angleArc, angleOf, dot, polar, rightMark } from "../src/ui/geoKit";
import {
  m5TriAngleFig,
  m5PolyAngleFig,
  m5CirclePartsFig,
  m5CircleRatioFig,
  m5SectorXFig,
  m5RotateFig,
  m5RotateChoicesFig,
  m5SolidDimFig,
  m5LensFig,
  mExamSolidFig,
} from "../src/ui/examFiguresMath";

/* ── 신작 헬퍼(로컬) — 확대 시 examFiguresMath.ts 이식분. geoKit 프리미티브만 사용. ── */

const svg = (vb: string, aria: string, inner: string): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">${inner}</svg>`;

const seg = (a: { x: number; y: number }, b: { x: number; y: number }, dash = false, w = 2.5, color: string = GEO.ink): string =>
  `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${color}" stroke-width="${w}"${dash ? ' stroke-dasharray="6 5"' : ""} stroke-linecap="round"/>`;

const txt = (x: number, y: number, s: string, anchor = "middle", color: string = GEO.ink, size = 12): string =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${size}" font-weight="800" fill="${color}">${s}</text>`;

/** 오각별(별 모양 다각형) — 정오각별 골격에 다섯 꼭지각 라벨(실각 근사 렌더, 라벨 합 180 검산은 저작 몫).
 *  labels[i]는 위(0)부터 반시계 순서의 바깥 꼭짓점 라벨(null이면 생략). x 자리는 로즈색 강조. */
function m5StarFig(o: { labels: Array<string | null>; xAt?: number }): string {
  const cx = 150;
  const cy = 108;
  const R = 92;
  const tips = Array.from({ length: 5 }, (_, i) => polar(cx, cy, R, 90 + i * 72));
  const order = [0, 2, 4, 1, 3];
  let d = "";
  order.forEach((idx, k) => {
    d += `${k === 0 ? "M" : "L"}${tips[idx].x.toFixed(1)} ${tips[idx].y.toFixed(1)} `;
  });
  let out = `<path d="${d}Z" stroke="${GEO.ink}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`;
  o.labels.forEach((label, i) => {
    if (!label) return;
    const a = tips[i];
    const t1 = tips[(i + 2) % 5];
    const t2 = tips[(i + 3) % 5];
    let a0 = angleOf(a.x, a.y, t1.x, t1.y);
    let a1 = angleOf(a.x, a.y, t2.x, t2.y);
    if (((a1 - a0 + 360) % 360) > 180) [a0, a1] = [a1, a0];
    const color = o.xAt === i ? GEO.hlC : GEO.hlA;
    out += angleArc(a.x, a.y, 15, a0, a1, color, label, { labelR: 34, fontSize: 12.5 });
  });
  return svg("0 0 300 216", "별 모양 도형과 표시된 각 그림", out);
}

/** 가운데 구멍 뚫린 원기둥 겨냥도 — 바깥 원기둥+안쪽 구멍(윗면 테두리 실선, 안 벽·밑 테두리 점선).
 *  라벨: 바깥 반지름(오른쪽)·구멍 반지름(왼쪽)·높이. */
function m5TubeFig(o: { rLabel?: string; innerLabel?: string; hLabel?: string } = {}): string {
  const cx = 150;
  const RX = 62;
  const RY = 16;
  const rx = 26;
  const ry = 7;
  const ty = 54;
  const by = 162;
  let out = "";
  out += `<ellipse cx="${cx}" cy="${by}" rx="${RX}" ry="${RY}" stroke="${GEO.ink}" stroke-width="2.2" stroke-dasharray="6 5" fill="none"/>`;
  out += `<path d="M${cx - RX} ${by} A${RX} ${RY} 0 0 0 ${cx + RX} ${by}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
  out += seg({ x: cx - RX, y: ty }, { x: cx - RX, y: by }) + seg({ x: cx + RX, y: ty }, { x: cx + RX, y: by });
  out += `<ellipse cx="${cx}" cy="${ty}" rx="${RX}" ry="${RY}" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.5"/>`;
  out += `<ellipse cx="${cx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="#EDF2F7" stroke="${GEO.ink}" stroke-width="2.2"/>`;
  out += seg({ x: cx - rx, y: ty }, { x: cx - rx, y: by }, true, 1.8, GEO.soft) + seg({ x: cx + rx, y: ty }, { x: cx + rx, y: by }, true, 1.8, GEO.soft);
  out += `<ellipse cx="${cx}" cy="${by}" rx="${rx}" ry="${ry}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="6 5" fill="none"/>`;
  if (o.rLabel) {
    out += seg({ x: cx, y: ty }, { x: cx + RX, y: ty }, false, 2, GEO.hlC) + dot(cx, ty, GEO.hlC, 2.6);
    // 검수 2차 33번: 윗면 호와 겹치지 않게 바깥 반지름 선의 오른쪽 끝 밖으로.
    out += txt(cx + RX + 7, ty + 4, o.rLabel, "start", GEO.hlC);
  }
  if (o.innerLabel) {
    out += seg({ x: cx, y: ty }, { x: cx - rx, y: ty }, false, 2, GEO.hlB);
    // 검수 2차 33번: 구멍 반지름 선의 왼쪽(고리 면 안, 두 타원 호 사이 띠)으로.
    out += txt(cx - 44, ty + 4, o.innerLabel, "middle", GEO.hlB);
  }
  if (o.hLabel) out += txt(cx + RX + 12, (ty + by) / 2 + 4, o.hLabel, "start");
  return svg("0 0 300 202", "가운데에 구멍이 뚫린 원기둥 모양 입체도형의 겨냥도", out);
}

/** 원뿔의 전개도 — 옆면 부채꼴(중심각 실각 렌더)+밑면 원(호에 접함).
 *  검산 항등식: 중심각 = 360·(밑면 r)/(모선 l). 구하는 자리는 "x°"류 라벨. */
function m5NetConeFig(o: { deg: number; slantLabel?: string; rLabel?: string; degLabel?: string }): string {
  const A = { x: 150, y: 42 };
  const L = 88;
  const a0 = 270 - o.deg / 2;
  const a1 = 270 + o.deg / 2;
  const p0 = polar(A.x, A.y, L, a0);
  const p1 = polar(A.x, A.y, L, a1);
  const large = o.deg > 180 ? 1 : 0;
  let out = `<path d="M${A.x} ${A.y} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${L} ${L} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${GEO.hlA}" opacity=".13"/>`;
  out += `<path d="M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${L} ${L} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
  out += seg(A, p0) + seg(A, p1);
  out += dot(A.x, A.y, GEO.pt, 3);
  if (o.degLabel) out += angleArc(A.x, A.y, 20, a0, a1, GEO.hlC, o.degLabel, { labelR: 38, fontSize: 12.5 });
  if (o.slantLabel) {
    const m = polar(A.x, A.y, L * 0.55, a1);
    out += txt(m.x + 12, m.y + 2, o.slantLabel, "start");
  }
  // 밑면 원 반지름은 접선·둘레 항등식 그대로: rb = L·deg/360 (호 길이 = 밑원 둘레가 시각적으로도 성립)
  const rb = (L * o.deg) / 360;
  const bc = { x: A.x, y: A.y + L + rb };
  out += `<circle cx="${bc.x}" cy="${bc.y.toFixed(1)}" r="${rb.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.3" fill="none"/>`;
  if (o.rLabel) {
    out += seg(bc, { x: bc.x + rb, y: bc.y }, false, 2, GEO.hlB) + dot(bc.x, bc.y, GEO.hlB, 2.6);
    out += txt(bc.x + rb / 2, bc.y - 7, o.rLabel, "middle", GEO.hlB);
  }
  return svg("0 0 300 224", "원뿔의 전개도, 옆면인 부채꼴과 밑면인 원", out);
}

/** 뿔대 겨냥도 — kind "pyr"(사각뿔대)·"cone"(원뿔대). 숨은선은 겨냥도 관행(숨은 꼭짓점에 모이는 변만 점선).
 *  pyr 라벨: 윗면 한 변·아랫면 한 변·옆면(앞면) 높이(점선 수선+직각 마크). cone 라벨: 위 r·아래 R·높이. */
function m5FrustumFig(o: {
  kind: "pyr" | "cone";
  topLabel?: string;
  botLabel?: string;
  sideLabel?: string;
  topRLabel?: string;
  botRLabel?: string;
  hLabel?: string;
}): string {
  let out = "";
  if (o.kind === "pyr") {
    const F1 = { x: 70, y: 168 };
    const F2 = { x: 222, y: 168 };
    const B1 = { x: 104, y: 148 };
    const B2 = { x: 256, y: 148 };
    const T1 = { x: 118, y: 80 };
    const T2 = { x: 174, y: 80 };
    const T3 = { x: 152, y: 60 };
    const T4 = { x: 208, y: 60 };
    out += seg(F1, F2) + seg(F2, B2) + seg(B2, B1, true, 2, GEO.soft) + seg(B1, F1, true, 2, GEO.soft);
    out += seg(T1, T2) + seg(T2, T4) + seg(T4, T3) + seg(T3, T1);
    out += seg(F1, T1) + seg(F2, T2) + seg(B2, T4) + seg(B1, T3, true, 2, GEO.soft);
    if (o.sideLabel) {
      const mTop = { x: (T1.x + T2.x) / 2, y: 80 };
      const mBot = { x: (T1.x + T2.x) / 2, y: 168 };
      out += seg(mTop, mBot, true, 1.8, GEO.hlB) + rightMark(mBot.x, mBot.y, 0, 9, GEO.hlB);
      out += txt(mBot.x + 8, (mTop.y + mBot.y) / 2 + 4, o.sideLabel, "start", GEO.hlB);
    }
    // 검수 2차 36번: 윗면 왼쪽 변(T1-T3) 중점 곁(왼쪽 바깥)에 배치.
    if (o.topLabel) out += txt((T1.x + T3.x) / 2 - 7, (T1.y + T3.y) / 2 + 4, o.topLabel, "end");
    if (o.botLabel) out += txt((F1.x + F2.x) / 2, F1.y + 17, o.botLabel);
  } else {
    const cx = 150;
    const RX = 64;
    const rx = 30;
    const ty = 64;
    const by = 160;
    out += `<ellipse cx="${cx}" cy="${by}" rx="${RX}" ry="15" stroke="${GEO.ink}" stroke-width="2.2" stroke-dasharray="6 5" fill="none"/>`;
    out += `<path d="M${cx - RX} ${by} A${RX} 15 0 0 0 ${cx + RX} ${by}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
    out += `<ellipse cx="${cx}" cy="${ty}" rx="${rx}" ry="9" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.4"/>`;
    out += seg({ x: cx - RX, y: by }, { x: cx - rx, y: ty }) + seg({ x: cx + RX, y: by }, { x: cx + rx, y: ty });
    if (o.topRLabel) {
      out += seg({ x: cx, y: ty }, { x: cx + rx, y: ty }, false, 2, GEO.hlB) + dot(cx, ty, GEO.hlB, 2.5);
      out += txt(cx + rx / 2, ty - 8, o.topRLabel, "middle", GEO.hlB);
    }
    if (o.botRLabel) {
      out += seg({ x: cx, y: by }, { x: cx + RX, y: by }, false, 2, GEO.hlC) + dot(cx, by, GEO.hlC, 2.5);
      out += txt(cx + RX / 2, by + 16, o.botRLabel, "middle", GEO.hlC);
    }
    if (o.hLabel) {
      out += seg({ x: cx, y: ty }, { x: cx, y: by }, true, 1.8, GEO.soft);
      out += txt(cx - 8, (ty + by) / 2 + 4, o.hLabel, "end");
    }
  }
  return svg("0 0 300 200", o.kind === "pyr" ? "사각뿔대의 겨냥도" : "원뿔대의 겨냥도", out);
}

/** 복합 회전체(위에서 원뿔·원기둥·반구를 붙인 모양) — cone을 생략하면 원기둥 윗면이 뚜껑.
 *  맞닿은 면의 원 테두리는 실선 타원으로 그린다(경계 자체는 보이는 모서리). */
function m5CompositeFig(o: { cone?: { lLabel?: string }; cylHLabel?: string; rLabel?: string } = {}): string {
  const cx = 150;
  const RX = 46;
  const RY = 12;
  const shoulder = 94;
  const waist = 150;
  let out = "";
  if (o.cone) {
    const apex = { x: cx, y: 30 };
    out += seg({ x: cx - RX, y: shoulder }, apex) + seg({ x: cx + RX, y: shoulder }, apex);
    if (o.cone.lLabel) out += txt((cx + RX + apex.x) / 2 + 12, (shoulder + apex.y) / 2, o.cone.lLabel, "start");
  }
  out += `<ellipse cx="${cx}" cy="${shoulder}" rx="${RX}" ry="${RY}" stroke="${GEO.ink}" stroke-width="2.2" fill="${o.cone ? "none" : "#FFFFFF"}"/>`;
  out += seg({ x: cx - RX, y: shoulder }, { x: cx - RX, y: waist }) + seg({ x: cx + RX, y: shoulder }, { x: cx + RX, y: waist });
  out += `<ellipse cx="${cx}" cy="${waist}" rx="${RX}" ry="${RY}" stroke="${GEO.ink}" stroke-width="2.2" fill="none"/>`;
  out += `<path d="M${cx - RX} ${waist} A${RX} ${RX} 0 0 0 ${cx + RX} ${waist}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
  if (o.cylHLabel) out += txt(cx + RX + 11, (shoulder + waist) / 2 + 4, o.cylHLabel, "start");
  if (o.rLabel) {
    out += seg({ x: cx, y: waist }, { x: cx + RX, y: waist }, false, 2, GEO.hlC) + dot(cx, waist, GEO.hlC, 2.6);
    // 허리 타원 호와 겹치지 않게 반지름 선 아래(반구 안 공백)로(검수 38번 반영).
    out += txt(cx + RX / 2, waist + 22, o.rLabel, "middle", GEO.hlC);
  }
  return svg("0 0 300 212", "여러 입체를 쌓아 만든 입체도형의 겨냥도", out);
}

/** 삼각기둥 치수 겨냥도 — 밑면 직각삼각형+기둥 높이 라벨(검수 32번 반영 신작 — PR은 꼭짓점 이름 전용이라
 *  치수 병기 불가). 직각 꼭짓점 O의 두 밑변이 화면에서도 실제 90°가 되게 투영 좌표를 구성했고(내적 0),
 *  변 길이도 8:6:9 실비(9.5px/cm). 숨은선은 밑면 뒤 변(빗변 MN)만 점선(PR prism3 관행). */
function m5TriPrismDimFig(o: { aLabel?: string; bLabel?: string; hLabel?: string } = {}): string {
  const O = { x: 150, y: 192 };
  const M = { x: 84, y: 154 };
  const N = { x: 178.5, y: 142.5 };
  const H = 86;
  const J = { x: M.x, y: M.y - H };
  const K = { x: N.x, y: N.y - H };
  const L = { x: O.x, y: O.y - H };
  let out = seg(J, K) + seg(K, L) + seg(L, J);
  out += seg(J, M) + seg(K, N) + seg(L, O);
  out += seg(M, O) + seg(O, N) + seg(M, N, true, 2, GEO.soft);
  out += rightMark(O.x, O.y, angleOf(O.x, O.y, N.x, N.y), 9);
  if (o.aLabel) out += txt((O.x + M.x) / 2 - 7, (O.y + M.y) / 2 + 14, o.aLabel);
  if (o.bLabel) out += txt((O.x + N.x) / 2 + 13, (O.y + N.y) / 2 + 10, o.bLabel, "start");
  if (o.hLabel) out += txt(K.x + 9, (K.y + N.y) / 2 + 4, o.hLabel, "start");
  return svg("0 0 300 212", "밑면이 직각삼각형인 삼각기둥의 겨냥도", out);
}

/* ── 파일럿 40문항 (슬롯 순서) ── */

export const POOL_M1U5V2_PILOT: ExamItem[] = [
  // ─ L1 다각형: 대각선 ─
  {
    // [슬롯 1] 검산: 육각형 한 꼭짓점 대각선 6−3=3. 그림은 도형 제시(대각선 미표시 — 세기 유출 없음).
    id: "m1u5e001", lessonId: "m1u5l1", type: "mcq",
    prompt: "그림과 같은 육각형에서 한 꼭짓점에서 그을 수 있는 대각선의 개수는?",
    figure: m5PolyAngleFig({ angles: [120, 120, 120, 120, 120, 120], labels: [null, null, null, null, null, null] }),
    options: ["3개", "2개", "4개", "6개", "9개"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>한 꼭짓점에서는 자기 자신과 양옆의 이웃한 두 꼭짓점으로 대각선을 그을 수 없어요.<br>① 육각형의 꼭짓점은 6개<br>② 6−3=<b>3개</b> ✓<span class='xh'>오답 하나씩 격파</span>2개는 이웃한 꼭짓점을 한 개만 뺀 값이고, 4개는 자기 자신만 뺀 값이에요. 어느 쪽도 '자신 1개+이웃 2개'를 빼는 규칙을 절반만 적용한 셈이죠. 6개는 꼭짓점의 개수를 그대로 답한 것이고, 9개는 육각형의 대각선 전체 개수인 6×3÷2예요. 문제가 '한 꼭짓점에서'라고 물었는지 '전체'를 물었는지 먼저 구분하는 습관이 중요해요.",
    core: "한 꼭짓점의 대각선 수는 꼭짓점 수에서 3을 뺀다!",
  },
  {
    // [슬롯 6] 검산: n(n−3)/2=65 → n(n−3)=130=13×10 → n=13. 십삼각형 13·10÷2=65 재확인.
    id: "m1u5e006", lessonId: "m1u5l1", type: "num",
    prompt: "대각선의 개수가 <b>65개</b>인 다각형의 변의 개수를 구하세요.",
    answer: "13", numKind: "int", unitLabel: "개", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>변의 개수를 <i class='mv'>n</i>개라 하면 대각선의 개수는 <i class='mv'>n</i>(<i class='mv'>n</i>−3)÷2예요.<br>① <i class='mv'>n</i>(<i class='mv'>n</i>−3)÷2=65<br>② <i class='mv'>n</i>(<i class='mv'>n</i>−3)=130<br>③ 차가 3인 두 자연수의 곱이 130이 되는 경우를 찾으면 13×10<br>④ 따라서 <i class='mv'>n</i>=<b>13</b>, 십삼각형이에요 ✓<span class='xh'>계산 실수 격파</span>2를 곱하는 걸 잊고 <i class='mv'>n</i>(<i class='mv'>n</i>−3)=65로 놓으면 자연수 해가 없어 막혀요. 또 130=13×10에서 큰 수 13이 변의 수이고, 10은 13보다 3 작은 수라는 짝을 확인해야 해요. 검산: 십삼각형은 13×10÷2=65개 ✓",
    core: "n(n−3)÷2=65에서 n(n−3)=130=13×10, n=13!",
  },
  {
    // [슬롯 13] 검산: (n−3)+(n−2)=2n−5=17 → n=11. 십일각형: 대각선 8개+삼각형 9개=17 ✓.
    id: "m1u5e013", lessonId: "m1u5l1", type: "mcq",
    prompt: "어떤 다각형의 한 꼭짓점에서 그을 수 있는 대각선의 개수를 <i class='mv'>a</i>개, 이때 나누어지는 삼각형의 개수를 <i class='mv'>b</i>개라 할 때, <i class='mv'>a</i>+<i class='mv'>b</i>=17이에요. 이 다각형은?",
    options: ["십일각형", "십각형", "십이각형", "구각형", "십삼각형"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>변의 개수를 <i class='mv'>n</i>개라 하면 한 꼭짓점에서 그을 수 있는 대각선은 <i class='mv'>n</i>−3개, 이때 다각형은 <i class='mv'>n</i>−2개의 삼각형으로 나누어져요.<br>① (<i class='mv'>n</i>−3)+(<i class='mv'>n</i>−2)=17<br>② 2<i class='mv'>n</i>−5=17, <i class='mv'>n</i>=11 → <b>십일각형</b> ✓<span class='xh'>오답 하나씩 격파</span>십각형은 8+8=16, 십이각형은 9+10=19라 조건에 안 맞아요. 구각형은 6+7=13, 십삼각형은 10+11=21이고요. 대각선 수(<i class='mv'>n</i>−3)와 삼각형 수(<i class='mv'>n</i>−2)를 둘 다 <i class='mv'>n</i>−3으로 쓰면 2<i class='mv'>n</i>−6=17이 되어 자연수 해가 없어져요. 두 공식의 차이 1을 꼭 구분하세요.",
    core: "한 꼭짓점에서 대각선 n−3개, 삼각형 n−2개!",
  },

  // ─ L2 삼각형: 각의 두 법칙 ─
  {
    // [슬롯 15] 검산: 41+66+x=180 → x=73. 실각 렌더 bDeg 41·cDeg 66.
    id: "m1u5e015", lessonId: "m1u5l2", type: "num",
    prompt: "그림과 같이 삼각형의 두 내각의 크기가 <b>41°</b>, <b>66°</b>일 때, ∠<i class='mv'>x</i>의 크기를 구하세요.",
    figure: m5TriAngleFig({ bDeg: 41, cDeg: 66, labels: { B: "41°", C: "66°", A: "x°" }, names: null }),
    answer: "73", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 세 내각의 크기의 합은 언제나 180°예요.<br>① 41°+66°=107°<br>② ∠<i class='mv'>x</i>=180°−107°=<b>73°</b> ✓<span class='xh'>계산 실수 격파</span>두 각을 더할 때 41+66을 97이나 117로 잘못 계산하는 실수가 흔해요. 일의 자리 1+6=7, 십의 자리 4+6=10이니 107이 맞죠. 또 180에서 빼지 않고 360에서 빼면 253이라는 엉뚱한 값이 나와요. 360°는 사각형의 내각의 합이지 삼각형이 아니에요. 검산: 41+66+73=180 ✓ 세 각을 다시 더해 180이 되는지 확인하는 습관이 가장 확실해요.",
    core: "삼각형 세 내각의 합은 180°!",
  },
  {
    // [슬롯 20] 검산: 외각 (3x)°=68°+(x+22)° → 2x=90 → x=45. 실각: A=67·B=68·C=45, 외각 135 ✓.
    //  ext name "D"는 연장 끝(x 294)+오프셋이 뷰박스(300) 밖이라 미사용, 문두는 "∠C의 외각" 서술(파일럿 눈검수 반영).
    id: "m1u5e020", lessonId: "m1u5l2", type: "num",
    prompt: "그림에서 (3<i class='mv'>x</i>)°로 표시한 각은 삼각형 ABC에서 ∠C의 외각이에요. ∠B=<b>68°</b>, ∠A=(<i class='mv'>x</i>+22)°일 때, <i class='mv'>x</i>의 값을 구하세요.",
    figure: m5TriAngleFig({ bDeg: 68, cDeg: 45, labels: { B: "68°", A: "(x+22)°" }, ext: [{ at: "C", label: "(3x)°" }] }),
    answer: "45", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 한 외각의 크기는 이웃하지 않는 두 내각의 크기의 합과 같아요.<br>① 3<i class='mv'>x</i>=68+(<i class='mv'>x</i>+22)<br>② 3<i class='mv'>x</i>=<i class='mv'>x</i>+90<br>③ 2<i class='mv'>x</i>=90, <i class='mv'>x</i>=<b>45</b> ✓<span class='xh'>계산 실수 격파</span>외각과 이웃한 내각 ∠ACB를 더하는 게 아니라, 외각은 '이웃하지 않는' 두 내각 ∠A와 ∠B의 합이라는 점이 핵심이에요. 3<i class='mv'>x</i>=68+<i class='mv'>x</i>−22처럼 괄호를 풀며 부호를 놓치면 안 돼요. 검산: <i class='mv'>x</i>=45면 외각은 135°, 두 내각은 68°와 67°로 합이 135° ✓ 게다가 내각 45°+68°+67°=180° ✓",
    core: "외각은 이웃하지 않는 두 내각의 합!",
  },
  {
    // [슬롯 25] 검산: 별 다섯 꼭지각 합 180. 33+36+29+39=137 → x=180−137=43.
    //  라벨 배치(위부터 반시계): x·33·36·29·39, 그림은 정오각별 골격 실각 근사(36°대) 렌더.
    id: "m1u5e025", lessonId: "m1u5l2", type: "mcq",
    prompt: "그림과 같은 별 모양의 도형에서 네 각의 크기가 <b>33°</b>, <b>36°</b>, <b>29°</b>, <b>39°</b>일 때, ∠<i class='mv'>x</i>의 크기는?",
    figure: m5StarFig({ labels: ["x°", "33°", "36°", "29°", "39°"], xAt: 0 }),
    options: ["43°", "36°", "47°", "53°", "33°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>별 모양 도형의 다섯 꼭지각의 크기의 합은 180°예요. 가운데 오각형의 한 바깥 삼각형에서 외각 정리를 쓰면, 다섯 꼭지각이 한 삼각형의 세 내각으로 모이기 때문이죠.<br>① 33+36+29+39=137<br>② ∠<i class='mv'>x</i>=180−137=<b>43°</b> ✓<span class='xh'>오답 하나씩 격파</span>36°는 남은 네 각의 평균쯤을 고른 값이고, 47°나 53°는 덧셈에서 137을 133이나 127로 잘못 구했을 때 나와요. 33°는 이미 주어진 각을 그대로 고른 것이죠. 별의 꼭지각 합을 360°로 착각해 223°라는 값을 찾으면 보기에 없어서 당황하게 돼요. 오각형 내각의 합 540°와도 헷갈리지 마세요. 별의 꼭지각 합은 딱 180°예요.",
    core: "별 모양 다섯 꼭지각의 합은 180°!",
  },

  // ─ L3 내각의 합 ─
  {
    // [슬롯 33] 검산: (n−2)·180/n=160 → 180n−360=160n → 20n=360 → n=18. 한 외각 20°=360/18 교차 확인.
    id: "m1u5e033", lessonId: "m1u5l3", type: "mcq",
    prompt: "한 내각의 크기가 <b>160°</b>인 정다각형은?",
    options: ["정십팔각형", "정십이각형", "정십오각형", "정이십각형", "정구각형"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>정다각형의 한 내각과 한 외각의 합은 180°예요.<br>① 한 외각=180°−160°=20°<br>② 외각의 크기의 합은 360°이므로 <i class='mv'>n</i>=360÷20=18 → <b>정십팔각형</b> ✓<span class='xh'>오답 하나씩 격파</span>정십이각형의 한 내각은 10×180÷12=150°, 정십오각형은 13×180÷15=156°, 정이십각형은 18×180÷20=162°, 정구각형은 7×180÷9=140°라서 모두 160°가 아니에요. 내각 공식 (<i class='mv'>n</i>−2)×180÷<i class='mv'>n</i>=160으로 방정식을 풀어도 되지만, 외각 20°로 바꿔 360을 나누는 쪽이 훨씬 빨라요. 내각이 커질수록 변이 많은 정다각형이라는 감각도 함께 챙기세요.",
    core: "한 외각 20°로 바꾸면 360÷20=18!",
  },
  {
    // [슬롯 36] 검산: n−3=13 → n=16 → 내각합 (16−2)·180=2520.
    id: "m1u5e036", lessonId: "m1u5l3", type: "num",
    prompt: "한 꼭짓점에서 그을 수 있는 대각선의 개수가 <b>13개</b>인 다각형의 내각의 크기의 합을 구하세요.",
    answer: "2520", numKind: "int", unitLabel: "°", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>두 공식을 이어 쓰는 문제예요.<br>① 한 꼭짓점에서 그을 수 있는 대각선은 <i class='mv'>n</i>−3개이므로 <i class='mv'>n</i>−3=13, <i class='mv'>n</i>=16<br>② 십육각형의 내각의 합은 (16−2)×180°=14×180°=<b>2520°</b> ✓<span class='xh'>계산 실수 격파</span><i class='mv'>n</i>=13으로 착각하고 (13−2)×180=1980°를 답하면 대각선 조건을 내각 공식에 바로 넣은 실수예요. 반대로 내각 공식에서 2 대신 3을 빼 13×180=2340°을 만들기도 하죠. 대각선 조건에서는 3을 빼고(<i class='mv'>n</i>−3), 내각의 합에서는 2를 뺀(<i class='mv'>n</i>−2) 삼각형 개수를 곱한다는 걸 구분하세요. 검산: 14×180=2520 ✓",
    core: "n−3=13에서 n=16, 내각합은 14×180°=2520°!",
  },
  {
    // [슬롯 40] 검산: 외각 64° → 그 내각 116°. 96+125+82+116+x=540 → x=121. PA 실각 [96,125,82,116,121] 합 540 ✓.
    id: "m1u5e040", lessonId: "m1u5l3", type: "mcq",
    prompt: "그림의 오각형에서 한 꼭짓점의 외각의 크기가 <b>64°</b>일 때, ∠<i class='mv'>x</i>의 크기는?",
    figure: m5PolyAngleFig({ angles: [96, 125, 82, 116, 121], labels: ["96°", "125°", "82°", null, "x°"], ext: [{ at: 3, label: "64°" }] }),
    options: ["121°", "116°", "111°", "125°", "131°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>외각이 64°인 꼭짓점의 내각부터 구해요.<br>① 그 내각=180°−64°=116°<br>② 오각형 내각의 합은 (5−2)×180°=540°<br>③ ∠<i class='mv'>x</i>=540−(96+125+82+116)=540−419=<b>121°</b> ✓<span class='xh'>오답 하나씩 격파</span>116°는 외각을 내각으로 바꾼 중간값을 답으로 착각한 것이고, 125°는 이미 그림에 있는 각을 고른 거예요. 111°는 419를 429로 잘못 더했을 때, 131°는 409로 덜 더했을 때 나오는 값이죠. 가장 흔한 실수는 64°를 내각인 줄 알고 540−(96+125+82+64)=173°를 구하는 것인데, 연장선 위에 표시된 각은 외각이라는 걸 그림에서 확인해야 해요.",
    core: "외각 64°는 내각 116°로 바꿔 540°에서 뺀다!",
  },

  // ─ L4 외각의 합 ─
  {
    // [슬롯 43] 검산: 외각합 360. 73+85+66+49=273 → x=87. PA 실각 내각 [107,95,114,131,93] 합 540 ✓.
    id: "m1u5e043", lessonId: "m1u5l4", type: "num",
    prompt: "그림은 오각형의 각 꼭짓점에서 외각을 표시한 거예요. 네 외각의 크기가 <b>73°</b>, <b>85°</b>, <b>66°</b>, <b>49°</b>일 때, ∠<i class='mv'>x</i>의 크기를 구하세요.",
    figure: m5PolyAngleFig({
      angles: [107, 95, 114, 131, 93],
      labels: [null, null, null, null, null],
      ext: [{ at: 0, label: "73°" }, { at: 1, label: "85°" }, { at: 2, label: "66°" }, { at: 3, label: "49°" }, { at: 4, label: "x°" }],
    }),
    answer: "87", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>다각형의 외각의 크기의 합은 몇 각형이든 항상 360°예요.<br>① 73+85+66+49=273<br>② ∠<i class='mv'>x</i>=360−273=<b>87°</b> ✓<span class='xh'>계산 실수 격파</span>오각형이라고 해서 내각의 합 540°에서 빼면 267°라는 엉뚱한 값이 나와요. 그림에 표시된 각이 변의 연장선과 이루는 외각이라는 점을 먼저 확인하세요. 외각의 합은 삼각형이든 십각형이든 언제나 360°로 같다는 게 이 단원의 핵심이에요. 네 수를 더할 때는 73+85=158, 66+49=115로 둘씩 묶으면 158+115=273으로 실수가 줄어요. 검산: 273+87=360 ✓",
    core: "외각의 합은 몇 각형이든 360°!",
  },
  {
    // [슬롯 47] 검산: 직각 마크 꼭짓점의 내각 90 → 외각 90. 74+68+52+90=284 → x=76.
    //  PA 실각 내각 [106,112,128,90,104] 합 540 ✓, rightAt 3(내각 직각 마크로 90 은닉).
    id: "m1u5e047", lessonId: "m1u5l4", type: "num",
    prompt: "그림의 오각형에서 표시한 각은 외각이고, 한 꼭짓점의 내각은 직각이에요. ∠<i class='mv'>x</i>의 크기를 구하세요.",
    figure: m5PolyAngleFig({
      angles: [106, 112, 128, 90, 104],
      labels: [null, null, null, null, null],
      rightAt: [3],
      ext: [{ at: 0, label: "74°" }, { at: 1, label: "68°" }, { at: 2, label: "52°" }, { at: 4, label: "x°" }],
    }),
    answer: "76", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>내각이 직각(90°)인 꼭짓점의 외각도 180°−90°=90°예요.<br>① 외각의 합은 360°<br>② 74+68+52+90=284<br>③ ∠<i class='mv'>x</i>=360−284=<b>76°</b> ✓<span class='xh'>계산 실수 격파</span>가장 흔한 실수는 직각 표시가 있는 꼭짓점을 잊고 74+68+52만 더해 <i class='mv'>x</i>=166°로 답하는 거예요. 수치가 안 적힌 직각 기호도 어엿한 90°짜리 정보라는 걸 놓치지 마세요. 또 90°짜리 꼭짓점은 내각과 외각이 똑같이 90°라서 헷갈릴 일이 없다는 점도 기억해 두면 좋아요. 검산: 74+68+52+90+76=360 ✓",
    core: "직각 기호도 90°라는 정보, 외각합 360°에 넣는다!",
  },
  {
    // [슬롯 49] 검산: 360/20=18 → 정십팔각형 → 대각선 18·15÷2=135.
    id: "m1u5e049", lessonId: "m1u5l4", type: "num",
    prompt: "한 외각의 크기가 <b>20°</b>인 정다각형의 대각선의 개수를 구하세요.",
    answer: "135", numKind: "int", unitLabel: "개", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>외각에서 변의 수를 찾고, 대각선 공식으로 넘어가는 두 단계 문제예요.<br>① 외각의 합은 360°이므로 <i class='mv'>n</i>=360÷20=18<br>② 십팔각형의 대각선은 18×(18−3)÷2=18×15÷2=<b>135개</b> ✓<span class='xh'>계산 실수 격파</span>18×15=270에서 2로 나누는 걸 잊으면 270개가 돼요. 모든 꼭짓점에서 센 대각선은 양 끝에서 두 번씩 세어지니 반드시 절반으로 나눠야 해요. 또 <i class='mv'>n</i>−3 대신 <i class='mv'>n</i>−2를 써서 18×16÷2=144개를 만드는 실수도 잦아요. 대각선 공식의 3은 '자기 자신+이웃 2개'를 뺀 숫자라는 뜻을 기억하면 헷갈리지 않아요. 검산: 360÷18=20° ✓",
    core: "외각 20° → n=18 → 대각선 18×15÷2=135개!",
  },

  // ─ L5 원과 부채꼴: 원의 부품 ─
  {
    // [슬롯 57] ㉠=원 위 두 점 사이 굵은 호(부채꼴 위쪽 소호). ㉠ 지시 자체가 과제라 유출 아님(7호 ① 관행).
    id: "m1u5e057", lessonId: "m1u5l5", type: "mcq",
    prompt: "그림의 원 O에서 ㉠이 가리키는 부분의 이름은?",
    figure: m5CirclePartsFig({ aDeg: 24, bDeg: 132, radii: true, arcBold: true, mark: { target: "arc", text: "㉠" } }),
    options: ["호", "현", "활꼴", "부채꼴", "중심각"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>㉠은 원 위의 두 점 A, B 사이의 <b>원의 일부분</b>이에요. 원 위의 두 점이 원을 두 부분으로 나눌 때 그 각 부분을 호라고 하고, 기호로는 호 AB라고 읽어요 ✓<span class='xh'>오답 하나씩 격파</span>현은 원 위의 두 점을 곧게 이은 선분이라 굽은 ㉠과 달라요. 활꼴은 호와 현으로 둘러싸인 넓이가 있는 도형이고, 부채꼴은 두 반지름과 호로 둘러싸인 도형이라서 둘 다 '부분의 이름'이 아니라 '도형의 이름'이죠. ㉠은 테두리의 일부인 곡선 자체를 가리켜요. 중심각은 두 반지름이 중심 O에서 이루는 각이니 각의 이름이고요. 선(호·현), 도형(활꼴·부채꼴), 각(중심각)을 세 묶음으로 정리해 두면 절대 안 헷갈려요.",
    core: "원 위 두 점 사이의 원의 일부분이 호!",
  },
  {
    // [슬롯 59] 색칠 = 두 반지름+호로 둘러싸인 부채꼴(shade sector).
    id: "m1u5e059", lessonId: "m1u5l5", type: "mcq",
    prompt: "그림의 원 O에서 색칠한 부분의 이름은?",
    figure: m5CirclePartsFig({ aDeg: 30, bDeg: 120, radii: true, shade: "sector" }),
    options: ["부채꼴", "활꼴", "호", "반원", "중심각"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>색칠한 부분은 두 반지름 OA, OB와 호 AB로 둘러싸여 있어요. 이렇게 <b>두 반지름과 호로 둘러싸인 도형</b>을 부채꼴이라고 해요 ✓<span class='xh'>오답 하나씩 격파</span>활꼴은 현과 호로 둘러싸인 도형이에요. 색칠한 부분의 경계에 현이 아니라 중심 O를 지나는 두 반지름이 있으니 활꼴이 아니죠. 호는 테두리 곡선의 이름일 뿐 넓이가 있는 도형이 아니고요. 반원은 지름이 원을 반으로 나눌 때의 특별한 경우인데, 그림의 중심각은 90°라서 반원이 되려면 아직 멀었어요. 중심각은 도형이 아니라 두 반지름 사이의 각이에요. '부채 모양=중심에서 펼쳐진다'는 이미지로 기억하면 활꼴과 바로 구분돼요.",
    core: "두 반지름과 호로 둘러싸이면 부채꼴!",
  },
  {
    // [슬롯 64] 검산: OA=OB(반지름) 참, 최장 현=지름 참, 중심각 정의 참. 호=선분(거짓)·현=곡선(거짓).
    id: "m1u5e064", lessonId: "m1u5l5", type: "multi",
    prompt: "그림의 원 O에 대한 설명으로 옳은 것은? <b>정답을 모두 고르세요.</b>",
    figure: m5CirclePartsFig({ aDeg: 160, bDeg: 20, radii: true, chord: true }),
    options: [
      "선분 OA와 선분 OB의 길이는 같다",
      "원에서 가장 긴 현은 지름이다",
      "중심각은 두 반지름이 중심 O에서 이루는 각이다",
      "호 AB는 두 점 A, B를 이은 선분이다",
      "현 AB는 곡선이다",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>OA와 OB는 둘 다 원의 반지름이라 길이가 같아요. 현 중에서는 중심을 지나는 지름이 가장 길고, 중심각은 두 반지름이 중심에서 이루는 각이라는 정의 그대로예요 ✓<span class='xh'>오답 하나씩 격파</span>'호 AB는 선분이다'는 호와 현을 뒤바꾼 설명이에요. 호는 원 둘레의 일부인 곡선이죠. '현 AB는 곡선이다'도 마찬가지로 반대예요. 현은 원 위의 두 점을 곧게 이은 선분이에요. 그림에서 굽은 것(호)과 곧은 것(현)을 눈으로 짚으며 확인하면 정의가 몸에 붙어요. 지름이 가장 긴 현이라는 사실은 시험에 자주 나오니 이유까지 챙기세요. 중심에서 멀어질수록 현은 짧아져요.",
    core: "호는 곡선, 현은 선분, 가장 긴 현은 지름!",
  },

  // ─ L6 부채꼴의 성질 ─
  {
    // [슬롯 71] 검산: 호는 중심각에 정비례. 140/35=4배 → 8×4=32. CR 실각 스팬 35·140 렌더.
    id: "m1u5e071", lessonId: "m1u5l6", type: "num",
    prompt: "그림과 같이 한 원에서 중심각의 크기가 <b>35°</b>인 부채꼴의 호의 길이가 <b>8 cm</b>일 때, 중심각의 크기가 <b>140°</b>인 부채꼴의 호의 길이는 몇 cm인지 구하세요.",
    figure: m5CircleRatioFig({
      sectors: [
        { from: 80, to: 115, angleLabel: "35°", valueLabel: "8 cm" },
        { from: 170, to: 310, angleLabel: "140°", valueLabel: "x cm", shade: true },
      ],
    }),
    answer: "32", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>한 원에서 호의 길이는 중심각의 크기에 정비례해요.<br>① 중심각이 35°에서 140°로 4배<br>② 호의 길이도 4배: 8×4=<b>32 cm</b> ✓<span class='xh'>계산 실수 격파</span>비례식 35:140=8:<i class='mv'>x</i>로 세워 35<i class='mv'>x</i>=1120, <i class='mv'>x</i>=32로 풀어도 같아요. 이때 안쪽 항과 바깥 항을 헷갈려 35:140=<i class='mv'>x</i>:8로 쓰면 <i class='mv'>x</i>=2가 나와 버려요. 중심각이 커졌으니 호도 길어져야 한다는 방향 감각으로 답을 확인하세요. 140−35=105를 더해 8+105 같은 덧셈 실수는 정비례를 덧셈 관계로 착각한 거예요. 4배 관계는 곱셈이에요. 검산: 32÷8=4, 140÷35=4 ✓",
    core: "한 원에서 호의 길이는 중심각에 정비례!",
  },
  {
    // [슬롯 75] 검산: 호·넓이 정비례 참, 현 정비례 거짓(2배 미만), 합동 원 전제 참.
    id: "m1u5e075", lessonId: "m1u5l6", type: "multi",
    prompt: "한 원 또는 합동인 두 원의 부채꼴에 대한 설명으로 옳은 것은? <b>정답을 모두 고르세요.</b>",
    options: [
      "호의 길이는 중심각의 크기에 정비례한다",
      "부채꼴의 넓이는 중심각의 크기에 정비례한다",
      "크기가 같은 두 원에서 중심각이 같은 두 부채꼴의 넓이는 같다",
      "현의 길이는 중심각의 크기에 정비례한다",
      "중심각이 2배가 되면 현의 길이도 항상 2배가 된다",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>한 원(또는 합동인 두 원)에서 호의 길이와 부채꼴의 넓이는 중심각의 크기에 정비례해요. 반지름이 같으니 중심각이 같으면 부채꼴끼리 완전히 포개어져 넓이도 같고요 ✓<span class='xh'>오답 하나씩 격파</span>현의 길이는 중심각에 정비례하지 않아요. 중심각이 커질수록 현도 길어지긴 하지만, 정확히 2배·3배가 되지는 않죠. 극단적으로 중심각을 180°까지 늘려도 현은 지름보다 길어질 수 없다는 걸 떠올리면 이해가 쉬워요. 90°의 현을 2배 한 값은 180°의 현인 지름보다 길어져 모순이 생기거든요. '커진다'와 '정비례한다'는 다른 말이라는 게 이 단원 최대 함정이에요.",
    core: "호·넓이는 정비례, 현은 정비례하지 않는다!",
  },
  {
    // [슬롯 76] 검산: 84/28=3배. 호·넓이 3배 참, 반지름 동일 참, 현 3배가 거짓(정답).
    id: "m1u5e076", lessonId: "m1u5l6", type: "mcq",
    prompt: "그림과 같이 한 원에 중심각의 크기가 <b>28°</b>, <b>84°</b>인 두 부채꼴이 있어요. 옳지 <b>않은</b> 것은?",
    figure: m5CircleRatioFig({
      sectors: [
        { from: 70, to: 98, angleLabel: "28°" },
        { from: 150, to: 234, angleLabel: "84°", shade: true },
      ],
    }),
    options: [
      "84°인 부채꼴의 현의 길이는 28°인 부채꼴의 현의 길이의 3배이다",
      "84°인 부채꼴의 호의 길이는 28°인 부채꼴의 호의 길이의 3배이다",
      "84°인 부채꼴의 넓이는 28°인 부채꼴의 넓이의 3배이다",
      "두 부채꼴의 중심각의 크기의 비는 1:3이다",
      "두 부채꼴의 반지름의 길이는 같다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>중심각의 비가 28:84=1:3이므로 호의 길이와 넓이는 정확히 3배가 돼요. 하지만 <b>현의 길이는 중심각에 정비례하지 않아서</b> 3배라고 말할 수 없어요. 이것이 옳지 않은 설명이에요 ✓<span class='xh'>오답 하나씩 격파</span>호가 3배, 넓이가 3배라는 설명은 정비례 성질 그대로라 옳아요. 중심각의 비 1:3도 28과 84를 28로 나눈 결과 그대로죠. 한 원 안의 부채꼴이니 반지름이 같다는 것도 당연히 옳고요. 현만 홀로 예외인 이유는 곧은 선분이라 각을 세 배로 벌려도 길이가 세 배로 늘지 않기 때문이에요. '호·넓이는 비례, 현은 예외'를 한 세트로 외워 두세요.",
    core: "3배가 안 되는 건 오직 현!",
  },

  // ─ L7 호와 넓이: π의 등장 ─
  {
    // [슬롯 85] 검산: 호=2π·12·75/360=5π → a=5. 그림에 호 라벨 없음(답 유출 방지).
    id: "m1u5e085", lessonId: "m1u5l7", type: "num",
    prompt: "그림과 같이 반지름의 길이가 <b>12 cm</b>, 중심각의 크기가 <b>75°</b>인 부채꼴의 호의 길이가 <i class='mv'>a</i>π cm일 때, <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5SectorXFig({ deg: 75, degLabel: "75°", rLabel: "12 cm" }),
    answer: "5", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>부채꼴의 호의 길이는 원의 둘레에 중심각의 비율을 곱해요.<br>① 원의 둘레=2π×12=24π<br>② 호=24π×75/360=24π×5/24=5π<br>③ <i class='mv'>a</i>=<b>5</b> ✓<span class='xh'>계산 실수 격파</span>75/360을 약분할 때 15로 나누면 5/24가 되는데, 이를 5/24 대신 1/5이나 5/12로 잘못 줄이는 실수가 흔해요. 75=15×5, 360=15×24로 차근차근 나누세요. 또 호의 길이인데 넓이 공식 πr²을 써서 144π×5/24=30π를 구하면 완전히 다른 답이 돼요. 길이에는 2πr, 넓이에는 πr²라고 공식의 짝을 확인하는 습관이 필요해요. 검산: 5π÷24π=5/24=75/360 ✓",
    core: "호의 길이는 2πr×(중심각/360)!",
  },
  {
    // [슬롯 89] 검산: 2π·8·x/360=10π → x/360=10/16 → x=225. deg 225 실각 렌더(180 초과 배치 확인).
    id: "m1u5e089", lessonId: "m1u5l7", type: "num",
    prompt: "그림의 부채꼴은 반지름의 길이가 <b>8 cm</b>이고 호의 길이가 <b>10π cm</b>예요. 이 부채꼴의 중심각의 크기를 구하세요.",
    figure: m5SectorXFig({ deg: 225, degLabel: "x°", rLabel: "8 cm", arcLabel: "10π cm" }),
    answer: "225", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>중심각을 <i class='mv'>x</i>°라 하면 호의 길이 공식에서 역산해요.<br>① 2π×8×<i class='mv'>x</i>/360=10π<br>② 16π×<i class='mv'>x</i>/360=10π<br>③ <i class='mv'>x</i>=10×360÷16=<b>225</b> ✓<span class='xh'>계산 실수 격파</span>3600÷16 계산은 3600÷16=225로 딱 떨어져요. 나눗셈이 무섭다고 10/16을 어림해 버리면 안 돼요. 답이 180°를 넘는다고 당황할 필요도 없어요. 그림처럼 반원보다 크게 벌어진 부채꼴도 얼마든지 있어요. 원의 둘레가 16π인데 호가 10π로 절반(8π)을 넘는다는 것에서 중심각이 180°보다 크다는 걸 미리 예상할 수 있죠. 검산: 16π×225/360=16π×5/8=10π ✓",
    core: "호 공식을 거꾸로: x=호×360÷(2πr)!",
  },
  {
    // [슬롯 91] 검산: S=½rl → 35π=½·10·l → l=7π → a=7. 그림 실각 deg 126(S=100π·126/360=35π ✓), 호 라벨 없음.
    id: "m1u5e091", lessonId: "m1u5l7", type: "num",
    prompt: "그림의 부채꼴은 반지름의 길이가 <b>10 cm</b>이고 넓이가 <b>35π cm²</b>예요. 이 부채꼴의 호의 길이가 <i class='mv'>a</i>π cm일 때, <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5SectorXFig({ deg: 126, rLabel: "10 cm", areaLabel: "35π cm²" }),
    answer: "7", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>부채꼴의 넓이 S, 반지름 <i class='mv'>r</i>, 호의 길이 <i class='mv'>l</i> 사이에는 S=½<i class='mv'>r</i><i class='mv'>l</i>이 성립해요.<br>① 35π=½×10×<i class='mv'>l</i><br>② 35π=5<i class='mv'>l</i><br>③ <i class='mv'>l</i>=7π, <i class='mv'>a</i>=<b>7</b> ✓<span class='xh'>계산 실수 격파</span>중심각이 안 주어졌다고 당황해서 πr²×(각/360) 공식으로 돌아가면 미지수가 두 개가 돼 버려요. 넓이와 반지름에서 호를 바로 잇는 다리가 S=½<i class='mv'>r</i><i class='mv'>l</i>이에요. ½을 빠뜨리고 35π=10<i class='mv'>l</i>로 세우면 <i class='mv'>l</i>=3.5π가 되니 주의하세요. 검산: ½×10×7π=35π ✓ 반대로 호에서 넓이를 구할 때도 같은 공식을 써요.",
    core: "중심각 없이 넓이·반지름·호를 잇는 S=½rl!",
  },
  {
    // [슬롯 94] 검산: 렌즈=2×(사분원−직각삼각형)=2×(16π−32)=32π−64. √ 무등장 조합.
    id: "m1u5e094", lessonId: "m1u5l7", type: "mcq",
    prompt: "그림과 같이 한 변의 길이가 <b>8 cm</b>인 정사각형 ABCD에서 두 꼭짓점 B, D를 각각 중심으로 하고 반지름이 정사각형의 한 변인 원의 일부를 그렸어요. 색칠한 부분의 넓이는?",
    figure: m5LensFig("8 cm"),
    options: ["(32π−64) cm²", "(16π−32) cm²", "(64π−64) cm²", "32π cm²", "(16π−16) cm²"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>색칠한 부분은 두 사분원이 겹친 부분이에요. 사분원에서 직각삼각형을 뺀 조각이 두 개 모인 것으로 보면 계산이 깔끔해요.<br>① 사분원 하나=¼×π×8²=16π<br>② 직각삼각형 ABD=½×8×8=32<br>③ 조각 하나=16π−32<br>④ 색칠=2×(16π−32)=<b>(32π−64) cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>(16π−32) cm²는 조각 하나만 구하고 2배를 잊은 값이에요. (64π−64) cm²는 사분원 대신 원 전체 넓이 64π를 쓴 것이고, 32π cm²는 삼각형을 빼지 않은 채 사분원 두 개만 더한 값이죠. (16π−16) cm²는 삼각형 넓이의 ½을 빠뜨린 계산이에요. 겹친 부분은 '넘치게 더한 만큼 빼기'로 기억하세요.",
    core: "렌즈 모양은 2×(사분원−직각삼각형)!",
  },

  // ─ L8 다면체 ─
  {
    // [슬롯 100] 검산: 오각기둥 모서리=밑면 5×2+옆 5=15. 그림은 도형 제시(m1u4 몫 PR 재사용).
    id: "m1u5e100", lessonId: "m1u5l8", type: "mcq",
    prompt: "그림과 같은 오각기둥에서 모서리의 개수는?",
    figure: mExamSolidFig("prism5"),
    options: ["15개", "10개", "7개", "12개", "25개"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>각기둥의 모서리는 세 묶음으로 세요.<br>① 윗면 둘레 5개<br>② 밑면 둘레 5개<br>③ 기둥을 세우는 옆 모서리 5개<br>④ 5×3=<b>15개</b> ✓ <i class='mv'>n</i>각기둥의 모서리는 언제나 3<i class='mv'>n</i>개예요.<span class='xh'>오답 하나씩 격파</span>10개는 꼭짓점의 개수(2×5)와 헷갈린 값이에요. 7개는 면의 개수(밑면 2+옆면 5)죠. 12개는 옆 모서리를 빠뜨리고 두 밑면 둘레만 더하다 하나를 더 놓친 값이고, 25개는 5×5처럼 곱셈을 잘못 세운 결과예요. 모서리·꼭짓점·면은 각각 3n, 2n, n+2로 공식화해 두되, 그림에서 위·아래·옆 세 묶음을 직접 짚어 보는 게 가장 안전해요.",
    core: "n각기둥의 모서리는 3n개, 오각기둥은 15개!",
  },
  {
    // [슬롯 104] 검산: 사각뿔대 모서리 3·4=12(정답), 면 4+2=6, 꼭짓점 2·4=8, 옆면은 사다리꼴, 두 밑면 평행.
    id: "m1u5e104", lessonId: "m1u5l8", type: "mcq",
    prompt: "그림과 같은 사각뿔대에 대한 설명으로 옳은 것은?",
    figure: m5FrustumFig({ kind: "pyr" }),
    options: [
      "모서리의 개수는 12개이다",
      "면의 개수는 5개이다",
      "꼭짓점의 개수는 6개이다",
      "옆면의 모양은 삼각형이다",
      "두 밑면은 서로 수직이다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>사각뿔대의 모서리는 윗면 둘레 4개, 아랫면 둘레 4개, 옆 모서리 4개로 모두 <b>12개</b>예요 ✓<span class='xh'>오답 하나씩 격파</span>면의 개수는 두 밑면 2개에 옆면 4개를 더한 6개라서 5개가 아니에요. 5개는 사각뿔의 면 개수와 헷갈린 값이죠. 꼭짓점은 윗면 4개와 아랫면 4개로 8개예요. 옆면은 삼각형이 아니라 사다리꼴이고요. 각뿔의 옆면(삼각형)에서 꼭대기가 잘려 나가며 윗변이 생긴 모양이라고 기억하면 돼요. 두 밑면은 수직이 아니라 서로 평행해요. 각뿔을 밑면에 평행한 평면으로 잘랐기 때문에 평행이 유지되죠. 뿔대는 '뿔의 성질 절반+기둥의 성질 절반'으로 정리해 두세요.",
    core: "사각뿔대는 모서리 12·면 6·꼭짓점 8, 옆면은 사다리꼴!",
  },
  {
    // [슬롯 107] 검산: 뿔대 두 밑면 평행(참)·각뿔 면=꼭짓점=n+1(참)·각기둥 3n>2n(참). 칠각뿔 모서리 2·7=14(거짓)·뿔대 옆면 사다리꼴(거짓).
    id: "m1u5e107", lessonId: "m1u5l8", type: "multi",
    prompt: "다면체에 대한 설명으로 옳은 것은? <b>정답을 모두 고르세요.</b>",
    options: [
      "각뿔대의 두 밑면은 서로 평행하다",
      "각뿔의 면의 개수와 꼭짓점의 개수는 같다",
      "각기둥의 모서리의 개수는 꼭짓점의 개수보다 많다",
      "칠각뿔의 모서리의 개수는 8개이다",
      "각뿔대의 옆면의 모양은 직사각형이다",
    ],
    answer: [0, 1, 2], diff: 3,
    explain: "<span class='xh'>정답 풀이</span>각뿔대는 각뿔을 밑면에 평행한 평면으로 자른 것이라 두 밑면이 평행해요. <i class='mv'>n</i>각뿔은 면도 꼭짓점도 <i class='mv'>n</i>+1개로 같고요. <i class='mv'>n</i>각기둥의 모서리는 3<i class='mv'>n</i>개, 꼭짓점은 2<i class='mv'>n</i>개니까 모서리가 항상 많아요 ✓<span class='xh'>오답 하나씩 격파</span>칠각뿔의 모서리는 밑면 둘레 7개에 옆 모서리 7개를 더한 14개예요. 8개는 면의 개수(7+1)와 헷갈린 값이죠. 각뿔대의 옆면은 직사각형이 아니라 사다리꼴이에요. 직사각형 옆면은 각기둥의 특징이고, 뿔대는 위로 갈수록 좁아져서 윗변과 아랫변의 길이가 다른 사다리꼴이 되죠. 공식 3n·2n·n+1을 외우되, 헷갈리면 삼각뿔 같은 작은 도형으로 직접 세어 검산하세요.",
    core: "뿔대 밑면은 평행·옆면은 사다리꼴, n각뿔은 면=꼭짓점!",
  },

  // ─ L9 정다면체 ─
  {
    // [슬롯 114] 정다면체 명단: 4·6·8·12·20면체뿐. 정십면체는 존재하지 않음.
    id: "m1u5e114", lessonId: "m1u5l9", type: "mcq",
    prompt: "다음 중 정다면체가 <b>아닌</b> 것은?",
    options: ["정십면체", "정사면체", "정팔면체", "정십이면체", "정이십면체"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>정다면체는 모든 면이 합동인 정다각형이고 각 꼭짓점에 모인 면의 개수가 같은 다면체로, 정사면체·정육면체·정팔면체·정십이면체·정이십면체 <b>다섯 종류뿐</b>이에요. 정십면체라는 정다면체는 없어요 ✓<span class='xh'>오답 하나씩 격파</span>정사면체와 정팔면체, 정이십면체는 정삼각형 면으로, 정십이면체는 정오각형 면으로 이루어진 어엿한 정다면체예요. 다섯뿐인 이유는 한 꼭짓점에 모인 각의 크기의 합이 360°보다 작아야 입체로 접히기 때문이죠. 면의 수가 10인 다면체 자체는 만들 수 있지만 모든 면이 합동인 정다각형이 되도록은 만들 수 없어요. '4·6·8·12·20'을 주문처럼 외워 두면 명단 문제는 끝이에요.",
    core: "정다면체는 4·6·8·12·20면체 다섯뿐!",
  },
  {
    // [슬롯 117] 검산: 정삼각형 면+꼭짓점당 3개 = 정사면체(60°×3=180<360). 4개면 정팔면체, 5개면 정이십면체.
    id: "m1u5e117", lessonId: "m1u5l9", type: "mcq",
    prompt: "다음 두 조건을 모두 만족시키는 정다면체는?<br>(가) 각 면은 모두 합동인 정삼각형이다.<br>(나) 한 꼭짓점에 모인 면의 개수는 3개이다.",
    options: ["정사면체", "정팔면체", "정이십면체", "정육면체", "정십이면체"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>면이 정삼각형인 정다면체는 정사면체(꼭짓점당 3개), 정팔면체(4개), 정이십면체(5개) 세 가지예요. 한 꼭짓점에 3개가 모이는 것은 <b>정사면체</b>죠 ✓<span class='xh'>오답 하나씩 격파</span>정팔면체는 조건 (가)는 만족하지만 한 꼭짓점에 4개가 모여 (나)에 어긋나요. 정이십면체는 5개가 모이고요. 정육면체는 면이 정사각형, 정십이면체는 정오각형이라 (가)부터 어긋나죠. 정삼각형 세 개가 모이면 모임각이 180°라서 여유 있게 접히고, 여섯 개가 모이면 360°가 되어 평면에 펴져 버려요. '면 모양'과 '꼭짓점당 개수' 두 가지가 정다면체를 결정한다는 것이 핵심이에요.",
    core: "정삼각형이 꼭짓점마다 3개 모이면 정사면체!",
  },

  // ─ L10 회전체 ─
  {
    // [슬롯 128] 직사각형을 축에 붙여 1회전 → 원기둥.
    id: "m1u5e128", lessonId: "m1u5l10", type: "mcq",
    prompt: "그림과 같이 한 변이 직선 <i class='mv'>l</i> 위에 있는 직사각형을 직선 <i class='mv'>l</i>을 회전축으로 하여 1회전시킬 때 생기는 입체도형은?",
    figure: m5RotateFig({ profile: "rect" }),
    options: ["원기둥", "원뿔", "원뿔대", "구", "사각기둥"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>직사각형이 축을 중심으로 한 바퀴 돌면, 축과 평행한 변이 쓸고 지나간 자리가 옆면(곡면)이 되고 위아래 변이 쓸고 간 자리가 두 밑면(원)이 돼요. 그래서 <b>원기둥</b>이 생겨요 ✓<span class='xh'>오답 하나씩 격파</span>원뿔은 직각삼각형을, 원뿔대는 축에 수직인 두 변을 가진 사다리꼴을, 구는 반원을 돌렸을 때 생기는 회전체예요. 도형의 위아래 폭이 같은 직사각형에서는 기울어진 옆면이 나올 수 없죠. 사각기둥은 애초에 회전체가 아니에요. 회전체의 옆면은 반드시 곡면인데 사각기둥의 옆면은 평평한 직사각형이니까요. '돌리기 전 평면도형과 돌린 뒤 입체'의 짝을 표로 정리해 두세요.",
    core: "축에 붙은 직사각형을 돌리면 원기둥!",
  },
  {
    // [슬롯 131] 카드 ①rtri ②semi ③rtrap ④rect ⑤rtriAway. 원뿔대=직각사다리꼴 → ③. shuffle:false·정답 ① 금지 준수.
    id: "m1u5e131", lessonId: "m1u5l10", type: "mcq",
    prompt: "다음 ①~⑤의 평면도형을 각각 직선 <i class='mv'>l</i>을 회전축으로 하여 1회전시킬 때, <b>원뿔대</b>가 생기는 것은?",
    figure: m5RotateChoicesFig(["rtri", "semi", "rtrap", "rect", "rtriAway"]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 2, shuffle: false, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>원뿔대는 원뿔을 밑면에 평행한 평면으로 잘라 만든 입체라, 돌리기 전 도형은 축에 수직인 평행한 두 변을 가진 <b>직각사다리꼴</b>이어야 해요. 위아래 폭이 다른 사다리꼴이 돌면서 위가 좁고 아래가 넓은 원뿔대를 만들죠 ✓<span class='xh'>오답 하나씩 격파</span>직각삼각형을 돌리면 원뿔, 반원을 돌리면 구, 직사각형을 돌리면 원기둥이 생겨요. 축에서 떨어져 있는 직각삼각형을 돌리면 가운데가 뚫린 회전체가 되고요. 사다리꼴과 직각삼각형을 헷갈리기 쉬운데, 윗변이 있느냐 없느냐가 갈림길이에요. 윗변이 있으면 위쪽 밑면(작은 원)이 생겨 원뿔대, 없이 한 점으로 모이면 원뿔이 돼요.",
    core: "원뿔대의 재료는 축에 붙은 직각사다리꼴!",
  },
  {
    // [슬롯 136] 구멍 뚫린 원기둥(TB) = 축에서 떨어진 직사각형의 회전. 천05-06 구조(이격 판별).
    id: "m1u5e136", lessonId: "m1u5l10", type: "mcq",
    prompt: "그림과 같이 가운데에 구멍이 뚫린 입체도형은 어떤 평면도형을 직선 <i class='mv'>l</i>을 회전축으로 하여 1회전시킨 것인가요?",
    figure: m5TubeFig(),
    options: [
      "회전축에서 떨어져 있는 직사각형",
      "회전축에 한 변이 붙어 있는 직사각형",
      "회전축에서 떨어져 있는 직각삼각형",
      "회전축에 한 변이 붙어 있는 직각사다리꼴",
      "반원",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>회전체 가운데에 구멍이 있다는 것은 돌리기 전 평면도형이 <b>회전축에서 떨어져</b> 있었다는 뜻이에요. 도형과 축 사이의 빈 공간이 돌면서 구멍이 되죠. 바깥 면과 구멍 안쪽 면이 모두 곧은 원기둥 모양이니 재료는 직사각형이에요 ✓<span class='xh'>오답 하나씩 격파</span>축에 붙은 직사각형은 구멍 없는 원기둥을 만들어요. 떨어져 있는 직각삼각형을 돌리면 구멍은 생기지만 바깥 면이 비스듬한 모양이 되어 그림과 달라요. 축에 붙은 직각사다리꼴은 원뿔대, 반원은 구를 만들고요. '구멍이 있으면 축과 도형 사이가 떠 있다, 면이 곧으면 직사각형이다' 두 단서를 차례로 확인하면 돼요.",
    core: "구멍은 축에서 떨어진 도형의 흔적!",
  },

  // ─ L11 기둥의 겉넓이와 부피 ─
  {
    // [슬롯 142] 검산: V=πr²h=π·25·7=175π → a=175.
    id: "m1u5e142", lessonId: "m1u5l11", type: "num",
    prompt: "그림과 같이 밑면인 원의 반지름의 길이가 <b>5 cm</b>, 높이가 <b>7 cm</b>인 원기둥의 부피가 <i class='mv'>a</i>π cm³일 때, <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5SolidDimFig({ kind: "cyl", rLabel: "5 cm", hLabel: "7 cm" }),
    answer: "175", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>기둥의 부피는 밑넓이에 높이를 곱해요.<br>① 밑넓이=π×5²=25π<br>② 부피=25π×7=175π<br>③ <i class='mv'>a</i>=<b>175</b> ✓<span class='xh'>계산 실수 격파</span>반지름을 제곱하지 않고 π×5×7=35π로 계산하는 실수가 가장 흔해요. 밑넓이는 원의 넓이라서 반드시 r²이 들어가요. 또 지름과 반지름을 헷갈려 π×10²×7=700π를 만들지 않도록 그림의 반지름 표시가 중심에서 원 위까지인지 확인하세요. 25×7=175는 25×7=25×(5+2)=125+50으로 나누어 계산하면 암산 실수가 줄어요. 검산: 175π÷25π=7로 높이가 되돌아오는지 확인 ✓",
    core: "기둥의 부피는 밑넓이×높이=πr²h!",
  },
  {
    // [슬롯 144] 검산: 밑넓이 ½·6·8=24, V=24·9=216. 검수 32번 반영: PR 도형 제시 → 신작 TP 치수 겨냥도
    //  (6·8·9 라벨 병기 — 문두+그림 이중 제시 성립).
    id: "m1u5e144", lessonId: "m1u5l11", type: "num",
    prompt: "그림과 같은 삼각기둥의 밑면은 직각을 낀 두 변의 길이가 <b>6 cm</b>, <b>8 cm</b>인 직각삼각형이에요. 높이가 <b>9 cm</b>일 때, 이 삼각기둥의 부피는 몇 cm³인지 구하세요.",
    figure: m5TriPrismDimFig({ aLabel: "8 cm", bLabel: "6 cm", hLabel: "9 cm" }),
    answer: "216", numKind: "int", unitLabel: "cm³", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>각기둥의 부피도 밑넓이에 높이를 곱해요.<br>① 밑넓이=½×6×8=24<br>② 부피=24×9=<b>216 cm³</b> ✓<span class='xh'>계산 실수 격파</span>직각삼각형의 넓이에서 ½을 빠뜨리고 6×8=48로 두면 부피가 432 cm³로 두 배가 돼요. 삼각형 넓이는 반드시 ½×밑변×높이예요. 또 밑면의 두 변 6, 8과 기둥의 높이 9가 하는 일이 달라요. 6과 8은 밑넓이를 만들고, 9는 그 밑넓이를 위로 쌓아 올리는 높이죠. 세 수를 몽땅 곱해 놓고 ½만 붙이는 습관적 계산도 이 구분이 서 있으면 실수가 아니라 원리가 돼요. 검산: 216÷9=24=½×6×8 ✓",
    core: "각기둥 부피=밑넓이×높이, ½을 잊지 않기!",
  },
  {
    // [슬롯 149] 검산: (25−4)π×8=168π → a=168. 큰 부피−작은 부피 구조.
    id: "m1u5e149", lessonId: "m1u5l11", type: "num",
    prompt: "그림과 같이 밑면인 원의 반지름의 길이가 <b>5 cm</b>인 원기둥의 한가운데에 반지름의 길이가 <b>2 cm</b>인 원기둥 모양의 구멍이 뚫려 있어요. 높이가 <b>8 cm</b>일 때, 이 입체도형의 부피가 <i class='mv'>a</i>π cm³이면 <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5TubeFig({ rLabel: "5 cm", innerLabel: "2 cm", hLabel: "8 cm" }),
    answer: "168", numKind: "int", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>구멍 뚫린 입체의 부피는 큰 입체에서 구멍을 빼요.<br>① 큰 원기둥=π×5²×8=200π<br>② 구멍 원기둥=π×2²×8=32π<br>③ 부피=200π−32π=168π, <i class='mv'>a</i>=<b>168</b> ✓<span class='xh'>계산 실수 격파</span>반지름 차로 만든 원기둥 π×(5−2)²×8=72π는 완전히 다른 값이에요. 넓이는 제곱으로 커지기 때문에 '반지름 빼기'가 아니라 '넓이 빼기'를 해야 하죠. 밑넓이 단계에서 25π−4π=21π를 먼저 만들고 높이 8을 곱하면 21×8=168로 한 번에 끝나요. 두 원기둥의 높이가 8로 같다는 조건 덕분에 이렇게 묶을 수 있어요. 검산: 21×8=168 ✓",
    core: "구멍 기둥 부피는 (큰 밑넓이−구멍 밑넓이)×높이!",
  },

  // ─ L12 뿔의 겉넓이와 부피 ─
  {
    // [슬롯 157] 검산: V=⅓πr²h=⅓·16·9π=48π → a=48.
    id: "m1u5e157", lessonId: "m1u5l12", type: "num",
    prompt: "그림과 같이 밑면인 원의 반지름의 길이가 <b>4 cm</b>, 높이가 <b>9 cm</b>인 원뿔의 부피가 <i class='mv'>a</i>π cm³일 때, <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5SolidDimFig({ kind: "cone", rLabel: "4 cm", hLabel: "9 cm" }),
    answer: "48", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>뿔의 부피는 같은 밑면과 높이를 가진 기둥의 ⅓이에요.<br>① 밑넓이=π×4²=16π<br>② 원기둥이라면 16π×9=144π<br>③ 원뿔은 그 ⅓: 144π÷3=48π, <i class='mv'>a</i>=<b>48</b> ✓<span class='xh'>계산 실수 격파</span>⅓을 빠뜨린 144가 가장 흔한 오답이에요. 모래시계 실험처럼 원뿔 세 컵이 원기둥 하나를 가득 채운다는 장면을 떠올리면 ⅓이 저절로 붙어요. 계산 순서는 16×9=144를 먼저 하고 3으로 나누는 쪽이 편한데, 9÷3=3을 먼저 해서 16×3=48로 가면 더 빨라요. 나누어떨어지는 수를 먼저 찾는 습관이 계산을 가볍게 만들어요. 검산: 48×3=144=16×9 ✓",
    core: "뿔의 부피는 기둥의 ⅓, ⅓πr²h!",
  },
  {
    // [슬롯 160] 검산: 중심각=360×r/l=360×3/9=120. NC 실각 120° 렌더, 구하는 자리 x°.
    id: "m1u5e160", lessonId: "m1u5l12", type: "mcq",
    prompt: "그림은 밑면인 원의 반지름의 길이가 <b>3 cm</b>, 모선의 길이가 <b>9 cm</b>인 원뿔의 전개도예요. 옆면인 부채꼴의 중심각의 크기는?",
    figure: m5NetConeFig({ deg: 120, slantLabel: "9 cm", rLabel: "3 cm", degLabel: "x°" }),
    options: ["120°", "108°", "135°", "150°", "90°"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>전개도에서 옆면 부채꼴의 호는 밑면인 원의 둘레와 딱 맞닿아야 해요.<br>① 밑면 둘레=2π×3=6π<br>② 부채꼴 호(반지름 9)=2π×9×<i class='mv'>x</i>/360<br>③ 18π×<i class='mv'>x</i>/360=6π에서 <i class='mv'>x</i>=<b>120°</b> ✓ 공식으로는 360×(밑면 반지름)÷(모선)=360×3÷9예요.<span class='xh'>오답 하나씩 격파</span>108°는 360×3/10처럼 모선을 10으로 잘못 본 값이고, 135°와 150°는 3/8, 5/12 같은 엉뚱한 비율에서 나와요. 90°는 반지름과 모선의 비를 ¼로 어림한 실수죠. 핵심은 '호=밑면 둘레'라는 접착 조건이에요. 이 등식만 세우면 공식을 잊어도 언제든 유도할 수 있어요.",
    core: "옆면 부채꼴의 호=밑면 원의 둘레, 중심각=360×r/l!",
  },
  {
    // [슬롯 164] 검산: 윗면 4+아랫면 36+옆면 4×(½(2+6)·5)=4+36+80=120. 네 옆면 합동 조건 문두 명시.
    id: "m1u5e164", lessonId: "m1u5l12", type: "num",
    prompt: "그림과 같이 두 밑면이 정사각형인 사각뿔대에서 위쪽 밑면의 한 변은 <b>2 cm</b>, 아래쪽 밑면의 한 변은 <b>6 cm</b>이고, 옆면인 사다리꼴의 높이는 <b>5 cm</b>예요. 네 옆면이 모두 합동일 때, 이 사각뿔대의 겉넓이는 몇 cm²인지 구하세요.",
    figure: m5FrustumFig({ kind: "pyr", topLabel: "2 cm", botLabel: "6 cm", sideLabel: "5 cm" }),
    answer: "120", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>겉넓이는 두 밑면과 옆면 네 장의 합이에요.<br>① 위 밑면=2×2=4<br>② 아래 밑면=6×6=36<br>③ 옆면 한 장(사다리꼴)=½×(2+6)×5=20<br>④ 겉넓이=4+36+4×20=<b>120 cm²</b> ✓<span class='xh'>계산 실수 격파</span>사다리꼴 넓이에서 ½을 빠뜌려 40×4=160으로 가는 실수, 옆면을 4장이 아니라 1장만 더하는 실수가 단골이에요. 또 5 cm는 입체를 세운 높이가 아니라 옆면 위에서 잰 사다리꼴의 높이라는 점을 그림의 수선 표시로 확인하세요. 두 밑면의 넓이가 서로 다른 것도 뿔대의 특징이라 2×2와 6×6을 각각 계산해야 해요. 검산: 4+36+80=120 ✓",
    core: "뿔대 겉넓이=두 밑면+사다리꼴 옆면 4장!",
  },

  // ─ L13 구의 겉넓이와 부피 ─
  {
    // [슬롯 172] 검산: S=4πr²=4π·49=196π → a=196.
    id: "m1u5e172", lessonId: "m1u5l13", type: "num",
    prompt: "그림과 같이 반지름의 길이가 <b>7 cm</b>인 구의 겉넓이가 <i class='mv'>a</i>π cm²일 때, <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5SolidDimFig({ kind: "sphere", rLabel: "7 cm" }),
    answer: "196", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>구의 겉넓이는 반지름이 같은 원의 넓이의 4배예요.<br>① 원의 넓이=π×7²=49π<br>② 겉넓이=4×49π=196π, <i class='mv'>a</i>=<b>196</b> ✓<span class='xh'>계산 실수 격파</span>공식 4πr²에서 4를 빠뜨리면 49, 반지름 제곱을 잊으면 28이 나와요. 구 껍질에 실을 감아 풀면 같은 반지름의 원 4개를 덮을 수 있다는 실험 장면을 떠올리면 4가 빠지지 않아요. 부피 공식 (4/3)πr³과도 자주 섞이는데, 겉넓이는 넓이라서 r², 부피는 부피라서 r³이라고 차원으로 구분하면 돼요. 4×49=196은 4×50−4=200−4로 암산하면 빨라요. 검산: 196÷4=49=7² ✓",
    core: "구의 겉넓이는 원 넓이의 4배, 4πr²!",
  },
  {
    // [슬롯 181] 검산: 원뿔 옆 πrl=15π+원기둥 옆 2πrh=24π+반구 곡면 2πr²=18π → 57π. 맞닿은 원면은 겉에 없음.
    id: "m1u5e181", lessonId: "m1u5l13", type: "num",
    prompt: "그림과 같이 원뿔, 원기둥, 반구를 차례로 붙여 만든 입체도형이 있어요. 밑면인 원의 반지름의 길이는 모두 <b>3 cm</b>이고, 원뿔의 모선의 길이는 <b>5 cm</b>, 원기둥의 높이는 <b>4 cm</b>예요. 이 입체도형의 겉넓이가 <i class='mv'>a</i>π cm²일 때, <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5CompositeFig({ cone: { lLabel: "5 cm" }, cylHLabel: "4 cm", rLabel: "3 cm" }),
    answer: "57", numKind: "int", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>겉으로 드러난 면만 더해요. 세 입체가 맞닿은 원면들은 안에 숨어 겉넓이에 들어가지 않아요.<br>① 원뿔 옆넓이=π×3×5=15π<br>② 원기둥 옆넓이=2π×3×4=24π<br>③ 반구 곡면=½×4π×3²=18π<br>④ 합=15π+24π+18π=57π, <i class='mv'>a</i>=<b>57</b> ✓<span class='xh'>계산 실수 격파</span>원뿔의 밑면 9π나 원기둥의 두 밑면 18π를 더하면 맞닿아 사라진 면을 겉으로 착각한 거예요. 이 입체는 위가 뾰족하고 아래가 둥글어서 평평한 원면이 하나도 겉에 없어요. 반구 곡면을 구 전체 겉넓이 36π로 쓰는 실수도 잦으니 절반인 18π인지 확인하세요. 검산: 15+24+18=57 ✓",
    core: "붙여 만든 입체는 드러난 면만: 옆+옆+곡면!",
  },

  // ─ L14 아르키메데스: 3:2:1 ─
  {
    // [슬롯 187] 원기둥:구:원뿔=3:2:1의 앞 두 항.
    id: "m1u5e187", lessonId: "m1u5l14", type: "mcq",
    prompt: "그림과 같이 원기둥에 구가 꼭 맞게 들어 있어요. 원기둥과 구의 부피의 비는?",
    figure: m5SolidDimFig({ kind: "sphereInCyl" }),
    options: ["3:2", "2:3", "3:1", "2:1", "4:3"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>구의 반지름을 <i class='mv'>r</i>라 하면 원기둥은 밑면 반지름 <i class='mv'>r</i>, 높이 2<i class='mv'>r</i>가 돼요.<br>① 원기둥=πr²×2r=2πr³<br>② 구=(4/3)πr³<br>③ 비=2:(4/3)=6:4=<b>3:2</b> ✓<span class='xh'>오답 하나씩 격파</span>2:3은 순서를 뒤집은 값이에요. 문제가 원기둥을 먼저 물었으니 큰 쪽이 앞이죠. 3:1은 원기둥과 원뿔의 비, 2:1은 구와 원뿔의 비라서 짝을 잘못 고른 거예요. 4:3은 구 공식의 분수 4/3만 눈에 담은 함정이고요. 아르키메데스가 묘비에 새긴 원기둥:구:원뿔=3:2:1을 통째로 기억하면 어떤 짝을 물어도 바로 꺼낼 수 있어요. 꼭 맞게 들어 있다는 조건이 높이=지름을 보장한다는 것도 핵심이에요.",
    core: "꼭 맞는 원기둥:구:원뿔=3:2:1!",
  },
  {
    // [슬롯 195] 검산: 구=원기둥의 ⅔ → 넘친 물=⅔·540π=360π → 남은 물=540π−360π=180π → a=180.
    id: "m1u5e195", lessonId: "m1u5l14", type: "num",
    prompt: "물이 가득 담긴 원기둥 모양의 그릇에 그릇에 꼭 맞는 구를 넣으면 구의 부피만큼 물이 넘쳐요. 처음 물의 부피가 <b>540π cm³</b>일 때, 구를 넣었다 꺼낸 뒤 그릇에 남은 물의 부피는 <i class='mv'>a</i>π cm³예요. <i class='mv'>a</i>의 값을 구하세요.",
    figure: m5SolidDimFig({ kind: "sphereInCyl" }),
    answer: "180", numKind: "int", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>그릇에 꼭 맞는 구의 부피는 원기둥 부피의 ⅔예요.<br>① 넘친 물=구의 부피=540π×⅔=360π<br>② 남은 물=540π−360π=180π<br>③ <i class='mv'>a</i>=<b>180</b> ✓ 남은 물이 원기둥의 ⅓이라는 것은 원뿔 부피와 같다는 뜻이기도 해요.<span class='xh'>계산 실수 격파</span>구를 원기둥의 ½로 착각하면 270π가 나와요. 3:2:1 비에서 원기둥이 3, 구가 2니까 구는 ⅔죠. 또 넘친 물 360π를 답으로 쓰지 않도록 질문이 '남은 물'인지 '넘친 물'인지 끝까지 읽어야 해요. 540×⅔은 540÷3=180을 먼저 구해 180×2=360으로 가면 암산이 쉬워요. 검산: 360+180=540 ✓",
    core: "꼭 맞는 구는 원기둥의 ⅔, 남는 물은 ⅓!",
  },
];
