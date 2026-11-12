// 만화 컷 위에 얹는 HTML(말풍선, 때와 곳 상자)의 자리 계산. build.mjs 와 mock-comic.mjs 가 함께 쓴다.
//   앱의 .cut-bubble 은 (x%, y%)가 몸통의 아래 가운데다. 가운데 꼬리는 몸통 아래로 약 7px,
//   뿔 꼬리(tail left/right)는 몸통 끝에서 16px 바깥, 27px 아래에 끝이 온다(ui.css, figures.cutTailHorn).
//   폰 화면의 컷 폭(350px)을 기준으로 몸통 크기를 어림해 컷 밖으로 나가지 않는 자리를 고른다.

export const FRAME_W = 350;

export function textWidth(line) {
  let w = 0;
  for (const ch of line.replace(/<[^>]+>/g, "")) w += /[가-힣]/.test(ch) ? 11.6 : ch === " " ? 3.2 : /[0-9A-Za-z]/.test(ch) ? 7.2 : 4.8;
  return w;
}

/** b = { who: 기준점 이름, text, side?: "left" | "right"(뿔 꼬리를 강제), dx?, dy?(px 미세 조정) }
 *  돌려주는 값: { text, x, y, tail?, box }(box 는 350px 컷 기준 몸통 자리, 겹침 검사용) */
export function placeBubble(sk, b, where, warn = (m) => console.warn("  ! " + m)) {
  const a = sk.anchors[b.who];
  if (!a) throw new Error(`${where}: 기준점 '${b.who}' 가 없다`);
  const FH = FRAME_W * sk.h / sk.w;
  const ax = a.x / sk.w * FRAME_W + (b.dx ?? 0), ay = a.y / sk.h * FH + (b.dy ?? 0);
  const lines = b.text.split("<br>");
  const bw = Math.min(FRAME_W * 0.52, Math.max(84, Math.max(...lines.map(textWidth)) + 25.2));
  const bh = lines.length * 15.6 + 16.2;
  let cx = ax, by = ay - 9, tail = b.side;
  if (!tail && ax - bw / 2 < 5) tail = "left";
  else if (!tail && (ax + bw / 2 > FRAME_W - 5 || FRAME_W - ax < Math.max(84, bw) - 1)) tail = "right"; // 오른쪽 폭이 모자라면 몸통을 왼쪽으로
  if (tail === "left") { cx = ax + 16 + bw / 2; by = ay - 29; }
  if (tail === "right") { cx = ax - 16 - bw / 2; by = ay - 29; }
  const box = { l: cx - bw / 2, r: cx + bw / 2, t: by - bh, b: by };
  if (box.l < 2 || box.r > FRAME_W - 2 || box.t < 2) warn(`${where}: 말풍선 "${b.text}" 이 컷 밖으로 나간다 ${JSON.stringify(box)}`);
  // 말풍선은 left 기준으로 놓이므로 오른쪽에 남은 폭보다 넓으면 브라우저가 줄을 더 나눈다. <br> 로 줄을 직접 나눠 맞춘다.
  if (bw > Math.max(84, FRAME_W - cx) + 1) warn(`${where}: 말풍선 "${b.text}" 이 오른쪽 폭(${Math.round(FRAME_W - cx)}px)보다 넓다(${Math.round(bw)}px). <br> 로 줄을 나누거나 side: "right" 를 줄 것`);
  const out = { text: b.text, x: +(cx / FRAME_W * 100).toFixed(1), y: +(by / FH * 100).toFixed(1), box };
  if (tail) out.tail = tail;
  return out;
}

/** 때와 곳 상자의 자리(350px 컷 기준). 앱의 .comic-when 과 같은 수치: 위 10px, 옆 10px, 글자 12px, 안쪽 여백 4px 8px.
 *  컷이 이보다 좁으면 앱이 상자와 말풍선을 그림과 같은 비율로 줄이므로(ui.css .comic-art.code) 이 폭에서만 맞추면 된다. */
export function whenBox(text, pos = "tl") {
  const w = textWidth(text) * (12 / 12.5) + 16 + 3.2, h = 12 * 1.25 + 8 + 3.2;
  const l = pos === "tr" ? FRAME_W - 10 - w : 10;
  return { l, r: l + w, t: 10, b: 10 + h };
}

export const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

/** 화면 글 규칙(CLAUDE.md 콘텐츠 규칙, 만화 글 기준): 어긴 것마다 한 줄 */
export function textRules(text) {
  const out = [];
  if (/[—–]/.test(text)) out.push("대시(—, –)가 있다");
  if (/교과서/.test(text)) out.push("'교과서'가 있다");
  if (/너의|네 몸|너희/.test(text)) out.push("학생을 '너'로 부르는 말이 있다(사람의, 우리 등으로)");
  if (/이해에|그해에|그 해에/.test(text)) out.push("'이해에, 그해에'처럼 연도를 가리키기만 하는 말이 있다(연도를 글에 직접 쓴다)");
  return out;
}
