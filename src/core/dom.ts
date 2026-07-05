// 얇은 DOM 헬퍼 — 프레임워크 없이 바닐라로 화면을 조립한다.

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

// ---- 수학 유틸(엔진·인터랙션 공용, 프로토타입 계승) ----
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const round1 = (v: number): number => Math.round(v * 10) / 10;

type Child = Node | string | number | null | undefined | false;
interface Props {
  class?: string;
  text?: string;
  html?: string;
  dataset?: Record<string, string>;
  attrs?: Record<string, string | number | boolean>;
  style?: string | Partial<CSSStyleDeclaration>;
  on?: Record<string, EventListenerOrEventListenerObject>;
  [key: string]: unknown;
}

/** hyperscript-lite. el('div', {class:'x', on:{click}}, child, 'text') */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === "class") node.className = String(value);
    else if (key === "text") node.textContent = String(value);
    else if (key === "html") node.innerHTML = String(value);
    else if (key === "dataset") Object.assign(node.dataset, value as Record<string, string>);
    else if (key === "attrs") {
      for (const [a, v] of Object.entries(value as Record<string, unknown>)) node.setAttribute(a, String(v));
    } else if (key === "style") {
      if (typeof value === "string") node.setAttribute("style", value);
      else Object.assign(node.style, value as Partial<CSSStyleDeclaration>);
    } else if (key === "on") {
      for (const [ev, fn] of Object.entries(value as Record<string, EventListenerOrEventListenerObject>)) {
        node.addEventListener(ev, fn);
      }
    } else {
      // onClick 같은 직접 핸들러
      (node as unknown as Record<string, unknown>)[key] = value;
    }
  }
  appendChildren(node, children);
  return node;
}

export function appendChildren(node: Node, children: Child[]): void {
  for (const child of children) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
  }
}

export function clear(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** 레이아웃 확정 후 콜백(캔버스 크기 측정 등에 필요). */
export function afterPaint(cb: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(cb));
}

export function countUp(node: HTMLElement, to: number, dur = 900): void {
  const t0 = performance.now();
  const tick = (t: number) => {
    const p = clamp((t - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    node.textContent = String(Math.round(to * e));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
