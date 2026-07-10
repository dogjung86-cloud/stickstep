// balanceLab, 양팔저울 랩(Ⅱ 일차방정식 기함). 등식의 성질을 저울 조작으로 발견한다.
//   0막(실험): 평형 저울에 [양쪽 +1][양쪽 −1][양쪽 ×2][양쪽 ÷2]는 평형 유지,
//              [왼쪽만 +1]은 기울어짐, "양변에 같은 일"만 등호를 지킨다.
//   1막: x상자+3구슬 = 8구슬 → 양쪽 빼기로 상자만 남기기 → 상자가 열리며 x=5.
//   2막: x상자 3개 = 12구슬 → 뺄 구슬이 없다! → 3등분으로 → x=4.
// rAF 금지, 기울기·접시는 CSS transform 트랜지션(보 회전 + 접시는 끝점 좌표로 수평 유지).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface BalanceStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const NS = "http://www.w3.org/2000/svg";
const W = 360;
const H = 236;
const PVX = 180; // 받침 x
const BEAM_Y = 58; // 보 y
const ARM = 108; // 보 절반 길이
const PAN_DROP = 44; // 보 끝에서 접시까지

function sv<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}

interface SideState {
  boxes: number; // x 상자 개수
  beads: number; // 구슬 개수
}

export const balanceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BalanceStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = goalChips([
    { id: "law", label: "저울의 법칙", sub: "네 실험" },
    { id: "m1", label: "상자 무게 1", sub: "x+3=8" },
    { id: "m2", label: "상자 무게 2", sub: "3x=12" },
  ]);
  const eqRead = el("div", { class: "nw-expr" });
  const board = mboard(H + 10);
  const toast = mtoast(board);
  const stage = el("div", { class: "sd-stage" });
  board.appendChild(stage);
  const actions = el("div", { class: "ct-actions", style: "flex-wrap:wrap" });
  const helper = el("div", { class: "helper" });
  host.append(goals.el, helper, eqRead, board, actions); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ---------- SVG 골격(고정) + 동적 그룹 ---------- */
  const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "양팔저울, 버튼으로 양쪽을 함께 조작해요" });
  const defs = sv("defs");
  defs.innerHTML =
    `<linearGradient id="bl-post" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C89A5E"/><stop offset="1" stop-color="#8C6432"/></linearGradient>` +
    `<linearGradient id="bl-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8895A"/><stop offset="1" stop-color="#7E5A2E"/></linearGradient>` +
    `<linearGradient id="bl-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C2CCD8"/><stop offset=".5" stop-color="#94A2B4"/><stop offset="1" stop-color="#6E7C8C"/></linearGradient>` +
    `<linearGradient id="bl-pan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EEF6"/><stop offset="1" stop-color="#AAB8C8"/></linearGradient>` +
    `<linearGradient id="bl-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD4EC"/><stop offset=".55" stop-color="#2FA8C4"/><stop offset="1" stop-color="#0A87A3"/></linearGradient>` +
    `<radialGradient id="bl-bead" cx=".35" cy=".3" r=".95"><stop offset="0" stop-color="#FFE9A0"/><stop offset="1" stop-color="#E8A93E"/></radialGradient>`;
  svg.appendChild(defs);
  svg.appendChild(sv("ellipse", { cx: PVX, cy: H - 20, rx: 56, ry: 6, fill: "#2A3A5E", opacity: ".1" }));
  svg.appendChild(sv("path", { d: `M ${PVX} ${BEAM_Y} L ${PVX - 15} ${H - 26} L ${PVX + 15} ${H - 26} Z`, fill: "url(#bl-post)", stroke: "#7E5A2E", "stroke-width": 1.5 }));
  svg.appendChild(sv("rect", { x: PVX - 58, y: H - 28, width: 116, height: 9, rx: 4.5, fill: "url(#bl-base)", stroke: "#7E5A2E", "stroke-width": 1.3 }));
  const gBeam = sv("g");
  const gL = sv("g");
  const gR = sv("g");
  svg.append(gBeam, gL, gR);
  [gBeam, gL, gR].forEach((g) => {
    g.style.transition = "transform .55s cubic-bezier(.34,1.2,.5,1)";
  });
  stage.appendChild(svg);

  /* ---------- 상태 ---------- */
  const L: SideState = { boxes: 0, beads: 0 };
  const R: SideState = { boxes: 0, beads: 0 };
  let boxW = 5; // x 상자의 진짜 무게(감춰져 있다)
  let lawBoth = new Set<string>();
  let lawTilt = false;
  let revealed = false;
  let busy = false;

  const weight = (sd: SideState): number => sd.boxes * boxW + sd.beads;

  /** 접시 위 내용물(접시 중심 로컬 좌표). 상자는 열리면 진짜 무게 숫자를 보여준다. */
  function contents(sd: SideState, opened: boolean): string {
    let out = "";
    const items: string[] = [];
    for (let i = 0; i < sd.boxes; i++) items.push("box");
    for (let i = 0; i < sd.beads; i++) items.push("bead");
    const perRow = 4;
    items.forEach((kind, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(items.length - row * perRow, perRow);
      const col = i % perRow;
      const x = (col - (inRow - 1) / 2) * 26;
      const y = -13 - row * 23;
      if (kind === "box") {
        out +=
          `<g>` +
          `<rect x="${x - 12}" y="${y - 11}" width="24" height="22" rx="5" fill="url(#bl-box)" stroke="#076074" stroke-width="1.4"/>` +
          `<ellipse cx="${x - 5}" cy="${y - 6}" rx="4.5" ry="2" fill="#fff" opacity=".4"/>` +
          (opened
            ? `<text x="${x}" y="${y + 5.5}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#FFF">${boxW}</text>`
            : `<text x="${x}" y="${y + 5.5}" text-anchor="middle" font-size="13.5" font-weight="900" font-style="italic" fill="#FFF">x</text>`) +
          `</g>`;
      } else {
        out += `<circle cx="${x}" cy="${y - 1}" r="9" fill="url(#bl-bead)" stroke="#B3771A" stroke-width="1.3"/>`;
      }
    });
    return out;
  }

  /** 무게 차 → 기울기 갱신(접시는 보 끝점을 따라가되 수평 유지). */
  function paint(): void {
    const dw = weight(L) - weight(R);
    const tilt = Math.max(-9, Math.min(9, dw * 3.2));
    const rad = (tilt * Math.PI) / 180;
    gBeam.innerHTML =
      `<rect x="${PVX - ARM}" y="${BEAM_Y - 4}" width="${ARM * 2}" height="8" rx="4" fill="url(#bl-beam)" stroke="#4E5D6E" stroke-width="1.2"/>` +
      `<circle cx="${PVX}" cy="${BEAM_Y}" r="7" fill="#54677A" stroke="#39424E" stroke-width="1.4"/>`;
    gBeam.style.transformOrigin = `${PVX}px ${BEAM_Y}px`;
    gBeam.style.transform = `rotate(${tilt}deg)`;
    const endL = { x: PVX - ARM * Math.cos(rad), y: BEAM_Y - ARM * Math.sin(rad) };
    const endR = { x: PVX + ARM * Math.cos(rad), y: BEAM_Y + ARM * Math.sin(rad) };
    const pan = (sd: SideState, opened: boolean): string =>
      `<line x1="0" y1="0" x2="-26" y2="${PAN_DROP}" stroke="#8CA0B3" stroke-width="1.6"/>` +
      `<line x1="0" y1="0" x2="26" y2="${PAN_DROP}" stroke="#8CA0B3" stroke-width="1.6"/>` +
      `<circle cx="0" cy="0" r="3" fill="#54677A"/>` +
      `<g transform="translate(0 ${PAN_DROP})">` +
      `<ellipse cx="0" cy="4" rx="47" ry="8" fill="url(#bl-pan)" stroke="#6E7C8C" stroke-width="1.4"/>` +
      contents(sd, opened) +
      `</g>`;
    gL.innerHTML = pan(L, revealed);
    gL.style.transform = `translate(${endL.x}px, ${endL.y}px)`;
    gR.innerHTML = pan(R, false);
    gR.style.transform = `translate(${endR.x}px, ${endR.y}px)`;
    // 등식 리드아웃
    const term = (sd: SideState): string => {
      const parts: string[] = [];
      if (sd.boxes === 1) parts.push("x");
      else if (sd.boxes > 1) parts.push(`${sd.boxes}x`);
      if (sd.beads > 0) parts.push(String(sd.beads));
      if (!parts.length) parts.push("0");
      return parts.join("+");
    };
    eqRead.innerHTML = revealed ? mfmt(`x = ${boxW}`) : mfmt(`${term(L)} ${dw === 0 ? "=" : "≠"} ${term(R)}`);
  }

  /* ---------- 버튼 ---------- */
  function btn(label: string, hero: boolean, onTap: () => void): HTMLButtonElement {
    const b = el("button", { class: `ct-btn${hero ? " hero" : ""}`, text: label, attrs: { type: "button" } }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      onTap();
    });
    actions.appendChild(b);
    return b;
  }
  const clearBtns = (): void => {
    actions.innerHTML = "";
  };

  /* ---------- 0막: 저울의 법칙 실험 ---------- */
  function setupLaw(): void {
    L.boxes = 0;
    L.beads = 3;
    R.boxes = 0;
    R.beads = 3;
    lawBoth = new Set();
    lawTilt = false;
    revealed = false;
    paint();
    helper.innerHTML =
      "지금 저울은 <b>3 = 3</b> 평형이에요. 버튼으로 실험해 보세요, <b>어떤 조작이 평형을 지킬까요?</b> (한쪽만 건드리면 어떻게 될까요?)";
    clearBtns();
    btn("양쪽 +1", false, () =>
      lawOp("add", () => {
        L.beads += 1;
        R.beads += 1;
        return true;
      }),
    );
    btn("양쪽 −1", false, () =>
      lawOp("sub", () => {
        if (L.beads === 0 || R.beads === 0) {
          toast("더 뺄 구슬이 없어요");
          return false;
        }
        L.beads -= 1;
        R.beads -= 1;
        return true;
      }),
    );
    btn("양쪽 ×2", false, () =>
      lawOp("mul", () => {
        if (L.beads > 8) {
          toast("접시가 넘쳐요, ÷2로 줄여 봐요");
          return false;
        }
        L.beads *= 2;
        R.beads *= 2;
        return true;
      }),
    );
    btn("양쪽 ÷2", false, () =>
      lawOp("div", () => {
        if (L.beads % 2 || R.beads % 2 || L.beads === 0) {
          toast("반으로 딱 나눠떨어질 때만 가능해요");
          return false;
        }
        L.beads /= 2;
        R.beads /= 2;
        return true;
      }),
    );
    btn("왼쪽만 +1", false, () => {
      if (busy) return;
      busy = true;
      L.beads += 1;
      paint();
      haptic(HAPTIC.wrong);
      toast("기울었다! 한쪽만 건드리면 =가 깨져요");
      lawTilt = true;
      later(() => {
        L.beads -= 1;
        paint();
        busy = false;
        checkLaw();
      }, 1500);
    });
  }
  function lawOp(key: string, apply: () => boolean): void {
    if (busy) return;
    if (!apply()) return;
    paint();
    haptic(HAPTIC.select);
    lawBoth.add(key);
    toast("양쪽에 같은 일, 평형 그대로!");
    checkLaw();
  }
  function checkLaw(): void {
    if (goals.has("law")) return;
    if (lawBoth.size >= 3 && lawTilt) {
      goals.on("law", "발견!");
      haptic(HAPTIC.correct);
      helper.innerHTML =
        "발견! 양변에 <b>같은 수를 더하고, 빼고, 곱하고, (0이 아닌 수로) 나누면</b> 등식은 그대로예요. 이제 이 법칙으로 <b>x 상자의 무게</b>를 알아내 봐요.";
      later(setupM1, 2200);
    }
  }

  /* ---------- 1막: x+3 = 8 ---------- */
  function setupM1(): void {
    boxW = 5;
    revealed = false;
    L.boxes = 1;
    L.beads = 3;
    R.boxes = 0;
    R.beads = 8;
    paint();
    helper.innerHTML =
      "왼쪽 <b>x 상자</b>의 무게가 궁금해요. <b>상자만 남기면</b> 오른쪽이 곧 답이 되겠죠, 평형을 지키면서 구슬을 치워 봐요!";
    clearBtns();
    btn("양쪽에서 구슬 1개씩 빼기", true, () => {
      if (busy || revealed) return;
      if (L.beads === 0) return;
      L.beads -= 1;
      R.beads -= 1;
      paint();
      haptic(HAPTIC.select);
      if (L.beads === 0) later(() => reveal("m1", "x=5!", setupM2), 550);
    });
    btn("왼쪽만 빼기", false, () => {
      if (busy || revealed) return;
      busy = true;
      if (L.beads === 0) {
        busy = false;
        return;
      }
      L.beads -= 1;
      paint();
      haptic(HAPTIC.wrong);
      toast("기울었어요, 오른쪽도 똑같이 해야죠!");
      later(() => {
        L.beads += 1;
        paint();
        busy = false;
      }, 1300);
    });
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ---------- 2막: 3x = 12 ---------- */
  function setupM2(): void {
    boxW = 4;
    revealed = false;
    L.boxes = 3;
    L.beads = 0;
    R.boxes = 0;
    R.beads = 12;
    paint();
    helper.innerHTML =
      "이번엔 상자가 <b>3개</b>! 그런데 왼쪽엔 뺄 구슬이 하나도 없어요. 상자 <b>1개</b>만 남기려면 어떤 조작이 필요할까요?";
    clearBtns();
    btn("양쪽에서 구슬 1개씩 빼기", false, () => {
      toast("왼쪽엔 구슬이 없어요, 빼기로는 안 돼요!");
      haptic(HAPTIC.wrong);
    });
    btn("양쪽을 3등분하기", true, () => {
      if (busy || revealed) return;
      L.boxes = 1;
      R.beads = 4;
      paint();
      haptic(HAPTIC.select);
      later(() => reveal("m2", "x=4!", null), 550);
    });
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ---------- 상자 공개 ---------- */
  function reveal(goalId: string, sub: string, nextFn: (() => void) | null): void {
    revealed = true;
    paint();
    haptic(HAPTIC.correct);
    toast(`상자를 열어 보니, ${sub}`);
    goals.on(goalId, sub);
    if (nextFn) {
      helper.innerHTML =
        "상자만 남기니 오른쪽이 곧 답, <b>x = 5</b>! '양변에서 같은 수 빼기'가 해낸 일이에요. 다음 저울로!";
      later(nextFn, 2400);
    } else {
      helper.innerHTML =
        "<b>양변을 3으로 나누기</b>까지, 등식의 성질 네 가지를 전부 손으로 확인했어요. 방정식 풀이의 정체는 결국 <b>저울 조작</b>이랍니다!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  setupLaw();
  api.setCTA("저울 미션을 모두 끝내요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
