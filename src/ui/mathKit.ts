// mathKit — 수학 트랙 공용 킷. 수식 표기(mfmt)·넘패드·밝은 보드·목표 칩의 단일 진실 공급원.
// 표기 마이크로 마크업(MATH_GUIDE.md):
//   {a/b}   분수(가로줄 스택, a에 부호 허용: {-3/4})
//   x^n     지수(숫자 뒤 또는 닫는 괄호 뒤: 2^3, (-2)^2)
//   (+3)    부호 수 — 괄호는 회색, 부호+수는 색(+파랑 −빨강). (-{3/4})도 지원.
//   그 외   문자 그대로(× ÷ = □ | | 등). '-'는 −(U+2212)로 표시.
import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";

/* ============================== mfmt 수식 렌더 ============================== */

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pretty = (s: string): string => esc(s).replace(/-/g, "−");

/** 분수 HTML — sign은 분수 앞에 색 부호로. 분자·분모는 재귀 렌더(문자 지원). */
function fracHtml(num: string, den: string, signCls?: string): string {
  const m = num.match(/^([+-])?(.+)$/)!;
  const sign = m[1];
  const body = `<span class="mx-frac"><span class="fr-n">${fmtCore(m[2])}</span><span class="fr-d">${fmtCore(den)}</span></span>`;
  if (signCls) return body; // 부호는 바깥에서 이미 그림
  if (sign) return `<span class="${sign === "-" ? "mx-neg" : "mx-pos"}">${sign === "-" ? "−" : "+"}${body}</span>`;
  return body;
}

/** mfmt 마이크로 마크업 → HTML 문자열. */
export function mfmt(src: string): string {
  return `<span class="mx">${fmtCore(src)}</span>`;
}

/** 여는 중괄호 i에서 짝이 되는 닫는 중괄호 인덱스(중첩 인식). 없으면 -1. */
function matchBrace(src: string, i: number): number {
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") depth += 1;
    else if (src[j] === "}") {
      depth -= 1;
      if (depth === 0) return j;
    }
  }
  return -1;
}

function fmtCore(src: string): string {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    // 부호 수: ( + | - ) ( 숫자 | {분수} ) )
    if (ch === "(") {
      const m = src.slice(i).match(/^\(([+-])(\d+(?:\.\d+)?|\{\d+\/\d+\})\)/);
      if (m) {
        const cls = m[1] === "-" ? "mx-neg" : "mx-pos";
        const signGlyph = m[1] === "-" ? "−" : "+";
        let inner: string;
        if (m[2].startsWith("{")) {
          const [num, den] = m[2].slice(1, -1).split("/");
          inner = fracHtml(num, den, cls);
        } else {
          inner = pretty(m[2]);
        }
        out += `<span class="mx-par">(</span><span class="${cls}">${signGlyph}${inner}</span><span class="mx-par">)</span>`;
        i += m[0].length;
        // 뒤따르는 지수: (-2)^3
        const p = src.slice(i).match(/^\^(\d+)/);
        if (p) {
          out += `<sup>${p[1]}</sup>`;
          i += p[0].length;
        }
        continue;
      }
    }
    // 중괄호: {a/b} 숫자 분수만 분수로, 그 외({6-(3-5)} 같은 수학 중괄호)는 그룹 기호로 재귀 렌더
    if (ch === "{") {
      const close = matchBrace(src, i);
      if (close > i) {
        const body = src.slice(i + 1, close);
        const fr = body.match(/^([+-]?[0-9a-z.]+)\/([0-9a-z.]+)$/);
        if (fr) {
          out += fracHtml(fr[1], fr[2]);
        } else {
          out += `<span class="mx-par">{</span>${fmtCore(body)}<span class="mx-par">}</span>`;
        }
        i = close + 1;
        continue;
      }
    }
    // 숫자(+지수)
    if (/\d/.test(ch)) {
      const m = src.slice(i).match(/^(\d+(?:\.\d+)?)(?:\^(\d+))?/)!;
      out += pretty(m[1]);
      if (m[2]) out += `<sup>${m[2]}</sup>`;
      i += m[0].length;
      continue;
    }
    // 문자(변수 — 이탤릭, 지수 지원): x, y, a, x^2 ...
    if (/[a-z]/.test(ch)) {
      const m = src.slice(i).match(/^([a-z])(?:\^(\d+))?/)!;
      out += `<i class="mx-v">${m[1]}</i>`;
      if (m[2]) out += `<sup>${m[2]}</sup>`;
      i += m[0].length;
      continue;
    }
    // 연산 기호는 살짝 여백
    if (ch === "×" || ch === "÷" || ch === "=" || ch === "<" || ch === ">" || ch === "≥" || ch === "≤") {
      out += `<span class="mx-op">${esc(ch)}</span>`;
      i += 1;
      continue;
    }
    if (ch === "+" || ch === "-") {
      // 식 중간의 이항 연산 부호(색 없음)
      out += `<span class="mx-op">${ch === "-" ? "−" : "+"}</span>`;
      i += 1;
      continue;
    }
    out += esc(ch);
    i += 1;
  }
  return out;
}

/** mfmt를 담은 span 요소. */
export function mexpr(src: string, cls = ""): HTMLElement {
  return el("span", { class: cls, html: mfmt(src) });
}

/* ============================== 답 모델·검사 ============================== */

export type AnswerKind = "int" | "frac" | "dec";

/** 정규화 문자열 비교용 값 파싱 — "3/4" | "-3" | "2.5". */
function parseVal(s: string): { v: number; num?: number; den?: number } | null {
  s = s.trim().replace(/−/g, "-");
  if (/^[+-]?\d+\/\d+$/.test(s)) {
    const neg = s.startsWith("-");
    const [a, b] = s.replace(/^[+-]/, "").split("/").map(Number);
    if (!b) return null;
    return { v: ((neg ? -1 : 1) * a) / b, num: (neg ? -1 : 1) * a, den: b };
  }
  const f = Number(s);
  return Number.isFinite(f) ? { v: f } : null;
}

/** 값 동치 검사(분수는 값이 같으면 정답 — 기약이 아니면 isReduced=false로 알려줌). */
export function checkAnswer(
  input: string,
  expected: string | number,
): { good: boolean; reduced: boolean } {
  const a = parseVal(String(input));
  const b = parseVal(String(expected));
  if (!a || !b) return { good: false, reduced: true };
  const good = Math.abs(a.v - b.v) < 1e-9;
  let reduced = true;
  if (good && a.den != null) {
    const g = gcd(Math.abs(a.num!), a.den);
    reduced = g <= 1;
  }
  return { good, reduced };
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/* ============================== 넘패드 ============================== */

export interface AnswerPad {
  ansEl: HTMLElement;
  padEl: HTMLElement;
  /** 정규화 값: "-3" | "3/4" | "-3/4" | "2.5" | ""(미완성) */
  value(): string;
  clear(): void;
  setEnabled(b: boolean): void;
  flash(good: boolean): void;
  /** 정답 공개(오답 뒤) — 슬롯에 정답을 채워 보여준다. */
  reveal(expected: string | number): void;
}

/** 커스텀 넘패드 + 답 슬롯. 시스템 키보드 금지 원칙의 구현체. */
export function makeAnswerPad(kind: AnswerKind, onReady: (ready: boolean) => void): AnswerPad {
  let sign: 1 | -1 = 1;
  let intStr = "";
  let numStr = "";
  let denStr = "";
  let focus: "int" | "num" | "den" = kind === "frac" ? "num" : "int";
  let enabled = true;

  const signEl = el("span", { class: "sign", text: "" });
  const ansEl = el("div", { class: "mans", attrs: { role: "group", "aria-label": "답 입력" } });

  const slotInt = el("span", { class: "slot", html: `<span class="ph">?</span>` });
  const slotNum = el("span", { class: "slot", html: `<span class="ph">?</span>` });
  const slotDen = el("span", { class: "slot", html: `<span class="ph">?</span>` });

  if (kind === "frac") {
    const wrap = el("span", { class: "fracwrap" }, slotNum, el("span", { class: "fbar" }), slotDen);
    ansEl.append(signEl, wrap);
  } else {
    ansEl.append(signEl, slotInt);
  }

  const setFocus = (f: "int" | "num" | "den"): void => {
    focus = f;
    [slotInt, slotNum, slotDen].forEach((s) => s.classList.remove("focus"));
    (f === "int" ? slotInt : f === "num" ? slotNum : slotDen).classList.add("focus");
  };
  slotNum.addEventListener("click", () => enabled && setFocus("num"));
  slotDen.addEventListener("click", () => enabled && setFocus("den"));
  setFocus(focus);

  const cur = (): string => (focus === "int" ? intStr : focus === "num" ? numStr : denStr);
  const setCur = (v: string): void => {
    if (focus === "int") intStr = v;
    else if (focus === "num") numStr = v;
    else denStr = v;
  };

  function paint(): void {
    signEl.textContent = sign === -1 ? "−" : "";
    signEl.classList.toggle("neg", sign === -1);
    const put = (s: HTMLElement, v: string): void => {
      s.innerHTML = v ? esc(v) : `<span class="ph">?</span>`;
    };
    put(slotInt, intStr);
    put(slotNum, numStr);
    put(slotDen, denStr);
    onReady(ready());
  }

  function ready(): boolean {
    if (kind === "frac") return numStr.length > 0 && denStr.length > 0 && denStr !== "0";
    if (kind === "dec") return intStr.length > 0 && !intStr.endsWith(".");
    return intStr.length > 0;
  }

  function key(k: string): void {
    if (!enabled) return;
    haptic(HAPTIC.tap);
    if (k === "del") {
      const c = cur();
      if (c.length === 0 && kind === "frac" && focus === "den") setFocus("num");
      else setCur(c.slice(0, -1));
    } else if (k === "sign") {
      sign = sign === 1 ? -1 : 1;
    } else if (k === "dot") {
      const c = cur();
      if (!c.includes(".")) setCur((c || "0") + ".");
    } else if (k === "slash") {
      setFocus("den");
    } else {
      const c = cur();
      if (c.length >= 4) return;
      if (c === "0" && k !== ".") setCur(k);
      else setCur(c + k);
      // 분자 4자리 또는 명시 이동 전까지 분자에 머문다 — '/' 키가 이동 담당
    }
    paint();
  }

  const padEl = el("div", { class: "mnp", attrs: { role: "group", "aria-label": "숫자 패드" } });
  const mkKey = (label: string, k: string, cls = ""): HTMLElement => {
    const b = el("button", { class: `mnp-k ${cls}`, html: label, attrs: { type: "button", "aria-label": label } });
    b.addEventListener("click", () => key(k));
    return b;
  };
  const layout: [string, string, string][] = [
    ["1", "1", ""], ["2", "2", ""], ["3", "3", ""],
  ];
  layout.forEach(([l, k, c]) => padEl.appendChild(mkKey(l, k, c)));
  padEl.appendChild(mkKey("⌫", "del", "fn"));
  ["4", "5", "6"].forEach((d) => padEl.appendChild(mkKey(d, d)));
  padEl.appendChild(mkKey("+/−", "sign", "fn sign"));
  ["7", "8", "9"].forEach((d) => padEl.appendChild(mkKey(d, d)));
  padEl.appendChild(
    kind === "frac" ? mkKey("↓ 분모", "slash", "fn") : kind === "dec" ? mkKey("·", "dot", "fn") : el("span", {}),
  );
  padEl.appendChild(el("span", {}));
  padEl.appendChild(mkKey("0", "0"));
  padEl.appendChild(el("span", {}));

  paint();

  return {
    ansEl,
    padEl,
    value(): string {
      if (!ready()) return "";
      if (kind === "frac") return `${sign === -1 ? "-" : ""}${numStr}/${denStr}`;
      return `${sign === -1 ? "-" : ""}${intStr}`;
    },
    clear(): void {
      sign = 1;
      intStr = numStr = denStr = "";
      setFocus(kind === "frac" ? "num" : "int");
      ansEl.classList.remove("good", "bad");
      paint();
    },
    setEnabled(b: boolean): void {
      enabled = b;
      padEl.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = !b));
    },
    flash(good: boolean): void {
      ansEl.classList.remove("good", "bad");
      void ansEl.offsetWidth; // 애니메이션 재시작
      ansEl.classList.add(good ? "good" : "bad");
    },
    reveal(expected: string | number): void {
      const s = String(expected).replace(/−/g, "-");
      if (kind === "frac" && s.includes("/")) {
        const neg = s.startsWith("-");
        const [a, b] = s.replace(/^[+-]/, "").split("/");
        sign = neg ? -1 : 1;
        numStr = a;
        denStr = b;
      } else {
        const neg = s.startsWith("-");
        sign = neg ? -1 : 1;
        intStr = s.replace(/^[+-]/, "");
      }
      paint();
    },
  };
}

/* ============================== 보드·토스트·목표 칩 ============================== */

/** 밝은 모눈 보드 — 수학 랩의 무대. */
export function mboard(minH: number): HTMLElement {
  return el("div", { class: "mboard", style: `min-height:${minH}px` });
}

/** 보드 위 다크 토스트. 반환 함수로 메시지를 띄운다. */
export function mtoast(board: HTMLElement): (msg: string) => void {
  const t = el("div", { class: "mtoast" });
  board.appendChild(t);
  let timer = 0;
  return (msg: string): void => {
    t.textContent = msg;
    t.classList.add("show");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => t.classList.remove("show"), 1900);
  };
}

export interface GoalChips {
  el: HTMLElement;
  on(id: string, subText?: string): boolean; // 새로 켜졌으면 true
  count(): number;
  has(id: string): boolean;
}

/** 목표 칩(과학 랩의 pn-badges 문법, num 테마). */
export function goalChips(defs: { id: string; label: string; sub: string }[]): GoalChips {
  const host = el("div", { class: `pn-badges ${defs.length === 3 ? "force3" : defs.length === 2 ? "duo" : ""}` });
  for (const d of defs) {
    host.appendChild(
      el("div", { class: "pn-badge num", dataset: { g: d.id } }, el("b", { text: d.label }), el("span", { text: d.sub })),
    );
  }
  const got = new Set<string>();
  return {
    el: host,
    on(id: string, subText?: string): boolean {
      if (got.has(id)) return false;
      got.add(id);
      const chip = host.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
      if (chip) {
        chip.classList.add("on");
        if (subText) chip.querySelector("span")!.textContent = subText;
      }
      haptic(HAPTIC.ctaUnlock);
      return true;
    },
    count(): number {
      return got.size;
    },
    has(id: string): boolean {
      return got.has(id);
    },
  };
}

/* ============================== 수직선 미니 스트립 ============================== */

/** 드릴 오답 재생용 미니 수직선: from에서 move만큼 점프하는 화살을 CSS 트랜지션으로 보여준다. */
export function mstrip(from: number, move: number): HTMLElement {
  const lo = Math.min(0, from, from + move) - 1;
  const hi = Math.max(0, from, from + move) + 1;
  const W = 320;
  const pad = 18;
  const x = (v: number): number => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
  const y = 34;
  let ticks = "";
  for (let v = lo; v <= hi; v++) {
    const big = v === 0;
    ticks += `<line x1="${x(v)}" y1="${y - (big ? 7 : 4)}" x2="${x(v)}" y2="${y + (big ? 7 : 4)}" stroke="${big ? "#64748B" : "#C2CBD6"}" stroke-width="${big ? 2 : 1.4}"/>`;
    if (big || v === from || v === from + move)
      ticks += `<text x="${x(v)}" y="${y + 20}" text-anchor="middle" font-size="11" font-weight="700" fill="#64748B">${String(v).replace("-", "−")}</text>`;
  }
  const color = move >= 0 ? "var(--m-pos)" : "var(--m-neg)";
  const svg = el("div", {
    class: "mdr-strip",
    html:
      `<svg viewBox="0 0 ${W} 62" xmlns="http://www.w3.org/2000/svg">` +
      `<line x1="${pad - 8}" y1="${y}" x2="${W - pad + 8}" y2="${y}" stroke="#94A3B8" stroke-width="2"/>` +
      ticks +
      `<circle cx="${x(from)}" cy="${y}" r="5" fill="${color}"/>` +
      `<g class="ms-jump"><circle cx="0" cy="${y - 14}" r="6" fill="${color}" opacity=".9"/></g>` +
      `</svg>`,
  });
  const g = svg.querySelector(".ms-jump") as SVGGElement;
  g.style.transform = `translateX(${x(from)}px)`;
  g.style.transition = "transform .9s cubic-bezier(.34,1.2,.5,1)";
  window.setTimeout(() => {
    g.style.transform = `translateX(${x(from + move)}px)`;
  }, 260);
  return svg;
}
