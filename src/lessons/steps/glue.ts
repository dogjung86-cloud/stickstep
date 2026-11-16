// 과학 랩 틀(bio6/b6Lab)과 도입 틀(opener)이 함께 쓰는 붙여 쓰기(2026-11-16, 도입과 랩 글 다듬기).
// 줄바꿈이 갈라 놓으면 어색한 곳을 줄바꿈 없는 덩이(<span class="txt-glue">, white-space: nowrap)로 감싼다.
// 글자는 하나도 바꾸지 않으므로 textContent가 그대로다(검사 스크립트와 랩 로직이 글자를 대조해도 안전하다).
// 묶는 것: 숫자와 단위("12 N", "2.0 g"), "몇 g", 수 관형사와 뒤 낱말("한 방향", "다섯 가지"), 본용언과 보조 용언("남아 있는",
// "보이지 않던", "관찰해 봐요", "나타낼 수 있어요"), 식 기호 양옆("질량 ÷ 부피"), 짧은 괄호 묶음("(4개, 11개, 38개)", "방울(기포)이",
// "(나)에는"), 짧은 굵은 글("<b>레이저 쏘기</b>"). 덩이가 길면 좁은 칸(판정 이유 236px)을 넘을 수 있어 길이를 제한한다.
// 쓰는 곳: 랩 제목, 안내 글, 판정 이유, 핵심 정리, 도입 제목, 쌤의 말. 스타일은 styles/bio6.css의 .txt-glue.

const UNIT = "(?:kJ|kcal|cal|kg|mg|g|km|cm|mm|nm|μm|m|mL|L|℃|°C|K|%|kHz|Hz|s|N|J|W|V|A|Ω|pc|AU|광년|배|칸|개|번|명|초|분|시간|층|쪽|마리)";
// 뒤 낱말과 떨어지면 어색한 관형사("한 방향", "다섯 가지", "이 실험", "어떤 상태", "약 일주일")
const NUMWORD = "(?:한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|몇|여러|이|그|저|어느|어떤|무슨|각|모든|약|더)";
// 앞 낱말에 기대는 말(의존 명사와 자리 말): "일어날 때", "수용액 속", "접시 위", "더 이상"
const BOUND = "(?:때|속|것|곳|뿐|만큼|동안|위|아래|안|밖|옆|사이|이상|이하|정도)";
const AUX = "(?:있|없|보|봐|봅|주|줘|둬|두|놓|않|못)";
const wrap = (s: string): string => `<span class="txt-glue">${s}</span>`;
const visLen = (s: string): number => s.replace(/&#?\w+;/g, "x").length;

/** 글 조각(태그 밖)에만 규칙을 건다. 규칙 하나를 건 뒤 다시 나눠서 다음 규칙이 앞에서 넣은 태그를 건드리지 않게 한다.
 *  태그는 글자로 시작하는 진짜 태그만 본다(글 속의 "구리 > 철 > 유리", "0.91 < 0.92" 같은 부등호는 글로 둔다). */
const TAG = /(<\/?[A-Za-z][^>]*>)/;
function onText(html: string, re: RegExp, fn: (...m: string[]) => string): string {
  return html
    .split(TAG)
    .map((part, i) => (i % 2 ? part : part.replace(re, fn as (substring: string, ...args: unknown[]) => string)))
    .join("");
}

const RULES: Array<[RegExp, (...m: string[]) => string]> = [
  // 짧은 괄호 묶음(보이는 글 14자 이하)은 통째로 뒤 조사까지, 앞 낱말에 붙은 짧은 괄호(6자 이하)는 앞 낱말까지 함께
  [/([가-힣]*)\(([^()]{1,40})\)([가-힣]*)/g, (m, a, inner, c) => {
    if (visLen(inner) > 14) return m;
    if (a && visLen(inner) <= 6) return wrap(m); // "방울(기포)이": 앞 낱말과 괄호, 뒤 조사를 한 덩이로
    return `${a}${wrap(`(${inner})${c}`)}`; // 긴 괄호는 앞에서는 줄을 바꿀 수 있게 두고 뒤 조사만 붙인다
  }],
  // 숫자와 단위, 그 뒤에 붙은 조사까지("12 N이나", "2.0 g까지")
  [new RegExp(`(\\d[\\d.,/]*)[ \\t]+(${UNIT})(?![A-Za-z])([가-힣]*)`, "g"), (_m, n, u, c) => wrap(`${n} ${u}${c}`)],
  [/몇[ \t]+([A-Za-z℃°%]+)([가-힣]*)/g, (_m, u, c) => wrap(`몇 ${u}${c}`)],
  [new RegExp(`(^|[\\s(])(${NUMWORD})[ \\t]+([가-힣]+)`, "g"), (_m, pre, w, n) => `${pre}${wrap(`${w} ${n}`)}`],
  [new RegExp(`([가-힣]*[아어여해와워러고지])[ \\t]+(${AUX}[가-힣]*)`, "g"), (_m, a, b) => wrap(`${a} ${b}`)],
  [/([가-힣]*수)[ \t]+((?:있|없)[가-힣]*)/g, (_m, a, b) => wrap(`${a} ${b}`)],
  [new RegExp(`([가-힣]+)[ \\t]+(${BOUND}(?:[가-힣]{0,3}))(?![가-힣])`, "g"), (_m, a, b) => wrap(`${a} ${b}`)],
  [/([가-힣A-Za-z0-9]+)[ \t]([÷×=])[ \t]([가-힣A-Za-z0-9]+)/g, (_m, a, op, b) => wrap(`${a} ${op} ${b}`)],
];

/** 줄바꿈 붙여 쓰기. 태그 안과 이미 감싼 덩이 밖의 글 조각에만 건다. */
export function glue(html: string): string {
  // 짧은 굵은 글(12자 이하): 뒤에 붙은 조사가 있으면 조사까지 한 덩이("<b>다음에 갈 곳</b>을", "<b>행성(토성)</b>이었어요"),
  // 조사 없이 띄어쓰기만 있으면 굵은 글만 한 덩이("<b>레이저 쏘기</b>"). 태그 경계에서는 낱말 안이어도 줄이 바뀔 수 있어서다
  let out = html.replace(/<b>([^<]{1,12})<\/b>([가-힣]{1,4})?/g, (m, t: string, c?: string) => (c ? wrap(`<b>${t}</b>${c}`) : t.includes(" ") ? `<b class="txt-glue">${t}</b>` : m));
  for (const [re, fn] of RULES) out = onText(out, re, fn);
  return out;
}
